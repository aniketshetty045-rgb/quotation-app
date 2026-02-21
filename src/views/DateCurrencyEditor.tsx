import React, { useState, useMemo } from 'react';
import { GeneralSettings } from '../types';
import { DATE_FORMATS, COUNTRIES } from '../constants';

interface DateCurrencyEditorProps {
  settings: GeneralSettings;
  onSave: (newSettings: GeneralSettings) => void;
  onBack: () => void;
}

const DateCurrencyEditor: React.FC<DateCurrencyEditorProps> = ({ settings, onSave, onBack }) => {
  const [form, setForm] = useState<GeneralSettings>({ ...settings });
  const [activeBottomSheet, setActiveBottomSheet] = useState<'date' | 'country' | 'symbol' | 'name' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const uniqueSymbols = useMemo(() => Array.from(new Set(COUNTRIES.map(c => c.currencySymbol))), []);
  const uniqueNames = useMemo(() => Array.from(new Set(COUNTRIES.map(c => c.currencyName))), []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    const lowerQuery = searchQuery.toLowerCase();
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.currencyName.toLowerCase().includes(lowerQuery) ||
      c.code.includes(lowerQuery)
    );
  }, [searchQuery]);

  const handleCountrySelect = (c: typeof COUNTRIES[0]) => {
    setForm({ 
      ...form, 
      country: c.name, 
      currencySymbol: c.currencySymbol, 
      currencyName: c.currencyName 
    });
    setActiveBottomSheet(null);
    setSearchQuery('');
  };

  const handleCloseSheet = () => {
    setActiveBottomSheet(null);
    setSearchQuery('');
  };

  const formatDatePreview = (format: string) => {
    const day = "14";
    const month = "02";
    const year = "2026";
    const monthName = "Feb";

    switch (format) {
      case 'dd/MM/yyyy': return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy': return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd': return `${year}-${month}-${day}`;
      case 'dd-MMM-yyyy': return `${day}-${monthName}-${year}`;
      default: return `${day}/${month}/${year}`;
    }
  };

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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 text-slate-900 dark:text-white shadow-sm transition-colors">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all text-xl font-bold p-2 hover:text-blue-500">←</button>
        <h1 className="text-xl font-bold tracking-tight">Date & Currency Settings</h1>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <div 
          onClick={() => setActiveBottomSheet('date')}
          className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-start gap-4 border border-transparent dark:border-slate-800 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-1">
             <CalendarIcon />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest leading-none block">Date Format</label>
            <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300">{form.dateFormat} ({formatDatePreview(form.dateFormat)})</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveBottomSheet('country')}
          className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-start gap-4 border border-transparent dark:border-slate-800 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-1">
             <FlagIcon />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest leading-none block">Business Country</label>
            <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300">
               {form.country}
            </p>
          </div>
        </div>

        <div className="h-4" />
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Currency Configuration</h3>

        <div 
          onClick={() => setActiveBottomSheet('symbol')}
          className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-start gap-4 border border-transparent dark:border-slate-800 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-1">
             <DollarIcon />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest leading-none block">Currency Symbol</label>
            <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300">{form.currencySymbol}</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveBottomSheet('name')}
          className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-start gap-4 border border-transparent dark:border-slate-800 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-1">
             <TextIcon />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest leading-none block">Currency Name</label>
            <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300">{form.currencyName}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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

      {activeBottomSheet === 'date' && (
        <BottomSheet title="Select Date Format" onClose={handleCloseSheet}>
           <div className="p-2 space-y-1">
             {DATE_FORMATS.map(f => (
               <button 
                 key={f} 
                 onClick={() => { setForm({...form, dateFormat: f}); setActiveBottomSheet(null); }}
                 className="w-full p-5 text-left text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex justify-between items-center transition-all p-2 hover:text-blue-500"
               >
                 <div className="flex flex-col items-start">
                   <span className="text-[15px]">{f}</span>
                   <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{formatDatePreview(f)}</span>
                 </div>
                 {form.dateFormat === f && <span className="text-blue-500 font-bold">✓</span>}
               </button>
             ))}
           </div>
        </BottomSheet>
      )}

      {activeBottomSheet === 'country' && (
        <BottomSheet title="Select Country" onClose={handleCloseSheet}>
           <div className="px-6 pb-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center px-5 py-4 border border-slate-100 dark:border-slate-700 transition-colors">
                <span className="mr-3 opacity-30 text-lg">🔍</span>
                <input 
                  autoFocus
                  placeholder="Search country or currency..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-1">
             {filteredCountries.length > 0 ? (
               filteredCountries.map(c => (
                 <button 
                   key={c.name} 
                   onClick={() => handleCountrySelect(c)}
                   className="w-full p-5 text-left text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl flex items-center gap-4 transition-colors p-2 hover:text-blue-500"
                 >
                   <span className="text-2xl w-8 text-center">{c.flag}</span>
                   <span className="flex-1">{c.name} ({c.currencyName})</span>
                   {form.country === c.name && <span className="text-blue-500 font-bold">✓</span>}
                 </button>
               ))
             ) : (
               <div className="py-10 text-center text-slate-400 font-medium">
                 No countries found for "{searchQuery}"
               </div>
             )}
           </div>
        </BottomSheet>
      )}

      {activeBottomSheet === 'symbol' && (
        <BottomSheet title="Select Currency Symbol" onClose={handleCloseSheet}>
           <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto no-scrollbar">
             {uniqueSymbols.map(s => (
               <button 
                 key={s} 
                 onClick={() => { setForm({...form, currencySymbol: s}); setActiveBottomSheet(null); }}
                 className={`h-16 rounded-2xl font-bold text-lg flex items-center justify-center transition-all p-2 hover:text-blue-500 ${form.currencySymbol === s ? 'bg-blue-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
               >
                 {s}
               </button>
             ))}
           </div>
        </BottomSheet>
      )}

      {activeBottomSheet === 'name' && (
        <BottomSheet title="Select Currency Name" onClose={handleCloseSheet}>
           <div className="p-4 space-y-1 overflow-y-auto no-scrollbar">
             {uniqueNames.map(n => (
               <button 
                 key={n} 
                 onClick={() => { setForm({...form, currencyName: n}); setActiveBottomSheet(null); }}
                 className={`w-full p-5 text-left font-bold text-base rounded-2xl flex justify-between items-center transition-all p-2 hover:text-blue-500 ${form.currencyName === n ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50'}`}
               >
                 {n}
                 {form.currencyName === n && <span className="font-bold">✓</span>}
               </button>
             ))}
           </div>
        </BottomSheet>
      )}
    </div>
  );
};

const BottomSheet: React.FC<{ title: string, children: React.ReactNode, onClose: () => void }> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] bg-black/40 flex items-end animate-in fade-in duration-300 transition-colors">
    <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden pb-10 max-h-[90vh] flex flex-col transition-colors">
      <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col items-center shrink-0">
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 cursor-pointer" onClick={onClose}></div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
    <div className="absolute inset-0 -z-10" onClick={onClose}></div>
  </div>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
);
const FlagIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg>
);
const DollarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-12c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3m0-3v3m0 12v3" /></svg>
);
const TextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
);

export default DateCurrencyEditor;
