import React, { useState, useEffect } from 'react';
import { 
  DocType, Document, DocumentItem, OtherCharge 
} from '../types';
import { SectionBar } from '../components/UI';
import { SelectionModal, ItemEntryModal, OtherChargeModal, ReceiptInfoModal } from './Modals';

interface WorkbenchProps {
  type: DocType;
  state: any;
  initialData?: Document;
  onSave: (doc: Document) => void;
  onCancel: () => void;
  updateState: (key: string, value: any) => void;
}

const Workbench: React.FC<WorkbenchProps> = ({ type, state, initialData, onSave, onCancel, updateState }) => {
  const settings = (state.settings as any)[type];
  const globalSettings = state.settings.general;
  const columnHeadings = state.settings.columnHeadings;
  
  const [doc, setDoc] = useState<Document>(initialData || {
    id: '', 
    type, 
    docNumber: `${settings?.prefix || (type === 'receipt' ? 'RCP' : 'QT')}-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    items: [], 
    otherCharges: [], 
    subTotal: 0, 
    totalTax: 0, 
    grandTotal: 0,
    customerId: '', 
    roundOff: false, 
    paymentMode: '', 
    paymentRef: '', 
    totalAmountPaid: 0, 
    paymentFor: ''
  });

  const [modal, setModal] = useState<'customer' | 'product' | 'item_entry' | 'other_charge' | 'terms' | 'receipt_info' | null>(null);
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [editingItemIdx, setEditingItemIdx] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const isReceipt = type === 'receipt';
  const hasExtraCharges = !['receipt', 'delivery_note', 'proforma'].includes(type);

  useEffect(() => {
    if (isReceipt) {
      setDoc(prev => ({ ...prev, grandTotal: prev.totalAmountPaid || 0 }));
      return;
    }
    const rawSubTotal = doc.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    
    const taxDisplayMode = settings?.taxDisplay;
    const shouldCountTax = taxDisplayMode !== 'No Tax';
    const isTaxOnTotal = taxDisplayMode === 'On Total';
    const isTaxPerItem = taxDisplayMode === 'Per Item';
    
    let calculatedTotalTax = 0;

    if (shouldCountTax) {
      if (isTaxPerItem) {
        const itemTax = doc.items.reduce((sum, it) => sum + (it.price * it.quantity * (it.gst / 100)), 0);
        const otherChargeTax = hasExtraCharges 
          ? doc.otherCharges.reduce((sum, oc) => sum + (oc.isTaxable ? (oc.amount * ((oc.gstPercent || 0) / 100)) : 0), 0)
          : 0;
        calculatedTotalTax = itemTax + otherChargeTax;
      } else if (isTaxOnTotal) {
        const taxRate = settings?.taxRate ?? 18.0;
        const taxableBase = rawSubTotal + (hasExtraCharges ? doc.otherCharges.filter(oc => oc.isTaxable).reduce((sum, oc) => sum + oc.amount, 0) : 0);
        calculatedTotalTax = taxableBase * (taxRate / 100);
      }
    }
    
    const otherTotal = hasExtraCharges 
      ? doc.otherCharges.reduce((sum, oc) => sum + oc.amount, 0)
      : 0;

    let total = rawSubTotal + calculatedTotalTax + otherTotal;
    
    if (doc.roundOff) total = Math.round(total);
    
    setDoc(prev => ({ 
      ...prev, 
      subTotal: rawSubTotal, 
      totalTax: calculatedTotalTax, 
      grandTotal: total 
    }));
  }, [doc.items, doc.otherCharges, doc.roundOff, doc.totalAmountPaid, type, hasExtraCharges, isReceipt, settings?.taxDisplay, settings?.taxRate]);

  const selectedCustomer = state.customers.find((c: any) => c.id === doc.customerId);
  const selectedTerms = state.terms.find((t: any) => t.id === doc.termsId);

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

  const handleEditItem = (it: DocumentItem, idx: number) => {
    setEditingItem(it);
    setEditingItemIdx(idx);
    setModal('item_entry');
  };

  const handleGenerate = () => {
    if (isProcessing) return;
    if(!doc.customerId) return alert("Select customer");
    if(!isReceipt && !doc.items.length) return alert("Add products");
    
    setIsProcessing(true);
    setTimeout(() => {
      onSave(doc);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-slate-950 flex flex-col transition-colors">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors">
        <button type="button" onClick={onCancel} className="active:scale-90 transition-all p-2 hover:text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold capitalize">Make {type.replace('_', ' ')}</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 px-6 py-4 flex justify-between border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatDate(doc.date, globalSettings.dateFormat)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document No</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{doc.docNumber}</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 pb-44 no-scrollbar overflow-y-auto">
        <SectionBar title={isReceipt ? "RECEIVED FROM" : "TO (CUSTOMER)"} onAdd={() => setModal('customer')} />
        {selectedCustomer && (
          <div className="mx-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-black text-slate-800 dark:text-slate-200 text-base">{selectedCustomer.name}</p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{selectedCustomer.companyName}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{selectedCustomer.mobile}</p>
            </div>
            <button type="button" onClick={() => setDoc({...doc, customerId: ''})} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center active:scale-90 p-2 hover:text-blue-500 transition-colors">
              🗑️
            </button>
          </div>
        )}

        {!isReceipt ? (
          <>
            <SectionBar title="PRODUCTS" onAdd={() => setModal('product')} />
            <div className="space-y-2 mx-2">
              {doc.items.map((it, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                  <div className="flex-1 min-w-0" onClick={() => handleEditItem(it, idx)}>
                    <p className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase">{it.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Amount: {it.quantity} * {globalSettings.currencySymbol}{it.price.toLocaleString()} = {globalSettings.currencySymbol}{(it.quantity * it.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); handleEditItem(it, idx); }} 
                      className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full flex items-center justify-center active:scale-90 shadow-sm p-2 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setDoc({...doc, items: doc.items.filter((_, i) => i !== idx)}); }} 
                      className="w-10 h-10 bg-red-50 dark:bg-red-900/30 text-red-400 rounded-full flex items-center justify-center active:scale-90 p-2 hover:text-blue-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {doc.items.length > 0 && (
              <div className="mx-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-6 py-5 flex justify-between items-center shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">ROUND OFF AMOUNT</span>
                <input type="checkbox" checked={doc.roundOff} onChange={e => setDoc({...doc, roundOff: e.target.checked})} className="w-6 h-6 rounded-md border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer" />
              </div>
            )}

            {hasExtraCharges && (
              <>
                <SectionBar title={columnHeadings.otherChargesLabel.toUpperCase()} onAdd={() => setModal('other_charge')} />
                <div className="space-y-2 mx-2">
                  {doc.otherCharges.map((oc, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                      <div>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase">{oc.label}</p>
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                          {globalSettings.currencySymbol}{oc.amount.toLocaleString()} 
                          {oc.isTaxable && settings?.taxDisplay !== 'No Tax' && <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">{columnHeadings.taxLabel} {oc.gstPercent}%</span>}
                        </p>
                      </div>
                      <button type="button" onClick={() => setDoc({...doc, otherCharges: doc.otherCharges.filter((_, idx) => idx !== i)})} className="text-red-400 active:scale-90 p-2 hover:text-blue-500 transition-colors">🗑️</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <SectionBar title="PAYMENT INFO" onAdd={() => setModal('receipt_info')} />
            <div className="mx-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
               <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</span><span className="text-sm font-bold text-slate-800 dark:text-slate-200">{doc.paymentMode || 'Cash'}</span></div>
               <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid For</span><span className="text-sm font-bold text-slate-800 dark:text-slate-200">{doc.paymentFor || '-'}</span></div>
               <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span><span className="text-sm font-bold text-slate-800 dark:text-slate-200">{globalSettings.currencySymbol}{doc.totalAmountPaid?.toLocaleString()}</span></div>
            </div>
          </>
        )}

        {!isReceipt && (
          <div className="space-y-2">
            <SectionBar title="TERMS & CONDITIONS" onAdd={() => setModal('terms')} />
            {selectedTerms ? (
              <div className="mx-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Active Terms Added</span>
                    <button type="button" onClick={() => setDoc({...doc, termsId: undefined})} className="text-red-400 p-2 active:scale-90 bg-red-50 dark:bg-red-900/10 rounded-full w-9 h-9 flex items-center justify-center hover:text-blue-500 transition-colors">
                      🗑️
                    </button>
                </div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed italic border-l-4 border-slate-100 dark:border-slate-800 pl-4 py-1">
                    {selectedTerms.content}
                </p>
              </div>
            ) : (
               <div className="mx-4 text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-30">
                 <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">No Terms Selected</p>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-10 left-6 right-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full p-2 flex items-center justify-between shadow-2xl z-50 transition-colors">
        <div className="px-6 py-1">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{isReceipt ? 'Total Received' : 'Grand Total'}</p>
          <p className="text-slate-900 dark:text-white text-xl font-black">{globalSettings.currencySymbol}{doc.grandTotal.toLocaleString()}</p>
        </div>
        <button 
          type="button" 
          onClick={handleGenerate}
          disabled={isProcessing}
          className={`${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center gap-2`}
        >
          {isProcessing && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'PROCESSING...' : 'CREATE'}
        </button>
      </div>

      {modal === 'customer' && <SelectionModal type="customer" title="Select Customer" items={state.customers} onSelect={c => { setDoc({...doc, customerId: c.id}); setModal(null); }} onCancel={() => setModal(null)} updateState={updateState} />}
      {modal === 'product' && <SelectionModal type="product" title="Add Product" items={state.products} onSelect={p => { setEditingItem({ productId: p.id, name: p.name, quantity: 1, price: p.price, hsn: p.hsn, gst: p.gst, description: p.description }); setEditingItemIdx(-1); setModal('item_entry'); }} onCancel={() => setModal(null)} updateState={updateState} />}
      {modal === 'item_entry' && editingItem && <ItemEntryModal item={editingItem} onSave={it => { if(editingItemIdx > -1) setDoc({...doc, items: doc.items.map((x,i)=>i===editingItemIdx?it:x)}); else setDoc({...doc, items: [...doc.items, it]}); setModal(null); }} onCancel={() => setModal(null)} />}
      {modal === 'other_charge' && <OtherChargeModal onSave={oc => { setDoc({...doc, otherCharges: [...doc.otherCharges, oc]}); setModal(null); }} onCancel={() => setModal(null)} />}
      {modal === 'receipt_info' && <ReceiptInfoModal initialData={{ paymentMode: doc.paymentMode, paymentRef: doc.paymentRef, totalAmountPaid: doc.totalAmountPaid, paymentFor: doc.paymentFor }} onSave={info => { setDoc({...doc, ...info}); setModal(null); }} onCancel={() => setModal(null)} />}
      {modal === 'terms' && (
        <SelectionModal 
          type="terms" 
          title="Select Terms" 
          items={state.terms.filter((t:any) => t.type === (['proforma', 'delivery_note'].includes(type) ? 'invoice' : type))} 
          onSelect={t => { setDoc({...doc, termsId: t.id}); setModal(null); }} 
          onCancel={() => setModal(null)} 
          updateState={updateState} 
        />
      )}
    </div>
  );
};

export default Workbench;
