import React, { useRef, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { 
  BusinessInfo, Customer, TermCondition, Document, Settings 
} from '../types';
import { DeleteConfirmModal } from './Modals';

const formatCurrency = (num: number, symbol: string) => {
  return (symbol || '') + ' ' + num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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

const numberToWords = (num: number, currencyName: string): string => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    const val = Math.floor(n);
    if (val === 0) return '';
    const numStr = val.toString();
    if (numStr.length > 9) return 'Overflow';
    const match = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!match) return '';
    let str = '';
    str += (Number(match[1]) !== 0) ? (a[Number(match[1])] || b[Number(match[1][0])] + ' ' + a[Number(match[1][1])]) + ' Crore ' : '';
    str += (Number(match[2]) !== 0) ? (a[Number(match[2])] || b[Number(match[2][0])] + ' ' + a[Number(match[2][1])]) + ' Lakh ' : '';
    str += (Number(match[3]) !== 0) ? (a[Number(match[3])] || b[Number(match[3][0])] + ' ' + a[Number(match[3][1])]) + ' Thousand ' : '';
    str += (Number(match[4]) !== 0) ? (a[Number(match[4])] || b[Number(match[4][0])] + ' ' + a[Number(match[4][1])]) + ' Hundred ' : '';
    str += (Number(match[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(match[5])] || b[Number(match[5][0])] + ' ' + a[Number(match[5][1])]) : '';
    return str.trim();
  };

  const amount = Number(num);
  const wholePart = Math.floor(amount);
  const fractionalPart = Math.round((amount * 100) % 100);
  
  const displayCurrency = currencyName === 'INR' ? 'Rupees' : (currencyName || 'Rupees');
  const displaySubCurrency = currencyName === 'INR' ? 'Paise' : 'Cents';

  let result = convert(wholePart);
  if (result) result += ' ' + displayCurrency;
  
  if (fractionalPart > 0) {
    const fracWords = convert(fractionalPart);
    if (fracWords) {
      result += (result ? ' and ' : '') + fracWords + ' ' + displaySubCurrency;
    }
  }
  
  if (!result) return 'Zero ' + displayCurrency + ' Only';
  return result + ' Only';
};

interface DetailProps {
  doc: Document;
  business: BusinessInfo;
  settings: Settings;
  customer?: Customer;
  terms?: TermCondition;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onConvert: () => void;
  onDelete?: (id: string) => void;
}

