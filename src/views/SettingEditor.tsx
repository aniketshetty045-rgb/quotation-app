import React, { useState } from 'react';
import { DocType, DocSetting } from '../types';

interface SettingEditorProps {
  type: DocType;
  settings: DocSetting;
  onSave: (newSettings: DocSetting) => void;
  onBack: () => void;
  onNavigateToImport?: (type: string) => void;
}

const SettingEditor: React.FC<SettingEditorProps> = ({ type, settings, onSave, onBack, onNavigateToImport }) => {
  const [form, setForm] = useState<DocSetting>({ ...settings });
  const [activeBottomSheet, setActiveBottomSheet] = useState<{
    label: string,
    field: keyof DocSetting,
    options: string[]
  } | null>(null);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const label = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');

  const handleOptionSelect = (option: string) => {
    if (activeBottomSheet) {
      const field = activeBottomSheet.field;
      setForm({ ...form, [field]: option });
      setActiveBottomSheet(null);

      if (option === 'On Total' && field === 'discountDisplay') {
        setShowInfoAlert(true);
      }
    }
  };

  const isReceipt = type === 'receipt';
  const isDelivery = type === 'delivery_note';

  const handleUpdate = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      onSave(form);
      setIsProcessing(false);
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
        <h1 className="text-xl font-bold tracking-tight">{label} Settings</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar pb-32">
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Quick Setup</h3>
          <div 
            onClick={() => window.dispatchEvent(new CustomEvent('nav-import', { detail: type }))}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] p-5 flex items-center gap-4 border border-blue-100 dark:border-blue-800/50 shadow-sm transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-[0.99] cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
               </svg>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">Import from PDF</p>
              <p className="text-[10px] font-bold text-blue-400 dark:text-blue-500/70 uppercase">Extract settings & data automatically</p>
            </div>
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Standard Configuration</h3>
          <SettingCard 
            icon={<PrefixIcon />} 
            label="Number Prefix" 
            value={form.prefix} 
            onChange={v => setForm({ ...form, prefix: v })} 
          />

          <SettingCard 
            icon={<SerialIcon />} 
            label="Serial Number" 
            type="number"
            value={form.serialNumber} 
            onChange={v => setForm({ ...form, serialNumber: Number(v) })} 
          />

          {isReceipt && (
            <SettingCard 
              icon={<TagIcon />} 
              label="Receipt Type" 
              value={form.receiptType} 
              onClick={() => setActiveBottomSheet({
                label: 'Select Receipt Type',
                field: 'receiptType' as any,
                options: ['Simple', 'Itemized']
              })}
            />
          )}

          {(!isReceipt || form.receiptType === 'Itemized') && !isDelivery && (
            <>
              <SettingCard 
                icon={<TagIcon />} 
                label="Discount Display" 
                value={form.discountDisplay} 
                onClick={() => setActiveBottomSheet({
                  label: 'Select Discount Type',
                  field: 'discountDisplay',
                  options: ['No Discount', 'Per Item', 'On Total']
                })}
              />

              <SettingCard 
                icon={<DollarIcon />} 
                label="GST Display" 
                value={form.taxDisplay} 
                onClick={() => setActiveBottomSheet({
                  label: 'Select GST Type',
                  field: 'taxDisplay',
                  options: ['No Tax', 'Per Item', 'On Total']
                })}
              />

              {form.taxDisplay === 'On Total' && (
                <SettingCard 
                  icon={<TagIcon />} 
                  label="GST (IN %)" 
                  type="number"
                  value={form.taxRate ?? 18.0} 
                  onChange={v => setForm({ ...form, taxRate: Number(v) })} 
                />
              )}
            </>
          )}

          {!isReceipt && (
            <SettingCard 
              icon={<TagIcon />} 
              label="Product HSN Display" 
              value={form.hsnDisplay} 
              onClick={() => setActiveBottomSheet({
                label: 'Product HSN Display',
                field: 'hsnDisplay',
                options: ['No', 'Yes']
              })}
            />
          )}

          {!isReceipt && (
            <>
              <SettingCard 
                icon={<MessageIcon />} 
                label={`${label} Top Message`} 
                value={form.topMessage} 
                isTextArea
                onChange={v => setForm({ ...form, topMessage: v })} 
              />

              <SettingCard 
                icon={<MessageIcon />} 
                label={`${label} Bottom Message`} 
                value={form.bottomMessage} 
                isTextArea
                onChange={v => setForm({ ...form, bottomMessage: v })} 
              />
            </>
          )}

          {!isReceipt && !isDelivery && (
            <>
              <SettingCard 
                icon={<BankIcon />} 
                label="Payment Instruction - Bank Information Display" 
                value={form.bankDisplay} 
                onClick={() => setActiveBottomSheet({
                  label: 'Bank Information Display',
                  field: 'bankDisplay',
                  options: ['No', 'Yes']
                })}
              />

              <SettingCard 
                icon={<UPIIcon />} 
                label="Payment Instruction - UPI Info Display" 
                value={form.upiDisplay} 
                onClick={() => setActiveBottomSheet({
                  label: 'UPI Info Display',
                  field: 'upiDisplay',
                  options: ['No', 'Yes']
                })}
              />
            </>
          )}

          <SettingCard 
            icon={<SignatureIcon />} 
            label="Signature Display" 
            value={form.signatureDisplay} 
            onClick={() => setActiveBottomSheet({
              label: 'Signature Display',
              field: 'signatureDisplay',
              options: ['No', 'Yes']
            })}
          />
        </section>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 z-40 transition-colors shadow-lg">
        <button 
          onClick={handleUpdate} 
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.25rem] font-bold text-lg active:scale-95 transition-all shadow-md flex items-center justify-center gap-3`}
        >
          {isProcessing && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'Updating...' : 'Update'}
        </button>
      </div>

      {showInfoAlert && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-6 animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 pb-2">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quotation Maker</h2>
                 <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                    If you set "Per item tax" in combination with "Discount on total" then, Discount will divided in to each product and Calculate Tax on Discounted Price.
                 </p>
              </div>
              <div className="p-4 flex justify-end">
                 <button 
                   onClick={() => setShowInfoAlert(false)} 
                   className="text-sm font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest px-6 py-2 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors p-2 hover:text-blue-500"
                 >
                    OK
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeBottomSheet && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-end animate-in fade-in duration-300">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col items-center">
              <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-6"></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeBottomSheet.label}</h3>
            </div>
            <div className="p-4 space-y-1">
              {activeBottomSheet.options.map(opt => (
                <button 
                  key={opt} 
                  onClick={() => handleOptionSelect(opt)}
                  className="w-full p-5 text-left text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl active:scale-[0.98] transition-all flex justify-between items-center p-2 hover:text-blue-500"
                >
                  {opt}
                  {form[activeBottomSheet.field] === opt && <span className="text-blue-500 font-bold">✓</span>}
                </button>
              ))}
            </div>
            <div className="p-6"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingCard: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  value: any, 
  onChange?: (v: string) => void,
  onClick?: () => void,
  isTextArea?: boolean,
  type?: string
}> = ({ icon, label, value, onChange, onClick, isTextArea, type = 'text' }) => (
  <div 
    onClick={onClick}
    className="bg-[#F4F4F5] dark:bg-slate-900 rounded-[1.5rem] p-5 flex items-start gap-4 border border-transparent dark:border-slate-800 shadow-sm transition-all hover:border-slate-100 dark:hover:border-slate-700 active:scale-[0.99] cursor-pointer"
  >
    <div className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-1">
      {icon}
    </div>
    <div className="flex-1 space-y-1">
      <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-widest leading-none block">
        {label}
      </label>
      {onChange ? (
        isTextArea ? (
          <textarea 
            value={value} 
            onChange={e => { e.stopPropagation(); onChange(e.target.value); }}
            onClick={e => e.stopPropagation()}
            rows={3}
            className="w-full bg-transparent text-[15px] font-bold text-slate-700 dark:text-slate-300 outline-none resize-none leading-snug"
          />
        ) : (
          <input 
            type={type}
            value={value} 
            step={type === 'number' ? '0.1' : undefined}
            onChange={e => { e.stopPropagation(); onChange(e.target.value); }}
            onClick={e => e.stopPropagation()}
            className="w-full bg-transparent text-[15px] font-bold text-slate-700 dark:text-slate-300 outline-none"
          />
        )
      ) : (
        <div className="text-[15px] font-bold text-slate-700 dark:text-slate-300 outline-none">
          {value}
        </div>
      )}
    </div>
  </div>
);

const PrefixIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2V7h2v10zM7 7h2v10H7V7zm8 10h2V7h-2v10z"/></svg>
);
const SerialIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
);
const TagIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.41 2.58C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42l-9-9zM5.5 8.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75z"/></svg>
);
const DollarIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 1.9 1.55 3.28 3.5 3.71V21h3v-2.15c1.89-.37 3.5-1.43 3.5-3.55 0-2.54-1.97-3.69-4.82-4.4z"/></svg>
);
const MessageIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 2v4H4V8h16zM4 16v-2h16v2H4z"/></svg>
);
const BankIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/></svg>
);
const UPIIcon = () => (
  <div className="font-black text-[9px] leading-none text-center bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-1 py-0.5 rounded-sm">UPI</div>
);
const SignatureIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.7 6.3l-5-5c-.3-.3-.7-.3-1 0l-12 12c-.1.1-.2.3-.2.4v5c0 .4.3.7.7.7h5c.2 0 .3-.1.4-.2l12-12c.3-.3.3-.7 0-1zm-13.6 11.7h-3.1v-3.1l8.5-8.5 3.1 3.1-8.5 8.5zm10.6-10.6l-1.4 1.4-3.1-3.1 1.4-1.4 3.1 3.1zM3 21h18v2H3v-2z"/></svg>
);

export default SettingEditor;
