import React, { useState } from 'react';
import { DocType, Document } from '../types';
import { FAB, PillInput } from '../components/UI';
import { DeleteConfirmModal } from './Modals';

interface ListProps {
  type: DocType;
  state: any;
  updateState: any;
  onSelect: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onCreate: () => void;
}

const List: React.FC<ListProps> = ({ type, state, onSelect, onEdit, onDelete, onBack, onCreate }) => {
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'copy_pdf'>('pdf');

  const docs = state.documents.filter((d: Document) => 
    d.type === type && (
      d.docNumber.toLowerCase().includes(search.toLowerCase()) || 
      (state.customers.find((c: any) => c.id === d.customerId)?.name || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  // Filter based on active tab
  // If 'copy_pdf' is selected, show documents that have '-COPY' in their docNumber
  // If 'pdf' is selected, show documents that don't have '-COPY' in their docNumber
  const filteredDocs = docs.filter((d: Document) => {
    if (activeTab === 'copy_pdf') return d.docNumber.includes('-COPY');
    return !d.docNumber.includes('-COPY');
  });

  const formatDate = (dateStr: string, format: string) => {
    let date: Date;
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      date = new Date(Number(y), Number(m) - 1, Number(d));
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[date.getMonth()];
    switch (format) {
      case 'dd/MM/yyyy': return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy': return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd': return `${year}-${month}-${day}`;
      case 'dd-MMM-yyyy': return `${day}-${monthName}-${year}`;
      default: return `${day}/${month}/${year}`;
    }
  };

  const handleDeleteTrigger = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors">
       <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onBack} className="text-slate-900 dark:text-white active:scale-90 transition-all p-2 hover:text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-slate-900 dark:text-white font-bold text-xl capitalize">{type.replace('_', ' ')}s</h2>
          </div>
       </div>

       <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-[76px] z-40 transition-colors">
         <PillInput 
            placeholder="Search by ID or customer..." 
            value={search} 
            onChange={setSearch} 
            icon={<span className="opacity-40 p-2 hover:text-blue-500 transition-colors">🔍</span>} 
          />
       </div>

       <div className="flex border-b border-slate-100 dark:border-slate-800 sticky top-[152px] z-40 bg-white dark:bg-slate-950">
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'pdf' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            pdf
          </button>
          <button 
            onClick={() => setActiveTab('copy_pdf')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'copy_pdf' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            copy pdf
          </button>
        </div>
       <div className="flex-1 px-4 overflow-y-auto pt-4 pb-32 no-scrollbar">
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 space-y-4">
              <span className="text-6xl opacity-30">📁</span>
              <p className="font-bold uppercase tracking-widest text-sm">No {type}s found</p>
            </div>
          ) : (
            filteredDocs.map((d: Document) => (
              <div key={d.id} onClick={() => onSelect(d)} className="py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center active:bg-slate-50 dark:active:bg-slate-900 px-4 transition-all cursor-pointer rounded-2xl mb-2 bg-slate-50/30 dark:bg-slate-900/40">
                 <div className="flex-1 min-w-0 pr-4">
                    <p className="font-black text-slate-800 dark:text-slate-100 text-base truncate">{state.customers.find((c:any) => c.id === d.customerId)?.name || 'Walk-in'}</p>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{d.docNumber} • {formatDate(d.date, state.settings.general.dateFormat)}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-200 mr-2">{state.settings.general.currencySymbol}{d.grandTotal.toLocaleString()}</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(d); }} className="w-9 h-9 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-full flex items-center justify-center active:scale-90 shadow-sm p-2 hover:text-blue-500 transition-colors">
                      ✏️
                    </button>
                    <button type="button" onClick={(e) => handleDeleteTrigger(e, d.id)} className="w-9 h-9 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center active:scale-90 p-2 hover:text-blue-500 transition-colors">
                      🗑️
                    </button>
                 </div>
              </div>
            ))
          )
        }
       </div>
       <FAB onClick={onCreate} label={type.replace('_', ' ').toUpperCase()} />

       {deleteConfirmId && (
         <DeleteConfirmModal 
           title={type.replace('_', ' ')} 
           onConfirm={handleConfirmDelete} 
           onCancel={() => setDeleteConfirmId(null)} 
         />
       )}
    </div>
  );
};

export default List;
