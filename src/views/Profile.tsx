import React, { useState, useMemo, useEffect } from 'react';
import { COUNTRIES, Country } from '../constants';
import { BusinessInfo } from '../types';

interface ProfileProps {
  business: BusinessInfo;
  onUpdate: (b: BusinessInfo) => void;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ business, onUpdate, onBack, onLogout, onNavigate }) => {
  const [form, setForm] = useState<BusinessInfo>({ ...business });
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setForm({ ...business });
  }, [business]);

  const selectedCountry = useMemo(() => {
    const found = COUNTRIES.find(c => form.phone.startsWith(c.code));
    return found || COUNTRIES.find(c => c.name === 'India') || COUNTRIES[0];
  }, [form.phone]);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) || 
      c.code.includes(searchCountry)
    );
  }, [searchCountry]);

  const handleCountrySelect = (c: Country) => {
    const rawNumber = form.phone.replace(selectedCountry.code, '').trim();
    setForm({ ...form, phone: c.code + ' ' + rawNumber });
    setShowCountryModal(false);
    setSearchCountry('');
  };

  const handleSave = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      onUpdate(form);
      setIsProcessing(false);
      onBack();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center justify-between sticky top-0 z-50 transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="text-slate-900 dark:text-white active:scale-90 transition-all p-2 hover:text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Profile</h1>
        </div>
        <button 
          type="button" 
          onClick={onLogout} 
          className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em] opacity-90 p-2 hover:text-blue-500 transition-colors"
        >
          LOGOUT
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-10 px-6 flex flex-col items-center">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg mb-4">
             <img 
               src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aniket&backgroundColor=FFD700" 
               alt="User Avatar" 
               className="w-full h-full object-cover bg-amber-100"
             />
          </div>
          <button onClick={onLogout} className="text-red-500 font-bold text-sm p-2 hover:text-blue-500 transition-colors">Logout</button>
        </div>

        <div className="w-full space-y-4">
          <div className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] px-6 py-5 border border-transparent dark:border-slate-800">
             <input 
               value={form.contactPerson} 
               onChange={e => setForm({...form, contactPerson: e.target.value})}
               placeholder="Full Name"
               className="w-full bg-transparent text-[15px] font-bold text-slate-700 dark:text-slate-300 outline-none"
             />
          </div>

          <div className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] px-6 py-5 border border-transparent dark:border-slate-800 opacity-60">
             <input 
               value={form.email} 
               readOnly
               placeholder="Email Address"
               className="w-full bg-transparent text-[15px] font-bold text-slate-400 dark:text-slate-500 outline-none"
             />
          </div>

          <div className="flex items-center gap-3">
             <button 
               type="button" 
               onClick={() => setShowCountryModal(true)}
               className="flex items-center gap-2 px-5 h-[72px] bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] border border-transparent dark:border-slate-800 shadow-sm active:bg-slate-100 transition-all p-2 hover:text-blue-500"
             >
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span className="text-[15px] font-bold text-slate-700 dark:text-slate-300">{selectedCountry.code}</span>
                <span className="text-[8px] text-slate-400">▼</span>
             </button>
             
             <div className="flex-1 bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] px-6 h-[72px] flex flex-col justify-center border border-transparent dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest">Mobile</span>
                <input 
                 type="number"
                 value={form.phone.replace(selectedCountry.code, '').trim()} 
                 onChange={e => setForm({...form, phone: selectedCountry.code + ' ' + e.target.value})} 
                 className="w-full bg-transparent text-[15px] font-bold text-slate-700 dark:text-slate-300 outline-none"
                />
             </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

          <button 
            onClick={() => onNavigate('change_password')}
            className="w-full flex items-center justify-between p-6 bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl active:bg-slate-100 transition-colors group p-2 hover:text-blue-500"
          >
             <div className="flex items-center gap-4">
                <span className="text-xl">🔑</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Change Password</span>
             </div>
             <span className="text-slate-400 group-active:translate-x-1 transition-transform">→</span>
          </button>

          <button 
            onClick={() => onNavigate('delete_account')}
            className="w-full flex items-center justify-between p-6 bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl active:bg-slate-100 transition-colors group p-2 hover:text-blue-500"
          >
             <div className="flex items-center gap-4">
                <span className="text-xl">👤❌</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Delete account</span>
             </div>
             <span className="text-slate-400 group-active:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 transition-colors border-t border-slate-50 dark:border-slate-900">
        <button 
          type="button" 
          onClick={handleSave} 
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.25rem] font-bold text-base active:scale-95 transition-all shadow-xl tracking-wider flex items-center justify-center gap-3`}
        >
          {isProcessing && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'Updating...' : 'Save changes'}
        </button>
      </div>

      {showCountryModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end animate-in fade-in duration-200">
           <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] flex flex-col h-[80vh] shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-10">
                 <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Select Country</h3>
                 <button onClick={() => { setShowCountryModal(false); setSearchCountry(''); }} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 p-2 hover:text-blue-500">✕</button>
              </div>

              <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center px-6 py-4 border border-slate-100 dark:border-slate-700 transition-colors">
                   <input 
                    autoFocus
                    placeholder="Search country..." 
                    value={searchCountry}
                    onChange={e => setSearchCountry(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none"
                   />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                {filteredCountries.map(c => (
                  <button 
                    key={c.name}
                    onClick={() => handleCountrySelect(c)}
                    className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 p-2 hover:text-blue-500"
                  >
                    <span className="text-3xl leading-none">{c.flag}</span>
                    <span className="flex-1 text-left font-bold text-slate-700 dark:text-slate-300">{c.name}</span>
                    <span className="font-black text-slate-400 text-xs">{c.code}</span>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
