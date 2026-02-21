import React, { useState, useEffect, useCallback } from 'react';
import {
  Customer, Document, DocType, DocumentItem
} from './types';
import { APP_STORAGE_KEY, DEFAULT_SETTINGS } from './constants';
import Workbench from './views/Workbench';
import Detail from './views/Detail';
import List from './views/List';
import ManageItems from './views/ManageItems';
import Setup from './views/Setup';
import SettingsMenu from './views/SettingsMenu';
import Profile from './views/Profile';
import ChangePassword from './views/ChangePassword';
import DeleteAccount from './views/DeleteAccount';
import SettingEditor from './views/SettingEditor';
import ColumnHeadingEditor from './views/ColumnHeadingEditor';
import DateCurrencyEditor from './views/DateCurrencyEditor';
import ReportDownloader from './views/ReportDownloader';
import HeaderFooterEditor from './views/HeaderFooterEditor';
import ImportPDF from './views/ImportPDF';
import GeminiKeyEditor from './views/GeminiKeyEditor';
import { Card } from './components/UI';

const App: React.FC = () => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    let initialState = saved
      ? JSON.parse(saved)
      : {
          isSetup: false,
          business: null,
          customers: [],
          products: [],
          terms: [],
          documents: [],
          settings: DEFAULT_SETTINGS,
          theme: 'light',
        };

    const ensureIds = (arr: any[], prefix: string) => {
      return (arr || []).map((item, index) => {
        if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
          item.id = `${prefix}_${Date.now()}_${index}_${Math.random()
            .toString(36)
            .substring(2, 10)}`;
        }
        return item;
      });
    };

    initialState.customers = ensureIds(initialState.customers, 'cust');
    initialState.products = ensureIds(initialState.products, 'prod');
    initialState.terms = ensureIds(initialState.terms, 'term');
    initialState.documents = ensureIds(initialState.documents, 'doc');
    
    if (!initialState.settings.columnHeadings) initialState.settings.columnHeadings = DEFAULT_SETTINGS.columnHeadings;
    if (!initialState.settings.general) initialState.settings.general = DEFAULT_SETTINGS.general;

    return initialState;
  });

  const [view, setView] = useState<
    | 'dashboard'
    | 'workbench'
    | 'detail'
    | 'list'
    | 'manage_items'
    | 'settings_menu'
    | 'setting_editor'
    | 'column_heading'
    | 'date_currency'
    | 'download_reports'
    | 'header_footer'
    | 'import_pdf'
    | 'business_setup'
    | 'profile'
    | 'change_password'
    | 'delete_account'
    | 'gemini_key'
  >('dashboard');
  
  const [currentDocType, setCurrentDocType] = useState<DocType | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [manageTarget, setManageTarget] = useState<'customer' | 'product' | 'terms' | null>(null);
  const [listTarget, setListTarget] = useState<DocType | null>(null);
  const [editorTarget, setEditorTarget] = useState<DocType | null>(null);
  const [importTarget, setImportTarget] = useState<string>('Quotation');

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleNavImport = (e: any) => {
      const type = e.detail;
      const formattedType = type.split('_').map((w:any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setImportTarget(formattedType);
      setView('import_pdf');
    };
    window.addEventListener('nav-import', handleNavImport);
    return () => window.removeEventListener('nav-import', handleNavImport);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const updateState = (key: string, valueOrUpdater: any) => {
    setState((prev: any) => {
      const newValue =
        typeof valueOrUpdater === 'function'
          ? valueOrUpdater(prev[key])
          : valueOrUpdater;
      return { ...prev, [key]: newValue };
    });
  };

  const handleImportFinalize = (data: any) => {
    const customerId = `cust_${Date.now()}`;
    const newCustomer: Customer = {
      id: customerId,
      name: data.customer.name,
      companyName: data.customer.companyName || '',
      email: data.customer.email || '',
      mobile: data.customer.mobile || '',
      address1: data.customer.address || '',
      state: ''
    };

    const newItems: DocumentItem[] = data.items.map((it: any, idx: number) => ({
      productId: `prod_${Date.now()}_${idx}`,
      name: it.name,
      quantity: it.quantity || 0,
      price: it.price || 0,
      gst: it.gst || 0,
      hsn: it.hsn || '',
      description: it.description || ''
    }));

    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      type: data.docType as DocType,
      docNumber: data.totals.docNumber || `IMP-${Date.now()}`,
      date: data.totals.date || new Date().toISOString().split('T')[0],
      customerId: customerId,
      items: newItems,
      otherCharges: [],
      subTotal: data.totals.subTotal || 0,
      totalTax: data.totals.totalTax || 0,
      grandTotal: data.totals.grandTotal || 0,
    };

    setState((prev: any) => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
      documents: [...prev.documents, newDoc],
    }));

    setSelectedDoc(newDoc);
    setView('detail');
    showToast("PDF imported successfully!");
  };

  const handleLogout = () => {
    setState((prev: any) => ({ ...prev, isSetup: false, business: null }));
    setView('dashboard');
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem(APP_STORAGE_KEY);
    window.location.reload();
  };

  const toggleTheme = () => {
    updateState('theme', state.theme === 'light' ? 'dark' : 'light');
  };

  const removeItem = (key: string, id: string) => {
    if (!key || !id) return;
    updateState(key, (prevList: any[]) => {
      return (prevList || []).filter((item: any) => String(item.id) !== String(id));
    });
  };

  if (!state.isSetup) {
    return (
      <Setup
        onComplete={(b) => {
          setState((prev: any) => ({ ...prev, business: b, isSetup: true }));
          showToast("Business settings updated successfully!");
        }}
      />
    );
  }

  if (view === 'workbench') {
    return (
      <Workbench
        type={currentDocType || editingDoc?.type || 'quotation'}
        state={state}
        initialData={editingDoc || undefined}
        onSave={(doc) => {
          const isNew = !doc.id;
          const finalId = doc.id || Date.now().toString();
          
          if (isNew) {
            const docType = doc.type;
            const currentSettings = state.settings[docType];
            updateState('settings', {
              ...state.settings,
              [docType]: { ...currentSettings, serialNumber: currentSettings.serialNumber + 1 }
            });
            updateState('documents', (prev: Document[]) => [...prev, { ...doc, id: finalId }]);
          } else {
            updateState('documents', (prev: Document[]) =>
              prev.map((d: Document) => (d.id === doc.id ? doc : d))
            );
          }
          
          setSelectedDoc({ ...doc, id: finalId });
          setView('detail');
          setEditingDoc(null);
          setCurrentDocType(null);
          showToast(`${doc.type.replace('_', ' ')} saved successfully!`);
        }}
        onCancel={() => {
          setView('dashboard');
          setEditingDoc(null);
          setCurrentDocType(null);
        }}
        updateState={updateState}
      />
    );
  }

  if (view === 'detail' && selectedDoc) {
    return (
      <Detail
        doc={selectedDoc}
        business={state.business}
        settings={state.settings}
        customer={state.customers.find((c: any) => c.id === selectedDoc.customerId)}
        terms={state.terms.find((t: any) => t.id === selectedDoc.termsId)}
        onBack={() => setView(listTarget ? 'list' : 'dashboard')}
        onEdit={() => {
          setEditingDoc(selectedDoc);
          setView('workbench');
        }}
        onDuplicate={() => {
          setEditingDoc({
            ...selectedDoc,
            id: '',
            docNumber: selectedDoc.docNumber + '-COPY',
          });
          setView('workbench');
        }}
        onConvert={() => {
          setEditingDoc({
            ...selectedDoc,
            type: 'invoice',
            id: '',
            docNumber: 'INV-' + Date.now(),
          });
          setView('workbench');
        }}
        onDelete={(id: string) => {
          removeItem('documents', id);
          showToast("Document deleted successfully");
        }}
      />
    );
  }

  if (view === 'list' && listTarget) {
    return (
      <List
        type={listTarget}
        state={state}
        updateState={updateState}
        onSelect={(doc: Document) => {
          setSelectedDoc(doc);
          setView('detail');
        }}
        onEdit={(doc: Document) => {
          setEditingDoc(doc);
          setView('workbench');
        }}
        onDelete={(id: string) => {
          removeItem('documents', id);
          showToast("Document deleted successfully");
        }}
        onBack={() => {
          setView('dashboard');
          setListTarget(null);
        }}
        onCreate={() => {
          setCurrentDocType(listTarget);
          setView('workbench');
        }}
      />
    );
  }

  if (view === 'manage_items' && manageTarget) {
    return (
      <ManageItems
        target={manageTarget}
        state={state}
        updateState={updateState}
        removeItem={removeItem}
        onBack={() => {
          setView('dashboard');
          setManageTarget(null);
        }}
      />
    );
  }

  if (view === 'business_setup') {
    return (
      <Setup
        onComplete={(b) => {
          updateState('business', b);
          setView('dashboard');
          setTimeout(() => {
            showToast("Business settings updated successfully!");
          }, 400);
        }}
        initialData={state.business}
        title="Business Info"
        isUpdate
        onBack={() => setView('dashboard')}
      />
    );
  }

  if (view === 'settings_menu') {
    return (
      <SettingsMenu
        onBack={() => setView('dashboard')}
        onNavigate={(targetView, params) => {
          if (targetView === 'logout') return handleLogout();
          if (targetView === 'setting_editor') setEditorTarget(params);
          setView(targetView as any);
        }}
      />
    );
  }

  if (view === 'setting_editor' && editorTarget) {
    return (
      <SettingEditor 
        type={editorTarget} 
        settings={state.settings[editorTarget]} 
        onBack={() => setView('settings_menu')}
        onSave={(newSettings) => {
          updateState('settings', { ...state.settings, [editorTarget]: newSettings });
          setView('settings_menu');
          showToast(`${editorTarget.replace('_', ' ')} settings updated!`);
        }}
      />
    );
  }

  if (view === 'column_heading') {
    return (
      <ColumnHeadingEditor 
        settings={state.settings.columnHeadings}
        onBack={() => setView('settings_menu')}
        onSave={(newCols) => {
          updateState('settings', { ...state.settings, columnHeadings: newCols });
          setView('settings_menu');
          showToast("Column labels updated successfully!");
        }}
      />
    );
  }

  if (view === 'date_currency') {
    return (
      <DateCurrencyEditor 
        settings={state.settings.general}
        onBack={() => setView('settings_menu')}
        onSave={(newGen) => {
          updateState('settings', { ...state.settings, general: newGen });
          setView('settings_menu');
          showToast("General settings updated!");
        }}
      />
    );
  }

  if (view === 'download_reports') {
    return <ReportDownloader onBack={() => setView('settings_menu')} />;
  }

  if (view === 'header_footer') {
    return (
      <HeaderFooterEditor 
        business={state.business}
        onBack={() => setView('settings_menu')}
        onUpdate={(newB) => {
          updateState('business', newB);
          showToast("Header/Footer templates updated!");
        }}
      />
    );
  }

  if (view === 'import_pdf') {
    return (
      <ImportPDF 
        initialType={importTarget}
        onBack={() => setView(editorTarget ? 'setting_editor' : 'settings_menu')}
        onImport={handleImportFinalize}
      />
    );
  }

  if (view === 'profile') {
    return (
      <Profile
        business={state.business}
        onUpdate={(b) => {
          updateState('business', b);
          showToast("Profile updated successfully!");
        }}
        onBack={() => setView('settings_menu')}
        onLogout={() => setView('dashboard')}
        onNavigate={(targetView) => setView(targetView as any)}
      />
    );
  }

  if (view === 'change_password') {
    return (
      <ChangePassword 
        business={state.business}
        onUpdate={(newB) => {
          updateState('business', newB);
          showToast("Password changed successfully!");
        }}
        onBack={() => setView('profile')} 
      />
    );
  }

  if (view === 'delete_account') {
    return <DeleteAccount onBack={() => setView('profile')} onDelete={handleDeleteAccount} />;
  }

  if (view === 'gemini_key') {
    return (
      <GeminiKeyEditor 
        onBack={() => setView('settings_menu')} 
        onSave={() => {
          setView('settings_menu');
          showToast("Gemini API Key saved!");
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center transition-colors font-sans relative">
      <div className="w-full max-w-md bg-transparent px-6 py-8 space-y-8 pb-32">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-[32px] font-black text-[#1C1C1E] dark:text-white tracking-tight leading-none">
              Welcome
            </h1>
            <p className="text-[14px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {state.business?.contactPerson?.toUpperCase() || 'USER NAME'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-12 h-12 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
          >
            {state.theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <section className="space-y-5">
          <h2 className="text-[22px] font-extrabold text-[#1C1C1E] dark:text-slate-200 tracking-tight">Manage</h2>
          <div className="grid grid-cols-4 gap-4">
            <SquareIconBtn label="BUSINESS" icon="🏢" onClick={() => setView('business_setup')} />
            <SquareIconBtn label="CUSTOMER" icon="👤" onClick={() => { setManageTarget('customer'); setView('manage_items'); }} />
            <SquareIconBtn label="PRODUCT" icon="📦" onClick={() => { setManageTarget('product'); setView('manage_items'); }} />
            <SquareIconBtn label="TERMS" icon="📜" onClick={() => { setManageTarget('terms'); setView('manage_items'); }} />
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-none space-y-6">
          <h2 className="text-[22px] font-extrabold text-[#1C1C1E] dark:text-slate-200 tracking-tight">Discover</h2>
          <div className="grid grid-cols-2 gap-5">
            <DiscoverCard label="Make Quotation" icon="📄" sub="Create a new quotation" onClick={() => { setCurrentDocType('quotation'); setView('workbench'); }} />
            <DiscoverCard label="Quotation List" icon="📋" sub="Manage all quotations" onClick={() => { setListTarget('quotation'); setView('list'); }} />
            <DiscoverCard label="Make Invoice" icon="💰" sub="Create a new invoice" onClick={() => { setCurrentDocType('invoice'); setView('workbench'); }} />
            <DiscoverCard label="Invoice List" icon="💵" sub="Manage all invoices" onClick={() => { setListTarget('invoice'); setView('list'); }} />
            <DiscoverCard label="Purchase Order" icon="📑" sub="Manage purchase orders" onClick={() => { setListTarget('purchase_order'); setView('list'); }} />
            <DiscoverCard label="Delivery Note" icon="🚚" sub="Manage delivery notes" onClick={() => { setListTarget('delivery_note'); setView('list'); }} />
            <DiscoverCard label="Settings" icon="⚙️" sub="Manage app settings" onClick={() => setView('settings_menu')} />
            <DiscoverCard label="Contact Us" icon="👤" sub="Contact support" onClick={() => window.open('https://wa.me/', '_blank')} />
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-10 left-6 right-6 flex justify-center z-[200] animate-in slide-in-from-bottom-6 fade-in duration-300">
           <div className="bg-[#2D2D2D] text-white px-6 py-4 rounded-[1.25rem] shadow-2xl flex items-center gap-4 max-w-sm w-full border border-white/5 ring-1 ring-black/50">
              <div className="text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7L22 14c0-1.25-.75-2-2-2h-6" />
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </div>
              <p className="text-[14px] font-bold tracking-tight">{toast}</p>
           </div>
        </div>
      )}
    </div>
  );
};

const DiscoverCard: React.FC<{ label: string; icon: string; sub: string; onClick: () => void; }> = ({ label, icon, sub, onClick }) => (
  <Card onClick={onClick} className="p-5 flex flex-col items-start gap-3 text-left border-none shadow-sm rounded-[2rem] bg-white dark:bg-slate-800 transition-all active:scale-[0.98]">
    <div className="w-10 h-10 flex items-center justify-center">
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="space-y-0.5">
      <h3 className="font-bold text-[#1C1C1E] dark:text-white text-[14px] leading-tight">{label}</h3>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{sub}</p>
    </div>
  </Card>
);

const SquareIconBtn: React.FC<{ label: string; icon: string; onClick: () => void; }> = ({ label, icon, onClick }) => (
  <button type="button" onClick={onClick} className="flex flex-col items-center gap-2.5 group">
    <div className="w-[78px] h-[78px] bg-white dark:bg-slate-900 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[30px] group-active:scale-90 transition-all">{icon}</div>
    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-tight uppercase">{label}</span>
  </button>
);

export default App;
