import React, { useState, useMemo } from 'react';
import { Customer, Product, DocumentItem, OtherCharge, TermCondition, DocType } from '../types';
import { PillInput } from '../components/UI';
import { generateSmartDescription, generateSmartTerms } from '../services/gemini';
import { PAYMENT_MODES, COUNTRIES, Country } from '../constants';

const getCurrency = () => {
  try {
     const stored = localStorage.getItem('quoteflow_pro_v1');
     if (stored) {
       const settings = JSON.parse(stored).settings;
       return settings.general.currencySymbol;
     }
  } catch(e) {}
  return '₹';
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const DeleteConfirmModal: React.FC<{ 
  title: string, 
  onConfirm: () => void, 
  onCancel: () => void 
}> = ({ title, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          🗑️
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight mb-2">Are you sure?</h3>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-8 uppercase tracking-widest text-[10px]">
          Do you really want to delete this {title}? This action cannot be undone.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-white border border-red-500 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg"
          >
            Yes, Delete
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const SelectionModal: React.FC<{ type: string, title: string, items: any[], onSelect: (i: any) => void, onCancel: () => void, updateState: any }> = ({ type, title, items, onSelect, onCancel, updateState }) => {
  const [search, setSearch] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const filtered = items.filter(i => (i.name || i.companyName || i.content || '').toLowerCase().includes(search.toLowerCase()));
  const currency = getCurrency();

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[120] flex flex-col transition-colors">
       <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 text-slate-900 dark:text-white shadow-sm transition-colors">
          <button type="button" onClick={onCancel} className="active:scale-90 text-xl font-bold p-2 hover:text-blue-500">←</button>
          <h2 className="text-xl font-bold">{title}</h2>
       </div>
       <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
         <div className="bg-white dark:bg-slate-800 rounded-2xl flex items-center px-5 py-3 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
           <span className="opacity-40 mr-3">🔍</span>
           <input placeholder={`Search ${type}...`} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-slate-200" />
         </div>
       </div>
       <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3 pb-32">
          {filtered.length === 0 ? (
            <div className="py-20 text-center opacity-30">
               <p className="font-bold uppercase tracking-widest text-[10px] dark:text-slate-500">No results found</p>
            </div>
          ) : (
            filtered.map(i => (
              <div key={i.id} onClick={() => onSelect(i)} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:bg-slate-50 dark:active:bg-slate-800 flex justify-between items-center transition-all cursor-pointer">
                 <div className="flex-1 min-w-0 pr-4">
                   <p className="font-black text-slate-800 dark:text-slate-200 text-base truncate uppercase">{i.name || (i.content?.slice(0,50) + (i.content?.length > 50 ? '...' : ''))}</p>
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 truncate">{i.companyName || i.mobile || (i.price ? `${currency}${i.price.toLocaleString()}` : '')}</p>
                 </div>
                 <span className="opacity-20 dark:opacity-40 p-2 hover:text-blue-500 transition-colors">→</span>
              </div>
            ))
          )}
       </div>
       <button onClick={() => setAddingNew(true)} className="fixed bottom-10 right-10 bg-[#92C5F9] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center active:scale-95 z-[130]">
          <span className="text-3xl">+</span>
       </button>

       {addingNew && type === 'customer' && <CustomerModal onSave={c => { const nc = {...c, id:Date.now().toString()}; updateState('customers', (p:any)=>[...p, nc]); onSelect(nc); setAddingNew(false); }} onCancel={() => setAddingNew(false)} />}
       {addingNew && type === 'product' && <ProductModal onSave={p => { const np = {...p, id:Date.now().toString()}; updateState('products', (p:any)=>[...p, np]); onSelect(np); setAddingNew(false); }} onCancel={() => setAddingNew(false)} />}
       {addingNew && type === 'terms' && <TermsModal onSave={t => { const nt = {...t, id:Date.now().toString()}; updateState('terms', (p:any)=>[...p, nt]); onSelect(nt); setAddingNew(false); }} onCancel={() => setAddingNew(false)} />}
    </div>
  );
};

export const CustomerModal: React.FC<{ initialData?: any, onSave: (c: Customer) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<Customer>(initialData || { id: '', name: '', companyName: '', email: '', mobile: '', address1: '', state: '', gstin: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');

  const selectedCountry = useMemo(() => {
    const found = COUNTRIES.find(c => form.mobile.startsWith(c.code));
    return found || COUNTRIES.find(c => c.name === 'India') || COUNTRIES[0];
  }, [form.mobile]);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) || 
      c.code.includes(searchCountry)
    );
  }, [searchCountry]);

  const handleCountrySelect = (c: Country) => {
    const rawNumber = form.mobile.replace(selectedCountry.code, '').trim();
    setForm({ ...form, mobile: c.code + ' ' + rawNumber });
    setShowCountryModal(false);
    setSearchCountry('');
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Client name is required";
    
    const rawMobile = form.mobile.replace(selectedCountry.code, '').trim();
    if (!rawMobile) newErrors.mobile = "Mobile is required";
    else if (rawMobile.length < 5) newErrors.mobile = "Invalid mobile number";
    
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format (e.g. name@domain.com)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] flex flex-col shadow-2xl transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 text-slate-900 dark:text-white transition-colors shadow-sm">
        <button onClick={onCancel} className="active:scale-90 font-bold p-2 hover:text-blue-500">←</button>
        <h2 className="text-xl font-bold uppercase tracking-widest">{initialData ? 'Edit Client' : 'New Client'}</h2>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <PillInput label="Client Name *" value={form.name} onChange={v => setForm({...form, name:v})} error={errors.name} />
        <PillInput label="Company Name" value={form.companyName} onChange={v => setForm({...form, companyName:v})} />
        
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-4 uppercase tracking-widest">Mobile *</label>
              <div className={`flex items-center bg-[#F4F4F4] dark:bg-slate-800 rounded-[1rem] transition-all min-h-[56px] overflow-hidden border ${errors.mobile ? 'border-red-200' : 'border-transparent'}`}>
                 <button 
                   type="button" 
                   onClick={() => setShowCountryModal(true)}
                   className="px-4 h-full flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 active:bg-slate-100 dark:active:bg-slate-700 transition-colors p-2 hover:text-blue-500"
                 >
                    <span className="text-xl leading-none">{selectedCountry.flag}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedCountry.code}</span>
                    <span className="text-[8px] text-slate-300">▼</span>
                 </button>
                 <input 
                  type="number"
                  value={form.mobile.replace(selectedCountry.code, '').trim()}
                  onChange={e => setForm({...form, mobile: selectedCountry.code + ' ' + e.target.value})}
                  placeholder="Number"
                  className="flex-1 bg-transparent px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300"
                 />
              </div>
              {errors.mobile && <p className="text-[10px] font-black text-red-500 ml-5 uppercase tracking-widest">{errors.mobile}</p>}
           </div>

           <PillInput label="Email" value={form.email} onChange={v => setForm({...form, email:v})} error={errors.email} placeholder="user@domain.com" />
        </div>
        
        <PillInput label="GSTIN (Tax ID)" value={form.gstin} onChange={v => setForm({...form, gstin: v})} placeholder="Ex: 22AAAAA0000A1Z5" />
        <PillInput label="Address" value={form.address1} onChange={v => setForm({...form, address1:v})} isTextArea />
      </div>
      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 shadow-lg transition-colors">
        <button onClick={validateAndSave} className="w-full py-5 bg-[rgba(34,83,207)] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 shadow-sm">Save Customer</button>
      </div>

      {showCountryModal && (
        <div className="fixed inset-0 z-[400] bg-slate-900/70 backdrop-blur-md flex items-end animate-in fade-in duration-200">
           <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] flex flex-col h-[85vh] shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-10">
                 <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Select Country</h3>
                 <button onClick={() => { setShowCountryModal(false); setSearchCountry(''); }} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 p-2 hover:text-blue-500">✕</button>
              </div>

              <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center px-6 py-4 border border-slate-100 dark:border-slate-700 transition-colors">
                   <span className="mr-3 opacity-30 text-lg">🔍</span>
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
                    className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 group p-2 hover:text-blue-500"
                  >
                    <span className="text-3xl leading-none">{c.flag}</span>
                    <span className="flex-1 text-left font-bold text-slate-700 dark:text-slate-300 text-[15px]">{c.name}</span>
                    <span className="font-black text-slate-400 dark:text-slate-600 text-xs tracking-tight">{c.code}</span>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const ProductModal: React.FC<{ initialData?: any, onSave: (p: Product) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<Product>(initialData || { id: '', name: '', price: 0, uom: 'pcs', gst: 18, description: '', hsn: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const currency = getCurrency();

  const handleSmartDesc = async () => {
    if (!form.name) return alert("Enter product name first");
    setIsLoadingGemini(true);
    const desc = await generateSmartDescription(form.name);
    setForm(p => ({ ...p, description: desc }));
    setIsLoadingGemini(false);
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0) newErrors.price = "Valid price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] flex flex-col shadow-2xl transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 text-slate-900 dark:text-white transition-colors shadow-sm">
        <button onClick={onCancel} className="active:scale-90 font-bold p-2 hover:text-blue-500">←</button>
        <h2 className="text-xl font-bold uppercase tracking-widest">{initialData ? 'Edit Product' : 'New Product'}</h2>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <div className="space-y-1">
          <PillInput label="Product Name *" value={form.name} onChange={v => setForm({...form, name:v})} error={errors.name} />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <PillInput label="Unit Price *" type="number" value={form.price} onChange={v => setForm({...form, price: Number(v)})} icon={<span className="font-bold text-slate-400">{currency}</span>} error={errors.price} />
           </div>
           <PillInput label="GST Rate (%)" type="number" value={form.gst} onChange={v => setForm({...form, gst: Number(v)})} />
        </div>
        <PillInput label="HSN/SAC Code" value={form.hsn} onChange={v => setForm({...form, hsn: v})} placeholder="Ex: 8471" />
        <div className="flex justify-between items-center ml-4 mt-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Description</label>
            <button 
              onClick={handleSmartDesc} 
              disabled={isLoadingGemini}
              className="text-[10px] font-black bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoadingGemini ? "Thinking..." : "✨ AI Suggest"}
            </button>
        </div>
        <PillInput value={form.description} onChange={v => setForm({...form, description:v})} isTextArea placeholder="Brief description..." />
      </div>
      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 shadow-lg transition-colors">
        <button onClick={validateAndSave} className="w-full py-5 bg-[#92C5F9] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 shadow-sm">Save Product</button>
      </div>
    </div>
  );
};

export const TermsModal: React.FC<{ initialData?: any, onSave: (t: TermCondition) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<TermCondition>(initialData || { id: '', type: 'quotation', content: '' });
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  const handleSmartTerms = async () => {
    setIsLoadingGemini(true);
    const terms = await generateSmartTerms(form.type);
    setForm(p => ({ ...p, content: terms }));
    setIsLoadingGemini(false);
  };

  const types: {label: string, value: DocType}[] = [
    { label: 'Quotation', value: 'quotation' },
    { label: 'Invoice', value: 'invoice' },
    { label: 'PO', value: 'purchase_order' }
  ];

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] flex flex-col shadow-2xl transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 text-slate-900 dark:text-white transition-colors shadow-sm">
        <button onClick={onCancel} className="active:scale-90 font-bold p-2 hover:text-blue-500">←</button>
        <h2 className="text-xl font-bold uppercase tracking-widest">{initialData?.id ? 'Edit Terms' : 'New Terms'}</h2>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <div className="flex gap-2 mb-4">
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => setForm({ ...form, type: t.value })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.type === t.value ? 'bg-[#92C5F9] text-white border-[#92C5F9]' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center ml-4 mt-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Conditions</label>
        </div>
        <PillInput value={form.content} onChange={v => setForm({...form, content:v})} isTextArea placeholder="Enter terms line by line..." />
      </div>
      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 shadow-lg transition-colors">
        <button onClick={() => onSave(form)} className="w-full py-5 bg-[#92C5F9] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 shadow-sm">Save Terms</button>
      </div>
    </div>
  );
};

