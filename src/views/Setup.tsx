import React, { useState, useMemo } from 'react';
import { BusinessInfo } from '../types';
import { PillInput } from '../components/UI';
import { SignaturePad } from '../components/SignaturePad';
import { COUNTRIES, Country } from '../constants';

interface SetupProps {
  onComplete: (b: BusinessInfo) => void;
  initialData?: BusinessInfo;
  title?: string;
  isUpdate?: boolean;
  onBack?: () => void;
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Setup: React.FC<SetupProps> = ({ onComplete, initialData, title = "Business Setup", isUpdate = false, onBack }) => {
  const [form, setForm] = useState<BusinessInfo>(initialData || { 
    companyName: '', 
    contactPerson: '', 
    email: '', 
    phone: '', 
    address1: '', 
    address2: '',
    bankDetails: { accountName: '', accountNumber: '', bankName: '', upiId: '' } 
  });
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    const found = COUNTRIES.find(c => form.phone.startsWith(c.code));
    return found || COUNTRIES.find(c => c.name === 'India') || COUNTRIES[0];
  });
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  
  const [showSigModal, setShowSigModal] = useState(false);
  const [tempSignature, setTempSignature] = useState(form.signature || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(searchCountry.toLowerCase()) || 
      c.code.includes(searchCountry)
    );
  }, [searchCountry]);

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>, key: keyof BusinessInfo) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(p => ({ ...p, [key]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureSave = () => {
    setForm({ ...form, signature: tempSignature });
    setShowSigModal(false);
  };

  const handleSignatureCancel = () => {
    setTempSignature(form.signature || '');
    setShowSigModal(false);
  };

  const validateAndSubmit = () => {
    if (isProcessing) return;
    
    const newErrors: Record<string, string> = {};
    if (!form.companyName.trim()) newErrors.companyName = "Business name is required";
    if (!form.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
    
    const rawPhone = form.phone.replace(selectedCountry.code, '').trim();
    if (!rawPhone) newErrors.phone = "Phone number is required";
    else if (rawPhone.length < 5) newErrors.phone = "Invalid phone number";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email (e.g. user@domain.com)";
    }

    if (!form.address1.trim()) newErrors.address1 = "Address line 1 is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMsg("PLEASE CORRECT THE HIGHLIGHTED ERRORS");
      return;
    }
    
    setErrors({});
    setErrorMsg(null);
    setIsProcessing(true);
    
    setTimeout(() => {
      onComplete(form);
      setIsProcessing(false);
    }, 800);
  };

  const updateField = (key: keyof BusinessInfo, val: any) => {
    setForm({ ...form, [key]: val });
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const GalleryIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const PencilIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-6 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
        {onBack && <button type="button" onClick={onBack} className="active:scale-90 transition-all text-xl p-2 hover:text-blue-500">←</button>}
        <h1 className="text-xl font-bold uppercase tracking-widest">{title}</h1>
      </div>
      <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
        
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Brand Assets</h3>
          <div className="p-10 bg-[#F4F9FF] dark:bg-slate-900/50 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 flex justify-center gap-10 shadow-inner">
            
            <label className="relative w-36 h-36 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_15px_45px_rgba(34,83,207,0.08)] flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer active:scale-95 transition-all p-4 group">
              {form.logo ? (
                <img src={form.logo} className="w-full h-full object-contain" alt="Business Logo" />
              ) : (
                <>
                  <div className="text-[#92C5F9] transition-colors">
                    <GalleryIcon className="w-14 h-14" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#92C5F9]">LOGO</span>
                </>
              )}
              <input type="file" onChange={e => handleImg(e, 'logo')} className="hidden" accept="image/*"/>
            </label>

            <button 
              type="button"
              onClick={() => setShowSigModal(true)}
              className="relative w-36 h-36 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_15px_45px_rgba(34,83,207,0.08)] flex flex-col items-center justify-center gap-2 overflow-hidden active:scale-95 transition-all p-4 group"
            >
              {form.signature ? (
                <img src={form.signature} className="w-full h-full object-contain" alt="Authorized Signature" />
              ) : (
                <>
                  <div className="text-[#92C5F9] transition-colors">
                    <PencilIcon className="w-14 h-14" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#92C5F9]">SIGN</span>
                </>
              )}
            </button>

          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">General Information</h3>
          <PillInput label="Business Name *" value={form.companyName} onChange={v => updateField('companyName', v)} placeholder="Ex: Acme Solutions" error={errors.companyName} />
          <PillInput label="Contact Person *" value={form.contactPerson} onChange={v => updateField('contactPerson', v)} error={errors.contactPerson} />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-4 uppercase tracking-widest">Phone *</label>
                <div className={`flex items-center bg-[#F4F4F4] dark:bg-slate-800 rounded-[1rem] transition-all min-h-[56px] overflow-hidden border ${errors.phone ? 'border-red-200' : 'border-transparent'}`}>
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
                    value={form.phone.replace(selectedCountry.code, '').trim()}
                    onChange={e => updateField('phone', selectedCountry.code + ' ' + e.target.value)}
                    placeholder="Number"
                    className="flex-1 bg-transparent px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-300"
                   />
                </div>
                {errors.phone && <p className="text-[10px] font-black text-red-500 ml-5 uppercase tracking-widest">{errors.phone}</p>}
             </div>

             <PillInput label="Email *" value={form.email} onChange={v => updateField('email', v)} error={errors.email} placeholder="user@domain.com" />
          </div>

          <PillInput label="Address Line 1 *" value={form.address1} onChange={v => updateField('address1', v)} isTextArea error={errors.address1} />
          <PillInput label="Address Line 2 (Optional)" value={form.address2 || ''} onChange={v => updateField('address2', v)} isTextArea />
          <PillInput label="GSTIN / VAT (Optional)" value={form.businessNumber || ''} onChange={v => updateField('businessNumber', v)} />
        </section>

        <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
           <h3 className="text-xs font-black text-slate-400 dark:text-slate-600 mb-4 uppercase tracking-widest px-2">Bank Details</h3>
           <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 space-y-4 shadow-inner transition-colors">
              <div className="space-y-4">
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">Account Holder Name</span>
                   <input value={form.bankDetails.accountName} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, accountName: e.target.value}})} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none font-bold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors w-full" placeholder="Name"/>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">Account Number</span>
                   <input value={form.bankDetails.accountNumber} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, accountNumber: e.target.value}})} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none font-bold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors w-full" placeholder="Number"/>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">Bank Name</span>
                   <input value={form.bankDetails.bankName} onChange={e => setForm({...form, bankDetails: {...form.bankDetails, bankName: e.target.value}})} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 outline-none font-bold text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors w-full" placeholder="Name"/>
                 </div>
              </div>
           </div>
           <PillInput className="mt-4" label="UPI ID (For QR Codes)" value={form.bankDetails.upiId} onChange={v => setForm({...form, bankDetails: {...form.bankDetails, upiId: v}})} placeholder="Ex: user@upi" />
        </section>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 shadow-lg transition-colors flex flex-col gap-3">
        {errorMsg && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-1 duration-200 py-1">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.1em]">{errorMsg}</p>
          </div>
        )}
        <button 
          onClick={validateAndSubmit} 
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.5rem] font-bold text-lg active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3`}
        >
          {isProcessing && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isProcessing ? 'Processing...' : (isUpdate ? 'Save Profile' : 'Get Started')}
        </button>
      </div>

      {showSigModal && (
        <div className="fixed inset-0 bg-white dark:bg-[#1C1C1E] z-[300] flex flex-col">
          <div className="px-6 py-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] transition-colors">
            <h2 className="text-slate-900 dark:text-white font-bold text-xl uppercase tracking-widest">Draw Signature</h2>
            <button onClick={handleSignatureCancel} className="text-slate-900 dark:text-white text-2xl p-2 hover:text-blue-500 transition-colors">×</button>
          </div>
          <div className="flex-1 flex flex-col p-6 bg-slate-50 dark:bg-[#1C1C1E] justify-center transition-colors">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">Draw your signature inside the box</p>
            <div className="bg-white rounded-[2.5rem] overflow-hidden relative shadow-2xl p-4">
              <SignaturePad 
                initialValue={tempSignature} 
                onSave={(dataUrl) => setTempSignature(dataUrl)} 
              />
            </div>
          </div>
          <div className="p-8 bg-white dark:bg-[#1C1C1E] border-t border-slate-100 dark:border-slate-800 flex gap-4 transition-colors">
            <button 
              onClick={handleSignatureCancel} 
              className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.2rem] font-black text-lg active:scale-95 transition-all p-2 hover:text-blue-500"
            >
              CANCEL
            </button>
            <button 
              onClick={handleSignatureSave} 
              className="flex-[2] py-5 bg-[rgba(34,83,207)] text-white rounded-[1.2rem] font-black text-lg active:scale-95 transition-all"
            >
              SAVE SIGNATURE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setup;
