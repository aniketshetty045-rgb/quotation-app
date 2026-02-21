import React, { useState, useRef, useEffect } from 'react';
import { BusinessInfo } from '../types';

interface HeaderFooterEditorProps {
  business: BusinessInfo;
  onUpdate: (b: BusinessInfo) => void;
  onBack: () => void;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const HeaderFooterEditor: React.FC<HeaderFooterEditorProps> = ({ business, onUpdate, onBack }) => {
  const [form, setForm] = useState<BusinessInfo>({ ...business });
  const [cropTarget, setCropTarget] = useState<'headerImage' | 'footerImage' | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'headerImage' | 'footerImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setCropTarget(key);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (key: 'headerImage' | 'footerImage') => {
    const newForm = { ...form, [key]: undefined };
    setForm(newForm);
    onUpdate(newForm);
  };

  useEffect(() => {
    if (cropTarget && tempImage && imgRef.current) {
      const img = imgRef.current;
      const initCrop = () => {
        const displayWidth = img.width;
        const displayHeight = img.height;
        let w = displayWidth * 0.9;
        let h = w / 6;
        if (h > displayHeight) {
          h = displayHeight * 0.9;
          w = h * 6;
        }
        setCropBox({
          x: (displayWidth - w) / 2,
          y: (displayHeight - h) / 2,
          width: w,
          height: h
        });
      };
      if (img.complete) {
        initCrop();
      } else {
        img.onload = initCrop;
      }
    }
  }, [cropTarget, tempImage]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - cropBox.x, y: clientY - cropBox.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imgRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const imgRect = imgRef.current.getBoundingClientRect();
    let newX = clientX - dragStart.x;
    let newY = clientY - dragStart.y;
    newX = Math.max(0, Math.min(newX, imgRect.width - cropBox.width));
    newY = Math.max(0, Math.min(newY, imgRect.height - cropBox.height));
    setCropBox(prev => ({ ...prev, x: newX, y: newY }));
  };

  const performCrop = () => {
    if (!imgRef.current || !cropTarget) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1200;
    canvas.height = 200;
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    ctx.drawImage(
      img,
      cropBox.x * scaleX,
      cropBox.y * scaleY,
      cropBox.width * scaleX,
      cropBox.height * scaleY,
      0,
      0,
      1200,
      200
    );
    const croppedData = canvas.toDataURL('image/jpeg', 0.95);
    const newForm = { ...form, [cropTarget]: croppedData };
    setForm(newForm);
    onUpdate(newForm);
    setCropTarget(null);
    setTempImage(null);
  };

  const handleBuy = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Redirecting to checkout...");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center justify-between sticky top-0 z-50 text-slate-900 dark:text-white shadow-sm transition-colors">
        <div className="flex items-center gap-4">
           <button type="button" onClick={onBack} className="active:scale-90 transition-all text-2xl font-light p-2 hover:text-blue-500">←</button>
           <h1 className="text-xl font-bold">Header Footer Template</h1>
        </div>
        <button 
          onClick={() => window.open('https://wa.me/', '_blank')}
          className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-slate-700 p-2 hover:text-blue-500 transition-colors"
        >
          Let's Chat
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c1.079.59 1.954.827 3.162.827h.002c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.77-5.766zm3.377 8.203c-.144.405-.833.78-1.145.829-.311.049-.607.067-.93.049-.323-.018-.646-.054-.968-.144-.323-.09-.646-.234-.969-.414-.322-.18-.645-.414-.968-.684-.322-.27-.645-.594-.968-.972-.323-.378-.539-.756-.755-1.134-.216-.378-.323-.756-.378-1.08-.054-.324-.054-.648 0-.972.054-.324.216-.648.432-.864.216-.216.486-.324.756-.324.27 0 .486.054.648.162l.81 1.62c.108.216.054.432-.054.648l-.324.432c-.108.216-.162.432-.054.648.108.216.27.432.432.648.162.216.378.378.594.54.216.162.432.27.648.378.216.108.432.162.648.054l.432-.324c.216-.108.432-.162.648-.054l1.62.81c.108.054.162.27.162.432-.054.432-.162.756-.324.972z"/></svg>
        </button>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-32">
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          If you don't have a letterhead, contact us via 'Let's Chat'
        </p>

        <section className="space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-black dark:text-white">Header Image:</h3>
              <div className="flex items-center gap-2">
                 {form.headerImage && (
                    <button onClick={() => { setTempImage(form.headerImage!); setCropTarget('headerImage'); }} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest p-2 hover:text-blue-500 transition-colors">CROP</button>
                 )}
                 {form.headerImage && <button onClick={() => removeImage('headerImage')} className="text-slate-400 p-2 hover:text-blue-500 transition-colors">🗑️</button>}
              </div>
           </div>
           <label className="block w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all min-h-[100px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 p-2 hover:text-blue-500">
              {form.headerImage ? (
                 <img src={form.headerImage} className="w-full h-auto" alt="Header" />
              ) : (
                 <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select Header Image</span>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'headerImage')} />
           </label>
        </section>