export const ItemEntryModal: React.FC<{ item: DocumentItem, onSave: (it: DocumentItem) => void, onCancel: () => void }> = ({ item, onSave, onCancel }) => {
  const [form, setForm] = useState<DocumentItem>({ ...item });
  const currency = getCurrency();
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] flex flex-col shadow-2xl transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 text-slate-900 dark:text-white transition-colors shadow-sm">
        <button onClick={onCancel} className="active:scale-90 font-bold p-2 hover:text-blue-500">←</button>
        <h2 className="text-xl font-bold uppercase tracking-widest">Item Details</h2>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <PillInput label="Item Name" value={form.name} onChange={v => setForm({...form, name: v})} />
        <div className="grid grid-cols-2 gap-4">
           <PillInput label="Quantity" type="number" value={form.quantity} onChange={v => setForm({...form, quantity: Number(v)})} />
           <PillInput label="Unit Price" type="number" value={form.price} onChange={v => setForm({...form, price: Number(v)})} icon={<span className="font-bold text-slate-400">{currency}</span>} />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <PillInput label="HSN/SAC" value={form.hsn} onChange={v => setForm({...form, hsn: v})} />
           <PillInput label="GST Rate (%)" type="number" value={form.gst} onChange={v => setForm({...form, gst: Number(v)})} />
        </div>
        <PillInput label="Description" value={form.description} onChange={v => setForm({...form, description: v})} isTextArea />
        <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center transition-colors">
           <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Total Amount</span>
           <span className="text-lg font-black text-slate-900 dark:text-slate-200">{currency}{(form.price * form.quantity).toLocaleString()}</span>
        </div>
      </div>
      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 shadow-lg transition-colors">
        <button onClick={() => onSave(form)} className="w-full py-5 bg-[rgba(34,83,207)] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 shadow-sm">Update Item</button>
      </div>
    </div>
  );
};

