import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ManualOverrideModal({
  isOpen,
  onClose,
  villages,
  onApplyOverride
}) {
  const [overrideList, setOverrideList] = useState([...villages]);

  if (!isOpen) return null;

  const moveUp = (index) => {
    if (index === 0) return;
    sounds.playClick();
    const updated = [...overrideList];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setOverrideList(updated);
  };

  const moveDown = (index) => {
    if (index === overrideList.length - 1) return;
    sounds.playClick();
    const updated = [...overrideList];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setOverrideList(updated);
  };

  const handleSave = () => {
    sounds.playDispatch();
    onApplyOverride(overrideList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl font-mono text-slate-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <SlidersHorizontal className="w-5 h-5" />
            <span>COMMANDER MANUAL PRIORITY OVERRIDE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Manual reordering overrides automated CVRP heuristics. Fleet dispatches will strictly follow your specified queue.
          </span>
        </div>

        {/* Priority List with Up/Down buttons */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {overrideList.map((v, idx) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">
                  #{idx + 1}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-100">{v.id}: {v.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Pop: {v.remainingPop} | Rise: {v.waterRiseCmH}cm/h | {v.urgency?.badge || 'Urgent'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveUp(idx)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title="Move Priority Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === overrideList.length - 1}
                  onClick={() => moveDown(idx)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  title="Move Priority Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/50"
          >
            <Check className="w-4 h-4" /> Apply Override & Re-route
          </button>
        </div>
      </div>
    </div>
  );
}