const Detail: React.FC<DetailProps> = ({ doc, business, settings, customer, terms, onBack, onEdit, onDuplicate, onConvert, onDelete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currencySymbol = settings.general.currencySymbol;
  const currencyName = settings.general.currencyName;
  const columnHeadings = settings.columnHeadings;
  const docSetting = (settings as any)[doc.type];

  useEffect(() => {
    const updateScale = () => {
      if(containerRef.current) {
        const cw = containerRef.current.clientWidth - 32;
        const dw = 800;
        setScale(cw < dw ? cw / dw : 1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const generatePDF = async () => {
    if (!containerRef.current) return null;
    
    const element = containerRef.current.querySelector('.pdf-page') as HTMLElement;
    if (!element) return null;

    const originalScale = scale;
    const originalTransform = element.style.transform;
    const originalMargin = element.style.marginBottom;

    // Force scale 1 and remove transform for capture to ensure quality
    element.style.transform = 'none';
    element.style.marginBottom = '0';
    
    try {
      // Small delay to ensure scale reset is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        y: 0,
        x: 0,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      return pdf;
    } catch (err) {
      console.error('PDF generation failed', err);
      return null;
    } finally {
      // Restore original state
      element.style.transform = originalTransform;
      element.style.marginBottom = originalMargin;
      setScale(originalScale);
    }
  };

  const handleShare = async () => {
    const pdf = await generatePDF();
    if (!pdf) {
      alert('Failed to generate PDF for sharing.');
      return;
    }

    const fileName = `${doc.type}_${doc.docNumber}.pdf`;
    const shareText = `*${doc.type.toUpperCase()} DOCUMENT*\n\n*No:* ${doc.docNumber}\n*Date:* ${formatDate(doc.date, settings.general.dateFormat)}\n*Customer:* ${customer?.name || 'Walk-in'}\n*Total:* ${currencySymbol} ${doc.grandTotal.toLocaleString()}\n\nGenerated via QuoteFlow Pro`;

    try {
      // 1. Try Web Share API (navigator.share) with File object - Most reliable for PDF in browsers/WebViews
      if (navigator.share) {
        const blob = pdf.output('blob');
        const file = new File([blob], fileName, { type: 'application/pdf' });
        
        const shareData: any = {
          title: `${doc.type.toUpperCase()} ${doc.docNumber}`,
          text: shareText,
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }

        await navigator.share(shareData);
        return;
      }

      // 2. Try Capacitor Share as fallback for text sharing
      const canShare = await Share.canShare();
      if (canShare.value) {
        await Share.share({
          title: `${doc.type.toUpperCase()} ${doc.docNumber}`,
          text: shareText,
          dialogTitle: 'Share Document',
        });
        return;
      }

      // 3. Final fallback: Clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('Details copied to clipboard! PDF sharing not supported on this device.');
      }
    } catch (err) {
      console.error('Sharing failed', err);
      alert('Sharing failed. Please download the PDF instead.');
    }
  };

  const handleDownloadPDF = async () => {
    const pdf = await generatePDF();
    if (!pdf) {
      alert('Failed to generate PDF. Please try printing instead.');
      return;
    }

    const fileName = `${doc.type}_${doc.docNumber}.pdf`;

    try {
      // Check if running on native platform (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        const base64 = pdf.output('datauristring').split(',')[1];
        
        // Save to the Documents directory on native
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents,
        });

        alert(`PDF saved to Documents: ${fileName}`);
        
        // Try to share it as well so user can choose where to save/open
        await Share.share({
          title: fileName,
          files: [savedFile.uri],
        });
      } else {
        // Standard browser download
        pdf.save(fileName);
      }
    } catch (err) {
      console.error('Download failed', err);
      // Fallback to standard save if filesystem fails
      try {
        pdf.save(fileName);
      } catch (e) {
        alert('Download failed. Please use the Share button instead.');
      }
    }
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(doc.id);
      onBack();
    }
  };

  const taxMode = docSetting?.taxDisplay;
  const showGstColumn = taxMode === 'Per Item';
  const showGstSummary = taxMode !== 'No Tax';
  const isTaxOnTotal = taxMode === 'On Total';

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-slate-950 flex flex-col transition-colors">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white px-6 py-5 flex items-center justify-between sticky top-0 z-50 no-print shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="active:scale-90 transition-all p-2 hover:text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-black capitalize tracking-tight">{doc.type.replace('_', ' ')} Detail</h2>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1 mr-2">
             <button 
               onClick={() => setScale(prev => Math.max(0.3, prev - 0.1))}
               className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-colors"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"/></svg>
             </button>
             <span className="text-[10px] font-black w-10 text-center text-slate-600 dark:text-slate-400">{Math.round(scale * 100)}%</span>
             <button 
               onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
               className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-colors"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
             </button>
           </div>
           <button type="button" onClick={() => window.print()} className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-lg border-2 border-white/20 uppercase tracking-tight active:scale-90 transition-all hover:bg-green-600">PDF</button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 no-scrollbar flex flex-col items-center">
        <div 
          className="pdf-page bg-white w-[800px] shadow-2xl text-slate-800 flex flex-col relative ring-1 ring-slate-100 min-h-[1131px]"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: scale < 1 ? `-${(1-scale)*1131}px` : '40px' }}
        >
           {business.headerImage ? (
             <div className="w-full">
                <img src={business.headerImage} className="w-full h-auto block" alt="header" />
             </div>
           ) : (
             <div className="flex justify-between items-start mb-6 p-10 pb-0">
                <div className="w-1/3 min-h-[80px] flex items-center">
                   {business.logo && <img src={business.logo} className="w-28 h-auto object-contain block" alt="Business Logo" />}
                </div>
                <div className="w-1/3 text-center">
                   <h1 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{business.companyName}</h1>
                   <p className="text-[10px] font-bold text-slate-600">{business.contactPerson}</p>
                   <p className="text-[9px] text-slate-500 font-medium leading-tight max-w-[200px] mx-auto mt-1">{business.address1}</p>
                   <div className="flex flex-col items-center mt-2 text-[9px] text-slate-500 font-bold">
                      <span>✉️ {business.email}</span>
                   </div>
                </div>
                <div className="w-1/3 text-right">
                   <h2 className="text-base font-black uppercase text-slate-900 tracking-wider pt-2">{doc.type.replace('_', ' ')}</h2>
                </div>
             </div>
           )}

           <div className={`pt-6 mb-6 px-10 ${business.headerImage ? '' : 'border-t border-slate-200'}`}>
              <div className="flex justify-between items-start">
                 <div className="w-1/2 space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.type === 'receipt' ? 'TO,' : 'BILL TO'}</p>
                    <h3 className="text-sm font-black text-slate-900 uppercase">{customer?.name}</h3>
                    <p className="text-[10px] font-bold text-slate-600">{customer?.companyName}</p>
                    <p className="text-[10px] text-slate-500 font-medium max-w-[200px] leading-tight">{customer?.address1}</p>
                    <div className="mt-2 text-[10px] font-bold text-slate-500 flex flex-col">
                       <span>📱 {customer?.mobile}</span>
                       <span>✉️ {customer?.email}</span>
                    </div>
                 </div>
                 <div className="text-right space-y-1">
                    <div className="flex justify-end gap-2 items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.type.replace('_', ' ')}#</span>
                      <span className="text-[10px] text-slate-900 font-black">{doc.docNumber}</span>
                    </div>
                    <div className="flex justify-end gap-2 items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date:</span>
                      <span className="text-[10px] text-slate-900 font-black">{formatDate(doc.date, settings.general.dateFormat)}</span>
                    </div>
                 </div>
              </div>
           </div>

           {doc.type !== 'receipt' && (
             <div className="mb-6 overflow-hidden border-y border-slate-200 mx-10">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="text-slate-900 text-[9px] font-black uppercase tracking-widest border-b border-slate-200">
                      <th className="py-3 px-2 w-8 text-center">#</th>
                      <th className="py-3 px-2">DESCRIPTION</th>
                      {docSetting?.hsnDisplay === 'Yes' && <th className="py-3 px-2 text-center w-24">{columnHeadings.hsnLabel}</th>}
                      <th className="py-3 px-2 text-center w-12">QTY</th>
                      {doc.type !== 'delivery_note' && (
                        <>
                          <th className="py-3 px-2 text-right w-24">PRICE</th>
                          {showGstColumn && <th className="py-3 px-2 text-center w-16">{columnHeadings.taxLabel}</th>}
                          <th className="py-3 px-2 text-right w-24">TOTAL</th>
                        </>
                      )}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-700">
                    {doc.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-2 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-2">
                           <p className="font-black text-slate-800 uppercase tracking-tight">{it.name}</p>
                           {it.description && <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">{it.description}</p>}
                        </td>
                        {docSetting?.hsnDisplay === 'Yes' && <td className="py-3 px-2 text-center text-slate-500">{it.hsn || '-'}</td>}
                        <td className="py-3 px-2 text-center">{it.quantity}</td>
                        {doc.type !== 'delivery_note' && (
                          <>
                            <td className="py-3 px-2 text-right">{formatCurrency(it.price, currencySymbol)}</td>
                            {showGstColumn && (
                              <td className="py-3 px-2 text-center">
                                <p className="text-slate-500">{formatCurrency(it.price * it.quantity * (it.gst/100), currencySymbol)}</p>
                                <p className="text-[8px] text-slate-400">{it.gst.toFixed(2)}%</p>
                              </td>
                            )}
                            <td className="py-3 px-2 text-right font-black text-slate-900">{formatCurrency(it.price * it.quantity * (showGstColumn ? (1 + it.gst/100) : 1), currencySymbol)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           )}

           {doc.type !== 'receipt' && doc.type !== 'delivery_note' && (
             <div className="flex justify-between items-start mb-6 px-10">
                <div className="w-1/2">
                   <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1">AMOUNT IN WORDS:</p>
                   <p className="text-[10px] font-bold text-slate-700 leading-tight uppercase">{numberToWords(doc.grandTotal, currencyName)}</p>
                </div>
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-3">
                   <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>SUB TOTAL</span>
                      <span>{formatCurrency(doc.subTotal, currencySymbol)}</span>
                   </div>
                   {showGstSummary && (
                     <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>{columnHeadings.taxLabel} {isTaxOnTotal && `(${docSetting.taxRate ?? 18}%)`}</span>
                        <span>{formatCurrency(doc.totalTax, currencySymbol)}</span>
                     </div>
                   )}
                   {doc.otherCharges.length > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <span>{columnHeadings.otherChargesLabel}</span>
                         <span>{formatCurrency(doc.otherCharges.reduce((s,o)=>s+o.amount,0), currencySymbol)}</span>
                      </div>
                   )}
                   {doc.roundOff && (
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                         <span>Round-off</span>
                         <span className="text-slate-900">{formatCurrency(Math.abs(doc.grandTotal - (doc.subTotal + (showGstSummary ? doc.totalTax : 0) + doc.otherCharges.reduce((s,o)=>s+o.amount,0))), currencySymbol)}</span>
                      </div>
                   )}
                   <div className="pt-2 border-y-2 border-slate-200 flex justify-between items-center py-2.5 mt-2">
                      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-900">GRAND TOTAL</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(doc.grandTotal, currencySymbol)}</span>
                   </div>
                </div>
             </div>
           )}

            {docSetting?.bankDisplay === 'Yes' && business.bankDetails && (
             <div className="mb-6 px-10">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 pb-1 border-b border-slate-200">BANK ACCOUNT DETAILS</p>
                  <div className="flex flex-wrap gap-x-8 gap-y-1.5 text-[9px] font-bold text-slate-700">
                    <p className="min-w-[200px]"><span className="text-slate-400 uppercase tracking-tighter mr-1">A/C NAME:</span> {business.bankDetails.accountName.toUpperCase()}</p>
                    <p className="min-w-[200px]"><span className="text-slate-400 uppercase tracking-tighter mr-1">BANK:</span> {business.bankDetails.bankName.toUpperCase()}</p>
                    <p className="min-w-[200px]"><span className="text-slate-400 uppercase tracking-tighter mr-1">A/C NO:</span> {business.bankDetails.accountNumber}</p>
                    {business.bankDetails.upiId && <p className="min-w-[200px]"><span className="text-slate-400 uppercase tracking-tighter mr-1">UPI ID:</span> {business.bankDetails.upiId}</p>}
                  </div>
               </div>
             </div>
            )}

           <div className="flex justify-between mt-auto pt-8 px-10 mb-10 min-h-[150px]">
              <div className="w-1/2 space-y-8">
                 {doc.type !== 'receipt' && (
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Terms & Conditions:</p>
                      <ul className="space-y-1 list-none">
                         {terms?.content.split('\n').filter(l=>l.trim()).map((line, i) => (
                            <li key={i} className="text-[9px] font-bold text-slate-500 flex gap-2 leading-tight">
                              <span className="text-slate-300 flex-shrink-0">•</span> 
                              <span>{line}</span>
                            </li>
                         )) || <li className="text-[9px] text-slate-300 italic">Standard business terms apply.</li>}
                      </ul>
                   </div>
                 )}
              </div>
              <div className="text-center min-w-[220px] space-y-4 flex flex-col justify-end">
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">For, {business.companyName.toUpperCase()}</p>
                 {docSetting?.signatureDisplay === 'Yes' && (
                   <>
                     <div className="h-20 flex items-center justify-center relative bg-slate-50/30 rounded-lg border border-transparent">
                        {business.signature ? (
                           <img src={business.signature} className="h-full object-contain block" alt="Authorized Signature" />
                        ) : (
                           <div className="w-32 border-b border-slate-200 border-dashed" />
                        )}
                     </div>
                     <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] pt-1">Authorized Signature</p>
                   </>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-6 no-print shadow-[0_-15px_40px_rgba(0,0,0,0.05)] sticky bottom-0 z-[100] transition-colors">
        <div className="max-w-xl mx-auto flex justify-between items-center px-4 relative">
           <DetailNavBtn label="DUPLICATE" icon={<ClipboardIcon />} onClick={onDuplicate} />
           <DetailNavBtn label="EDIT" icon={<PencilIcon />} onClick={onEdit} />
           {doc.type === 'quotation' && <DetailNavBtn label="INVOICE" icon={<InvoiceIcon />} onClick={onConvert} />}
           <DetailNavBtn label="SHARE" icon={<ShareArrowIcon />} onClick={() => handleShare()} />
           
           <div className="relative">
             <DetailNavBtn label="MORE" icon={<DotsIcon />} onClick={() => setShowMoreMenu(!showMoreMenu)} />
             
             {showMoreMenu && (
                <div className="absolute bottom-full right-0 mb-6 w-56 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-50 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-[110]">
                   <button 
                     onClick={() => { setShowMoreMenu(false); handleDownloadPDF(); }}
                     className="w-full px-6 py-4 text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4 transition-colors p-2 hover:text-blue-500 border-b border-slate-50 dark:border-slate-700"
                   >
                      <span className="text-lg grayscale brightness-125">📥</span>
                      <span>Download PDF</span>
                   </button>
                   <button 
                     onClick={() => { setShowMoreMenu(false); setShowDeleteConfirm(true); }}
                     className="w-full px-6 py-4 text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4 transition-colors p-2 hover:text-blue-500"
                   >
                      <span className="text-lg grayscale brightness-125">🗑️</span>
                      <span>Delete Document</span>
                   </button>
                </div>
             )}
           </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal 
          title="document" 
          onConfirm={confirmDelete} 
          onCancel={() => setShowDeleteConfirm(false)} 
        />
      )}
    </div>
  );
};

const DetailNavBtn: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void }> = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2.5 group active:scale-90 transition-all p-2 hover:text-blue-500">
    <div className="w-[52px] h-[52px] bg-[#F1F3F5] dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
       <div className="text-slate-700 dark:text-white w-5 h-5 flex items-center justify-center opacity-80">
          {icon}
       </div>
    </div>
    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em]">{label}</span>
  </button>
);

const ClipboardIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
);
const PencilIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
);
const InvoiceIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
);
const ShareArrowIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
);
const DotsIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);

export default Detail;
