import React, { useState } from 'react';
import { ColumnSettings } from '../types';

interface ColumnHeadingEditorProps {
  settings: ColumnSettings;
  onSave: (newSettings: ColumnSettings) => void;
  onBack: () => void;
}

const ColumnHeadingEditor: React.FC<ColumnHeadingEditorProps> = ({ settings, onSave, onBack }) => {
  const [form, setForm] = useState<ColumnSettings>({ ...settings });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      onSave(form);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all p-2 hover:text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Column Heading</h1>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <LabelCard 
          icon={<TagIcon />} 
          label="Tax Label" 
          value={form.taxLabel} 
          onChange={v => setForm({ ...form, taxLabel: v })} 
        />

        <LabelCard 
          icon={<TagIcon />} 
          label="Product HSN Label" 
          value={form.hsnLabel} 
          onChange={v => setForm({ ...form, hsnLabel: v })} 
        />

        <LabelCard 
          icon={<TagIcon />} 
          label="Other Charges Label" 
          value={form.otherChargesLabel} 
          onChange={v => setForm({ ...form, otherChargesLabel: v })} 
        />

        <div className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-center justify-between border border-transparent dark:border-slate-800 shadow-sm transition-all">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
                 <TagIcon />
              </div>
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Add QTY2 Column?</span>
           </div>
           <button 
             onClick={() => setForm({...form, showQty2: !form.showQty2})}
             className={`w-14 h-8 rounded-full relative transition-colors duration-300 p-2 hover:text-blue-500 ${form.showQty2 ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
           >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 flex items-center justify-center text-[8px] font-black ${form.showQty2 ? 'translate-x-6 text-green-600' : 'text-slate-400'}`}>
                {form.showQty2 ? 'YES' : 'NO'}
              </div>
           </button>
        </div>

        {form.showQty2 && (
          <LabelCard 
            icon={<TagIcon />} 
            label="QTY2 Label" 
            value={form.qty2Label} 
            placeholder="Enter QTY2 label"
            onChange={v => setForm({ ...form, qty2Label: v })} 
          />
        )}
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 z-40 transition-colors">
        <button 
          onClick={handleUpdate} 
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.25rem] font-bold text-lg active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3`}
        >
          {isProcessing && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
};

const LabelCard: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  placeholder?: string,
  onChange: (v: string) => void 
}> = ({ icon, label, value, onChange, placeholder }) => (
  <div className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-start gap-4 border border-transparent dark:border-slate-800 shadow-sm transition-all">
    <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-1">
      {icon}
    </div>
    <div className="flex-1 space-y-1">
      <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest leading-none block">
        {label}
      </label>
      <input 
        value={value} 
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent text-[15px] font-bold text-slate-700 dark:text-slate-300 outline-none"
      />
    </div>
  </div>
);

const TagIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.41 2.58C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42l-9-9zM5.5 8.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z"/></svg>
);

export default ColumnHeadingEditor;
