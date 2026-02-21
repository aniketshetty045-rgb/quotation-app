import React, { useState } from 'react';
import { BusinessInfo } from '../types';

interface ChangePasswordProps {
  business: BusinessInfo;
  onUpdate: (b: BusinessInfo) => void;
  onBack: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ business, onUpdate, onBack }) => {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [msg, setMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = () => {
    if (isProcessing) return;
    if (!p1 || !p2) {
      setMsg('Please enter both passwords');
      return;
    }
    if (p1 !== p2) {
      setMsg('Passwords do not match');
      return;
    }
    
    setIsProcessing(true);
    setMsg('');
    
    setTimeout(() => {
      onUpdate({ ...business, password: p1 });
      setIsProcessing(false);
      onBack();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all p-2 hover:text-blue-500">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Password</h1>
      </div>

      <div className="flex-1 p-8 space-y-6 pt-10">
        <div className="space-y-4">
          <div className="relative">
            <input 
              type={show1 ? "text" : "password"} 
              placeholder="New password"
              value={p1}
              onChange={e => setP1(e.target.value)}
              className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] px-6 py-5 outline-none font-bold text-slate-700 dark:text-slate-300 border border-transparent focus:border-slate-200 dark:focus:border-slate-800 transition-all shadow-sm"
            />
            <button 
              onClick={() => setShow1(!show1)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 p-2 hover:text-blue-500 transition-colors"
            >
              {show1 ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="relative">
            <input 
              type={show2 ? "text" : "password"} 
              placeholder="Repeat new password"
              value={p2}
              onChange={e => setP2(e.target.value)}
              className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] px-6 py-5 outline-none font-bold text-slate-700 dark:text-slate-300 border border-transparent focus:border-slate-200 dark:focus:border-slate-800 transition-all shadow-sm"
            />
            <button 
              onClick={() => setShow2(!show2)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 p-2 hover:text-blue-500 transition-colors"
            >
              {show2 ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {msg && (
          <p className={`text-center font-bold text-sm ${msg.includes('success') ? 'text-green-500' : 'text-red-500'} animate-in fade-in slide-in-from-top-1`}>
            {msg}
          </p>
        )}
      </div>

      <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 sticky bottom-0 transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          type="button" 
          onClick={handleUpdate} 
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.25rem] font-bold text-base active:scale-95 transition-all shadow-xl tracking-widest flex items-center justify-center gap-3`}
        >
          {isProcessing && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'UPDATING...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
};

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.046m4.51-4.51A9.959 9.959 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-4.225-4.225l-4.51-4.51m0 0L3 3m10.125 10.125l-4.51-4.51m0 0L3 3" />
  </svg>
);

export default ChangePassword;
