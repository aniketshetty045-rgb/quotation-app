import React, { useState } from 'react';
import { DocType } from '../types';
import { PillInput } from '../components/UI';
import { CustomerModal, ProductModal, TermsModal, DeleteConfirmModal } from './Modals';

interface ManageProps {
  target: 'customer' | 'product' | 'terms';
  state: any;
  updateState: any;
  removeItem: (key: string, id: string) => void;
  onBack: () => void;
}

const ManageItems: React.FC<ManageProps> = ({
  target,
  state,
  updateState,
  removeItem,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DocType>('quotation');

  const itemsKey = target === 'terms' ? 'terms' : target + 's';

  const ensureItemId = (item: any) => {
    if (!item || typeof item !== 'object') return item;
    if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
      item.id = `${target}_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    }
    return item;
  };

  const rawItems = (state[itemsKey] || []).map(ensureItemId);
  const items = target === 'terms'
    ? rawItems.filter((t: any) => t.type === activeTab)
    : rawItems;

  const filtered = items.filter((i: any) => {
    const searchLower = search.toLowerCase();
    return (
      (i.name || '').toLowerCase().includes(searchLower) ||
      (i.content || '').toLowerCase().includes(searchLower) ||
      (i.companyName || '').toLowerCase().includes(searchLower) ||
      (i.gstin || '').toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteTrigger = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      removeItem(itemsKey, deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleEdit = (item: any) => {
    setModal(ensureItemId(item));
  };

  const tabMap: { label: string; value: DocType }[] = [
    { label: 'Quotation', value: 'quotation' },
    { label: 'Invoice', value: 'invoice' },
    { label: 'PO', value: 'purchase_order' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-900 dark:text-white active:scale-90 transition-all p-2 hover:text-blue-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h2 className="text-slate-900 dark:text-white font-bold text-xl tracking-tight uppercase">
            {target === 'terms' ? 'Manage Terms' : `Manage ${target}s`}
          </h2>
        </div>
        <button className="text-slate-900 dark:text-white opacity-80 p-2 hover:text-blue-500">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {target === 'terms' && (
        <div className="flex bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-[68px] z-40 transition-colors">
          {tabMap.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`flex-1 py-4 text-xs font-black tracking-widest transition-all border-b-2 uppercase p-2 hover:text-blue-500 ${
                activeTab === t.value
                  ? 'border-[#3E98B1] text-[#3E98B1]'
                  : 'border-transparent text-slate-300 dark:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
        <PillInput
          placeholder={`Search ${target}s...`}
          value={search}
          onChange={setSearch}
          icon={<span className="opacity-40 p-2 hover:text-blue-500 transition-colors">🔍</span>}
        />
      </div>

      <div className="flex-1 px-4 overflow-y-auto pt-6 pb-40 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-200 dark:text-slate-800 space-y-4">
            <span className="text-6xl opacity-20">
              {target === 'product' ? '📦' : target === 'customer' ? '👤' : '📜'}
            </span>
            <p className="font-bold uppercase tracking-widest text-[10px]">
              No {target}s found
            </p>
          </div>
        ) : (
          filtered.map((item: any) => {
            const safeItem = ensureItemId(item);
            return (
              <div
                key={safeItem.id}
                className="p-6 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none flex justify-between items-center mb-4 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 transition-all hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-black text-slate-800 dark:text-slate-100 text-[15px] leading-tight uppercase truncate">
                    {target === 'terms'
                      ? (safeItem.content?.slice(0, 60) + '...')
                      : (safeItem.name || 'Untitled')}
                  </p>
                  {safeItem.companyName && (
                    <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 mt-1 leading-tight">
                      {safeItem.companyName}
                    </p>
                  )}
                  {target === 'customer' && safeItem.gstin && (
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1.5">
                      GSTIN: {safeItem.gstin}
                    </p>
                  )}
                  {target === 'product' && (
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1.5">
                      {state.settings.general.currencySymbol}{safeItem.price.toLocaleString()} • GST {safeItem.gst}%
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(safeItem)}
                    className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center active:scale-90 shadow-sm transition-colors border border-transparent dark:border-slate-700 p-2 hover:text-blue-500"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTrigger(e, safeItem.id)} 
                    className="w-11 h-11 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-sm p-2 hover:text-blue-500"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-10 right-6 z-[60]">
        <button
          onClick={() => setModal('new')}
          className="bg-[#92C5F9] text-white w-[110px] h-[110px] rounded-full shadow-2xl flex flex-col items-center justify-center active:scale-95 hover:scale-105 transition-all text-center leading-tight ring-8 ring-blue-500/10"
        >
          <span className="text-[11px] font-black uppercase tracking-widest">ADD</span>
          <span className="text-[11px] font-black uppercase tracking-widest mt-1">
            {target === 'terms' ? 'TERMS' : target}
          </span>
        </button>
      </div>

      {modal && target === 'customer' && (
        <CustomerModal
          initialData={modal === 'new' ? undefined : modal}
          onSave={(c) => {
            const newCustomer = { ...c, id: c.id || Date.now().toString() };
            updateState('customers', (prev: any[]) =>
              modal === 'new'
                ? [...prev, newCustomer]
                : prev.map((x) => (x.id === newCustomer.id ? newCustomer : x))
            );
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal && target === 'product' && (
        <ProductModal
          initialData={modal === 'new' ? undefined : modal}
          onSave={(p) => {
            const newProduct = { ...p, id: p.id || Date.now().toString() };
            updateState('products', (prev: any[]) =>
              modal === 'new'
                ? [...prev, newProduct]
                : prev.map((x) => (x.id === newProduct.id ? newProduct : x))
            );
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal && target === 'terms' && (
        <TermsModal
          initialData={modal === 'new' ? { type: activeTab } : modal}
          onSave={(t) => {
            const newTerm = { ...t, id: t.id || Date.now().toString() };
            updateState('terms', (prev: any[]) =>
              modal === 'new'
                ? [...prev, newTerm]
                : prev.map((x) => (x.id === newTerm.id ? newTerm : x))
            );
            setModal(null);
          }}
          onCancel={() => setModal(null)}
        />
      )}

      {deleteConfirmId && (
        <DeleteConfirmModal 
          title={target} 
          onConfirm={handleConfirmDelete} 
          onCancel={() => setDeleteConfirmId(null)} 
        />
      )}
    </div>
  );
};

export default ManageItems;
