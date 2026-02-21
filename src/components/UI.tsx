import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all border border-transparent dark:border-slate-800 ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const PillInput: React.FC<{ 
  label?: string, 
  value: any, 
  onChange: (v: string) => void, 
  type?: string, 
  placeholder?: string,
  className?: string,
  suffix?: string,
  isTextArea?: boolean,
  icon?: React.ReactNode,
  readOnly?: boolean,
  error?: string
}> = ({ label, value, onChange, type = 'text', placeholder, className = '', suffix, isTextArea, icon, readOnly, error }) => (
  <div className={`space-y-2 ${className}`}>
    {label && <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-4 uppercase tracking-widest">{label}</label>}
    <div className={`relative flex items-center ${error ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/50 border shadow-[0_0_0_1px_rgba(239,68,68,0.1)]' : 'bg-[#F4F4F4] dark:bg-slate-800 border-transparent border'} rounded-[1rem] px-5 py-4 ${readOnly ? 'opacity-70' : ''} transition-all min-h-[56px]`}>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          readOnly={readOnly}
          className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value === 0 && type === 'number' ? '' : value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 appearance-none"
        />
      )}
      {icon && <div className="ml-2 text-slate-400 dark:text-slate-500">{icon}</div>}
      {suffix && <span className="text-slate-400 dark:text-slate-500 font-bold ml-2">{suffix}</span>}
    </div>
    {error && <p className="text-[10px] font-black text-red-500 ml-5 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

export const FAB: React.FC<{ onClick: () => void, label: string }> = ({ onClick, label }) => (
  <button 
    onClick={onClick}
    type="button"
    className="fixed bottom-10 right-6 bg-[#92C5F9] text-white px-6 py-5 rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all z-[60] min-w-[120px]"
  >
    <span className="text-[10px] font-black uppercase tracking-widest leading-none">ADD</span>
    <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1.5">{label}</span>
  </button>
);

export const SectionBar: React.FC<{ title: string, onAdd: () => void }> = ({ title, onAdd }) => (
  <div 
    className="bg-[#F4F4F4] dark:bg-slate-800 rounded-2xl flex justify-between items-center px-6 py-5 active:scale-[0.98] transition-all cursor-pointer shadow-sm border border-slate-100 dark:border-slate-700 group" 
    onClick={onAdd}
  >
    <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</h3>
    <div className="w-10 h-10 bg-white dark:bg-slate-700 text-black dark:text-white rounded-xl flex items-center justify-center text-2xl font-bold group-hover:rotate-90 transition-transform shadow-sm border border-slate-100 dark:border-slate-600">
      +
    </div>
  </div>
);
