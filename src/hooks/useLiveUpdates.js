import { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../utils/soundEffects';

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000/ws/live-feed';

export function useLiveUpdates() {
  const [sosReports, setSosReports] = useState([]);
  const [floodZones, setFloodZones] = useState([]);
  const [stats, setStats] = useState({
    total_reports: 0,
    pending: 0,
    dispatched: 0,
    resolved: 0,
    critical_severity: 0,
    high_severity: 0,
    total_people_at_risk: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeToast, setActiveToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch initial SOS Reports
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sos/list?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setSosReports(data);
      }
    } catch (err) {
      console.warn('Failed to fetch SOS reports:', err);
    }
  }, []);

  // Fetch Flood Zones with ML scores
  const fetchZones = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/risk/zones`);
      if (res.ok) {
        const data = await res.json();
        setFloodZones(data);
      }
    } catch (err) {
      console.warn('Failed to fetch flood zones:', err);
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sos/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    }
  }, []);

  // Show Toast
  const triggerToast = useCallback((msg, type = 'info') => {
    setActiveToast({ msg, type, id: Date.now() });
    setTimeout(() => {
      setActiveToast((current) => (current?.msg === msg ? null : current));
    }, 5500);
  }, []);

  // Connect WebSocket
  useEffect(() => {
    let isMounted = true;

    const connectWS = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      try {
        const ws = new WebSocket(WS_BASE);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setConnectionStatus('connected');
          console.log('[WebSocket] Live emergency stream connected.');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'NEW_SOS_REPORT') {
              const newReport = data.data;
              setSosReports((prev) => {
                // Prepend or replace if exists
                const filtered = prev.filter((r) => r.id !== newReport.id);
                return [newReport, ...filtered];
              });
              sounds.playWarning();
              triggerToast(
                `🚨 [NEW SOS] ${newReport.location}: ${newReport.people_count} people trapped (${newReport.priority_level})`,
                'warning'
              );
              fetchStats();
            } else if (data.event === 'SOS_STATUS_UPDATED') {
              const updatedReport = data.data;
              setSosReports((prev) =>
                prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
              );
              triggerToast(
                `Status Updated: Report #${updatedReport.id} is now ${updatedReport.status}`,
                'info'
              );
              fetchStats();
            } else if (data.event === 'FLOOD_RISK_UPDATED') {
              setFloodZones(data.data);
              triggerToast('Hydrological Risk Levels Updated by ML Engine', 'info');
            }
          } catch (e) {
            console.error('Error handling websocket message:', e);
          }
        };

        ws.onerror = (err) => {
          console.warn('[WebSocket] Error occurred:', err);
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setConnectionStatus('reconnecting');
          // Reconnect after 3.5 seconds
          reconnectTimeoutRef.current = setTimeout(connectWS, 3500);
        };
      } catch (err) {
        console.warn('[WebSocket] Init failed:', err);
        setConnectionStatus('reconnecting');
        reconnectTimeoutRef.current = setTimeout(connectWS, 4000);
      }
    };

    connectWS();

    // Initial API loads
    Promise.all([fetchReports(), fetchZones(), fetchStats()]).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    // Fallback polling every 8s
    const pollInterval = setInterval(() => {
      fetchReports();
      fetchZones();
      fetchStats();
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchReports, fetchZones, fetchStats, triggerToast]);

  // Submit Public SOS
  const submitSOS = async (message, senderInfo = 'Public Web User') => {
    try {
      const res = await fetch(`${API_BASE}/api/sos/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, source: 'WEB', sender_info: senderInfo })
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(`SOS Submitted successfully for ${data.location}!`, 'success');
        sounds.playDispatch();
        fetchReports();
        fetchStats();
        return { success: true, data };
      } else {
        const err = await res.json();
        triggerToast(`Error submitting SOS: ${err.detail || 'Failed'}`, 'error');
        return { success: false, error: err };
      }
    } catch (err) {
      triggerToast(`Network error submitting SOS: ${err.message}`, 'error');
      return { success: false, error: err };
    }
  };

  // Update Status
  const updateStatus = async (reportId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/sos/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setSosReports((prev) => prev.map((r) => (r.id === reportId ? data : r)));
        sounds.playPickup();
        fetchStats();
        return { success: true, data };
      }
    } catch (err) {
      triggerToast(`Failed to update status: ${err.message}`, 'error');
    }
    return { success: false };
  };

  // Simulate Telegram SOS
  const simulateTelegramSOS = async (text, username = 'vol_telegram_bot') => {
    try {
      const payload = {
        update_id: Math.floor(Math.random() * 100000),
        message: {
          message_id: Math.floor(Math.random() * 1000),
          from: { id: 887766, first_name: 'Volunteer', username },
          chat: { id: 887766, type: 'private' },
          text
        }
      };
      const res = await fetch(`${API_BASE}/api/webhook/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        triggerToast(`Telegram Webhook simulated: ${data.reply}`, 'success');
        return data;
      }
    } catch (err) {
      console.warn('Error simulating Telegram webhook:', err);
    }
  };

  return {
    sosReports,
    floodZones,
    stats,
    connectionStatus,
    activeToast,
    isLoading,
    submitSOS,
    updateStatus,
    simulateTelegramSOS,
    refreshAll: () => {
      fetchReports();
      fetchZones();
      fetchStats();
    }
  };
}
