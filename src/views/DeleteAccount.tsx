import React from 'react';

interface DeleteAccountProps {
  onBack: () => void;
  onDelete: () => void;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ onBack, onDelete }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-6 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all text-xl p-2 hover:text-blue-500">
          ←
        </button>
        <h1 className="text-xl font-bold uppercase tracking-widest">Delete Account</h1>
      </div>

      <div className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-8">
        <div className="text-red-500 animate-bounce">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
          </svg>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
            Deleting your account is permanent.
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Your profile, products, customers, quotations will be permanently deleted.
          </p>
        </div>
      </div>

      <div className="p-8 flex gap-4 bg-white dark:bg-slate-950 transition-colors border-t border-slate-50 dark:border-slate-900">
        <button 
          onClick={onBack}
          className="flex-1 py-5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-[1.2rem] font-bold text-lg active:scale-95 transition-all p-2 hover:text-blue-500"
        >
          Cancel
        </button>
        <button 
          onClick={() => { if(confirm("FINAL WARNING: Delete everything?")) onDelete(); }}
          className="flex-1 py-5 bg-[rgba(34,83,207)] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 transition-all shadow-xl"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