        <section className="space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-black dark:text-white">Footer Image:</h3>
              <div className="flex items-center gap-2">
                 {form.footerImage && (
                    <button onClick={() => { setTempImage(form.footerImage!); setCropTarget('footerImage'); }} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest p-2 hover:text-blue-500 transition-colors">CROP</button>
                 )}
                 {form.footerImage && <button onClick={() => removeImage('footerImage')} className="text-slate-400 p-2 hover:text-blue-500 transition-colors">🗑️</button>}
              </div>
           </div>
           <label className="block w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-all min-h-[100px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 p-2 hover:text-blue-500">
              {form.footerImage ? (
                 <img src={form.footerImage} className="w-full h-auto" alt="Footer" />
              ) : (
                 <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select Footer Image</span>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'footerImage')} />
           </label>
        </section>

        <section className="space-y-4">
           <h3 className="text-lg font-black dark:text-white">Preview:</h3>
           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-inner transition-colors">
              <div className="bg-white rounded shadow-md overflow-hidden flex flex-col min-h-[300px] relative">
                 {form.headerImage && <img src={form.headerImage} className="w-full h-auto border-b" alt="Header Preview" />}
                 <div className="p-4 flex-1">
                    <div className="flex justify-between mb-4">
                       <div className="space-y-1">
                          <div className="h-2 w-20 bg-slate-100 rounded" />
                          <div className="h-2 w-16 bg-slate-100 rounded" />
                       </div>
                       <div className="h-4 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="space-y-2 mt-8">
                       <div className="h-3 w-full bg-slate-50 rounded" />
                       <div className="h-3 w-full bg-slate-50 rounded" />
                       <div className="h-3 w-2/3 bg-slate-50 rounded" />
                    </div>
                 </div>
                 {form.footerImage && <img src={form.footerImage} className="w-full h-auto border-t" alt="Footer Preview" />}
              </div>
           </div>
        </section>
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t dark:border-slate-800 sticky bottom-0 z-40 transition-colors">
        <button 
          onClick={handleBuy}
          disabled={isProcessing}
          className={`w-full py-5 ${isProcessing ? 'bg-slate-400' : 'bg-[rgba(34,83,207)]'} text-white rounded-[1.25rem] font-bold text-lg active:scale-95 transition-all shadow-xl shadow-black/10 flex flex-col items-center justify-center gap-1`}
        >
          {isProcessing ? (
             <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
             </span>
          ) : (
            <>
              <span>Buy</span>
              <span className="text-[11px] font-black opacity-80">₹1,999.00 @ Lifetime</span>
            </>
          )}
        </button>
      </div>

      {cropTarget && tempImage && (
         <div 
           className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200 transition-colors"
           onMouseMove={handleDragMove}
           onMouseUp={() => setIsDragging(false)}
           onMouseLeave={() => setIsDragging(false)}
           onTouchMove={handleDragMove}
           onTouchEnd={() => setIsDragging(false)}
         >
            <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 z-10 text-slate-900 dark:text-white transition-colors">
               <div className="flex items-center gap-8">
                  <button onClick={() => { setCropTarget(null); setTempImage(null); }} className="active:scale-90 transition-all p-2 hover:text-blue-500">
                     <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                  </button>
                  <h2 className="font-bold text-lg tracking-tight">Crop Image</h2>
               </div>
               <button onClick={performCrop} className="font-black text-sm tracking-[0.1em] uppercase p-2 hover:text-blue-500 transition-colors">CROP</button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-900/50 transition-colors">
               <div className="relative inline-block max-w-[90vw] max-h-[70vh]">
                  <img 
                    ref={imgRef}
                    src={tempImage} 
                    className="max-w-full max-h-full block pointer-events-none opacity-40 blur-[1px]" 
                    alt="Source"
                  />
                  <div 
                    className="absolute z-20 cursor-move border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(255,255,255,0.7)] dark:shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] overflow-hidden"
                    style={{ 
                      left: `${cropBox.x}px`, 
                      top: `${cropBox.y}px`, 
                      width: `${cropBox.width}px`, 
                      height: `${cropBox.height}px` 
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                  >
                     <img 
                       src={tempImage}
                       className="absolute pointer-events-none max-w-none"
                       style={{
                         left: `-${cropBox.x}px`,
                         top: `-${cropBox.y}px`,
                         width: `${imgRef.current?.width}px`,
                         height: `${imgRef.current?.height}px`
                       }}
                       alt="Crop visual"
                     />
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default HeaderFooterEditor;
