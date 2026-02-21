import React, { useState, useEffect } from 'react';

interface GeminiKeyEditorProps {
  onBack: () => void;
  onSave: () => void;
}

const GeminiKeyEditor: React.FC<GeminiKeyEditorProps> = ({ onBack, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    
    setTimeout(() => {
      setIsProcessing(false);
      onSave();
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
        <h1 className="text-xl font-bold tracking-tight">Gemini API Key</h1>
      </div>

      <div className="flex-1 p-8 space-y-6 pt-10 overflow-y-auto no-scrollbar pb-32">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            To use AI features like "Magic Import" or "AI Suggest" in the Android app, you need to provide your own Gemini API Key.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
             <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">How to get a key?</p>
             <p className="text-xs text-blue-500 dark:text-blue-300 leading-relaxed">
                Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-black">Google AI Studio</a> to create a free API key.
             </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2">Your API Key</label>
            <input 
              type="password"
              placeholder="Paste your API key here..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.25rem] px-6 py-5 outline-none font-bold text-slate-700 dark:text-slate-300 border border-transparent focus:border-slate-200 dark:focus:border-slate-800 transition-all shadow-sm"
            />
          </div>
          
          <p className="text-[10px] text-slate-400 italic px-2">
            * This key is stored only on your device and is used to call Gemini API directly.
          </p>
        </div>
      </div>

      <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 sticky bottom-0 transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          type="button" 
          onClick={handleSave} 
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.25rem] font-bold text-base active:scale-95 transition-all shadow-xl tracking-widest flex items-center justify-center gap-3`}
        >
          {isProcessing && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'SAVING...' : 'Save API Key'}
        </button>
      </div>
    </div>
  );
};

export default GeminiKeyEditor;
