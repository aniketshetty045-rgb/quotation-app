import React, { useState } from 'react';

const ReportDownloader: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [reportType, setReportType] = useState<string>('Quotation');
  const [customer, setCustomer] = useState<string>('');
  const [status, setStatus] = useState<string>('Status');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [activeSheet, setActiveSheet] = useState<'type' | 'status' | null>(null);

  const reportTypes = ['Quotation', 'Invoice', 'Proforma Invoice'];
  const statuses = ['In-Progress', 'Approved', 'Rejected'];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 text-slate-900 dark:text-white shadow-sm transition-colors">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all p-2 hover:text-blue-500">←</button>
        <h1 className="text-xl font-bold">Download Reports</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-32">
        <div className="space-y-4">
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Report Type</label>
              <button 
                onClick={() => setActiveSheet('type')}
                className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl p-5 text-left font-bold text-slate-700 dark:text-slate-300 p-2 hover:text-blue-500"
              >
                {reportType || 'Select Report Type'}
              </button>
           </div>

           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Customer Name</label>
              <input 
                placeholder="Customer Or Company Name"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl p-5 outline-none font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
           </div>

           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">Status</label>
              <button 
                onClick={() => setActiveSheet('status')}
                className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl p-5 text-left font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center p-2 hover:text-blue-500"
              >
                {status}
                <span className="text-xs">▼</span>
              </button>
           </div>

           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">From Date</label>
              <input 
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl p-5 outline-none font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center"
              />
           </div>

           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">To Date</label>
              <input 
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full bg-[#F4F4F5] dark:bg-slate-900 rounded-2xl p-5 outline-none font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center"
              />
           </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 z-40">
        <button 
          className="w-full py-5 bg-[rgba(34,83,207)] text-white rounded-[1.25rem] font-bold text-lg active:scale-95 transition-all shadow-xl"
        >
          Download
        </button>
      </div>

      {activeSheet && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-6 animate-in fade-in duration-300 transition-colors">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold dark:text-white">{activeSheet === 'type' ? 'Select Report Type' : `${reportType} Status`}</h3>
             </div>
             <div className="p-2">
                {(activeSheet === 'type' ? reportTypes : statuses).map(item => (
                  <button 
                    key={item} 
                    onClick={() => { if(activeSheet === 'type') setReportType(item); else setStatus(item); setActiveSheet(null); }}
                    className="w-full p-4 text-left font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 hover:text-blue-500"
                  >
                    {item}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDownloader;
