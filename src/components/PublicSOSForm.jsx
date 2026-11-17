import React, { useState } from 'react';
import { 
  Send, 
  AlertTriangle, 
  LifeBuoy, 
  MapPin, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Radio
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

const QUICK_PRESETS = [
  {
    label: "ফেনী পরশুরাম (১০ জন)",
    text: "ফেনী পরশুরাম ৩ তলায় ১০ জন আটকা, বোট লাগবে দ্রুত! ২ জন বৃদ্ধ ও ১ জন গর্ভবতী আছেন।"
  },
  {
    label: "নোয়াখালী কোম্পানীগঞ্জ (১৫ জন)",
    text: "Noakhali Companiganj Char Elahi te 15 jon pani bondi. 3 tola school chade ashi, shukna khabar ar drinking water nai!"
  },
  {
    label: "কুমিল্লা বুড়িচং (৮ জন)",
    text: "বুড়িচং গোমতী বাঁধ ভেঙ্গে পানি ঢুকছে, ৮ জন বাচ্চা ও পরিবার সহ পানিবন্দি, লাইফ জ্যাকেট দরকার!"
  },
  {
    label: "সিলেট গোয়াইনঘাট (১২ জন)",
    text: "Sylhet Gowainghat Jaflong road submerged, 12 people trapped on rooftop, need emergency rescue boat."
  }
];

export default function PublicSOSForm({ onSubmitSOS }) {
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sounds.playSonar();

    const res = await onSubmitSOS(message.trim(), senderName.trim() || 'Public Web User');
    setIsSubmitting(false);

    if (res && res.success) {
      setLastSubmission(res.data);
      setMessage('');
    }
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl font-mono text-slate-200 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              Public Emergency SOS Dispatch Bar
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700/60 font-bold">
                No Login Required
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Type or speak in Bangla (বাংলা), Banglish, or English. Gemini AI automatically extracts location, people, and dispatch priority.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="pt-3 pb-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Demo Presets:
        </span>
        {QUICK_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              sounds.playClick();
              setMessage(preset.text);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/40 hover:border-cyan-500 transition cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="relative">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="জরুরী বার্তা লিখুন... e.g. 'ফেনী পরশুরাম ৩ তলায় ১০ জন আটকা, বোট লাগবে দ্রুত' or 'Noakhali Companiganj 20 people trapped'"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 pr-28 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
          />
          <div className="absolute right-2.5 bottom-3.5">
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Parsing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SOS</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span>Optional Contact / Name:</span>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Rahim (+8801...)"
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-200 outline-none focus:border-slate-600"
            />
          </div>
          <span className="text-[10px] text-slate-500">
            Protected by ClimateSphere AI • Instant WebSocket Alert
          </span>
        </div>
      </form>

      {/* Last Submission Feedback Card */}
      {lastSubmission && (
        <div className="mt-3 p-3 bg-slate-900/90 border border-emerald-500/50 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SOS Report #{lastSubmission.id} Parsed & Broadcasted to Rescuers</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-bold border border-red-800">
              Severity: {lastSubmission.severity_score}/5 ({lastSubmission.priority_level})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Extracted Location:</span>
              <div className="font-bold text-white truncate">{lastSubmission.location}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">People Count:</span>
              <div className="font-bold text-cyan-300">{lastSubmission.people_count} Civilians</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">District:</span>
              <div className="font-bold text-slate-200">{lastSubmission.district}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Critical Needs:</span>
              <div className="font-bold text-amber-300 truncate">
                {lastSubmission.critical_needs?.join(', ') || 'Rescue Boat'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
