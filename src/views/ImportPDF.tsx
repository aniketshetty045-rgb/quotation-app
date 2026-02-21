import React, { useState, useEffect } from 'react';
import { parsePdfWithGemini } from '../services/gemini';

interface ImportPDFProps {
  onBack: () => void;
  onImport: (data: any) => void;
  initialType?: string;
}

const ImportPDF: React.FC<ImportPDFProps> = ({ onBack, onImport, initialType = 'Quotation' }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docType, setDocType] = useState(initialType);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 95) return 95; // Wait for actual API response
          return p + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startParsing = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const base64 = await fileToBase64(selectedFile);
      const data = await parsePdfWithGemini(base64, docType);
      setProgress(100);
      setTimeout(() => {
        setExtractedData(data);
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      console.error("PDF Parsing Error:", err);
      setError(`Import failed: ${err.message || "Unknown error"}. Ensure you have internet access and a valid API key.`);
      setIsProcessing(false);
    }
  };

  const handleFinalize = () => {
    if (extractedData) {
      onImport({ ...extractedData, docType: docType.toLowerCase().replace(' ', '_') });
    }
  };

  if (extractedData) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
          <button type="button" onClick={() => setExtractedData(null)} className="active:scale-90 transition-all p-2">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Review Extraction</h1>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-32">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-800">
             <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Extracted Client</h3>
             <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{extractedData.customer?.name || "Unknown"}</p>
             <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{extractedData.customer?.companyName || 'No Company Found'}</p>
          </div>

          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Extracted Items ({extractedData.items?.length || 0})</h3>
             {extractedData.items?.map((it: any, i: number) => (
               <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center border border-transparent dark:border-slate-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-black text-slate-800 dark:text-slate-200 uppercase truncate text-sm">{it.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Qty: {it.quantity} @ {it.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{(it.quantity * it.price).toLocaleString()}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
             <div className="flex justify-between items-center px-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{extractedData.totals?.grandTotal?.toLocaleString() || 0}</span>
             </div>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 sticky bottom-0">
          <button 
            onClick={handleFinalize}
            className="w-full py-5 rounded-[1.5rem] bg-blue-600 text-white font-black text-base tracking-widest uppercase active:scale-95 transition-all shadow-2xl"
          >
            CONFIRM & IMPORT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all p-2 hover:text-blue-500">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Import PDF</h1>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar pb-32">
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl mx-auto mb-6">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">Magic Import</h2>
          <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            Our AI will automatically extract items, customers, and totals.
          </p>
        </div>

        <section className="space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Mapping Target</label>
           <div className="grid grid-cols-2 gap-3">
             {['Quotation', 'Invoice'].map(type => (
               <button 
                 key={type}
                 disabled={isProcessing}
                 onClick={() => setDocType(type)}
                 className={`py-4 rounded-2xl text-xs font-black uppercase tracking-tight border-2 transition-all active:scale-95 ${docType === type ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-xl' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-transparent hover:border-slate-200'}`}
               >
                 {type}
               </button>
             ))}
           </div>
        </section>

        <section className="flex-1 flex flex-col gap-6">
          <div 
            onClick={triggerFileInput}
            className={`relative w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all active:scale-[0.98] group ${selectedFile ? 'border-blue-500/30 bg-blue-50/10' : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 bg-slate-50/50 dark:bg-slate-900/50'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pdf,application/pdf" 
              onChange={handleFileChange} 
              disabled={isProcessing} 
            />
            
            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${isProcessing ? 'animate-pulse scale-90' : 'group-hover:scale-110'} ${selectedFile ? 'bg-blue-600 text-white shadow-2xl rotate-12' : 'bg-white dark:bg-slate-800 text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700'}`}>
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
            </div>
            
            <div className="text-center px-8">
              <p className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-base leading-tight">
                {selectedFile ? selectedFile.name : 'Choose PDF'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Max 10MB'}
              </p>
            </div>

            {selectedFile && !isProcessing && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="absolute top-6 right-6 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-red-500 border border-slate-100 dark:border-slate-700"
              >✕</button>
            )}
          </div>

          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
        </section>

        {isProcessing && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Extraction...</span>
                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                 <div className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Reading line items & business details</p>
           </div>
        )}
      </div>

      <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 sticky bottom-0 transition-colors shadow-[0_-15px_40px_rgba(0,0,0,0.08)] z-[60]">
        <button 
          onClick={startParsing}
          disabled={!selectedFile || isProcessing}
          className={`w-full py-5 rounded-[1.5rem] font-black text-base tracking-widest uppercase active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 ${!selectedFile || isProcessing ? 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'bg-blue-600 text-white ring-8 ring-blue-500/10'}`}
        >
          {isProcessing ? 'PARSING...' : 'EXTRACT DATA'}
        </button>
      </div>
    </div>
  );
};

export default ImportPDF;