export const OtherChargeModal: React.FC<{ onSave: (oc: OtherCharge) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [isTaxable, setIsTaxable] = useState(false);
  const [gstPercent, setGstPercent] = useState('');
  const currency = getCurrency();

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-end">
      <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300 transition-colors">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-2" />
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Other Charge Info</h2>

        <div className="space-y-4">
          <PillInput 
            placeholder="Other Charge Label" 
            value={label} 
            onChange={setLabel} 
          />
          <PillInput 
            placeholder="Other Charge Amount" 
            type="number" 
            value={amount} 
            onChange={setAmount} 
            icon={<span className="font-bold text-slate-400">{currency}</span>}
          />
          
          <div className="flex items-center justify-between px-2 py-4">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Is Taxable?</span>
            <div 
              onClick={() => setIsTaxable(!isTaxable)}
              className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all cursor-pointer ${isTaxable ? 'bg-[#92C5F9] border-[#92C5F9]' : 'bg-white dark:bg-transparent border-slate-300 dark:border-slate-700'}`}
            >
              {isTaxable && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {isTaxable && (
            <PillInput 
              placeholder="GST (IN %)" 
              type="number" 
              value={gstPercent} 
              onChange={setGstPercent} 
            />
          )}
        </div>

        <div className="pt-4 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-5 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-[1.2rem] font-bold text-lg">Cancel</button>
          <button 
            onClick={() => onSave({ 
              label: label || 'Other Charges', 
              amount: Number(amount) || 0, 
              isTaxable, 
              gstPercent: isTaxable ? (Number(gstPercent) || 0) : 0 
            })} 
            className="flex-[2] py-5 bg-[#92C5F9] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 shadow-sm transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReceiptInfoModal: React.FC<{ initialData: any, onSave: (info: any) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
  const [form, setForm] = useState(initialData || { paymentMode: 'Cash', paymentRef: '', totalAmountPaid: 0, paymentFor: '' });
  const currency = getCurrency();
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[200] flex flex-col shadow-2xl transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-5 flex items-center gap-4 sticky top-0 text-slate-900 dark:text-white transition-colors shadow-sm">
        <button onClick={onCancel} className="active:scale-90 font-bold p-2 hover:text-blue-500">←</button>
        <h2 className="text-xl font-bold uppercase tracking-widest">Payment Details</h2>
      </div>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-32">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-4 uppercase tracking-widest">Payment Mode</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_MODES.map(m => (
              <button 
                key={m} 
                onClick={() => setForm({...form, paymentMode: m})}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight border transition-all ${form.paymentMode === m ? 'bg-[#92C5F9] text-white border-[#92C5F9]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <PillInput label="Amount Paid" type="number" value={form.totalAmountPaid} onChange={v => setForm({...form, totalAmountPaid: Number(v)})} icon={<span className="font-bold text-slate-400">{currency}</span>} />
        <PillInput label="Payment Reference" value={form.paymentRef} onChange={v => setForm({...form, paymentRef: v})} placeholder="Ex: Transaction ID, Cheque No..." />
        <PillInput label="Paid For" value={form.paymentFor} onChange={v => setForm({...form, paymentFor: v})} placeholder="Ex: Invoice #123, Advance..." />
      </div>
      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 shadow-lg transition-colors">
        <button onClick={() => onSave(form)} className="w-full py-5 bg-[#92C5F9] text-white rounded-[1.2rem] font-bold text-lg active:scale-95 shadow-sm">Confirm Receipt</button>
      </div>
    </div>
  );
};
