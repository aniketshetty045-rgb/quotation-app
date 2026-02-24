import React, { useState } from 'react';
import { DocType } from '../types';

interface SettingsMenuProps {
  onBack: () => void;
  onNavigate: (view: string, params?: any) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack, onNavigate }) => {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutAlert(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors font-sans relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 h-20 flex items-center gap-4 sticky top-0 z-50 shadow-sm transition-colors text-slate-900 dark:text-white">
        <button type="button" onClick={onBack} className="active:scale-90 transition-all p-2 hover:text-blue-500">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <section className="mt-8">
          <div className="px-6 mb-4">
            <div className="bg-[#F2F2F2] dark:bg-slate-800/60 px-5 py-2.5 rounded-[1.25rem] inline-block">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Account</h3>
            </div>
          </div>
          <div className="space-y-1">
            <SettingsItem icon={<UserIcon />} label="Profile" onClick={() => onNavigate('profile')} />
            <SettingsItem icon={<BusinessIcon />} label="Business Info" onClick={() => onNavigate('business_setup')} />
            <SettingsItem icon={<SubscriptionIcon />} label="Subscription" onClick={() => {}} />
            <SettingsItem icon={<LogoutIcon />} label="Logout" onClick={handleLogoutClick} />
          </div>
        </section>

        <section className="mt-8">
          <div className="px-6 mb-4">
            <div className="bg-[#F2F2F2] dark:bg-slate-800/60 px-5 py-2.5 rounded-[1.25rem] inline-block">
               <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Document Settings</h3>
            </div>
          </div>
          <div className="space-y-1">
            <SettingsItem icon={<ToolsIcon />} label="Quotation Settings" onClick={() => onNavigate('setting_editor', 'quotation')} />
            <SettingsItem icon={<ToolsIcon />} label="Invoice Settings" onClick={() => onNavigate('setting_editor', 'invoice')} />
            <SettingsItem icon={<ToolsIcon />} label="Purchase Order Settings" onClick={() => onNavigate('setting_editor', 'purchase_order')} />
            <SettingsItem icon={<ToolsIcon />} label="Proforma Invoice Settings" onClick={() => onNavigate('setting_editor', 'proforma')} />
            <SettingsItem icon={<ToolsIcon />} label="Delivery Note Settings" onClick={() => onNavigate('setting_editor', 'delivery_note')} />
            <SettingsItem icon={<ToolsIcon />} label="Receipt Settings" onClick={() => onNavigate('setting_editor', 'receipt')} />
            <SettingsItem icon={<ImportIcon />} label="Import PDF" onClick={() => onNavigate('import_pdf')} />
            <SettingsItem icon={<GearsIcon />} label="Column Heading (GST, HSN, Other Charges)" onClick={() => onNavigate('column_heading')} />
            <SettingsItem icon={<GearThinIcon />} label="Date & Currency settings" onClick={() => onNavigate('date_currency')} />
            <SettingsItem icon={<ChartIcon />} label="Download Reports & Statements" onClick={() => onNavigate('download_reports')} />
            <SettingsItem icon={<ChartIcon />} label="Header Footer Template" onClick={() => onNavigate('header_footer')} />
          </div>
        </section>

        <section className="mt-8">
          <div className="px-6 mb-4">
             <div className="bg-[#F2F2F2] dark:bg-slate-800/60 px-5 py-2.5 rounded-[1.25rem] inline-block">
               <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Support</h3>
             </div>
          </div>
          <div className="space-y-1">
             <SettingsItem icon={<SupportUserIcon />} label="Contact Us" onClick={() => window.open('https://wa.me/', '_blank')} />
             <SettingsItem 
                icon={<ChatIcon />} 
                label="Chat With Support Team" 
                onClick={() => window.open('https://wa.me/', '_blank')} 
                rightIcon={<WhatsAppIcon />} 
             />
             <SettingsItem icon={<RateIcon />} label="Rate Us" onClick={() => {}} />
             <SettingsItem icon={<ShareIcon />} label="Share App" onClick={() => {}} />
          </div>
        </section>

        <div className="px-8 py-12 flex justify-between items-center mt-6 border-t border-slate-50 dark:border-slate-900">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600">Support PIN: 491359</p>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600">App Version: 3.0.24</p>
        </div>
      </div>

      {showLogoutAlert && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Alert</h2>
              <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to log out?
              </p>
            </div>
            <div className="p-4 flex justify-end gap-6 bg-slate-50/50 dark:bg-slate-800/50">
              <button 
                onClick={() => setShowLogoutAlert(false)} 
                className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-4 py-2 hover:text-blue-500"
              >
                CANCEL
              </button>
              <button 
                onClick={() => onNavigate('logout')} 
                className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest px-4 py-2 hover:text-blue-500"
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, rightIcon?: React.ReactNode }> = ({ icon, label, onClick, rightIcon }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-5 py-5 px-6 active:bg-slate-50 dark:active:bg-slate-900/50 border-b border-slate-50 dark:border-slate-900/30 transition-colors group"
  >
    <div className="text-slate-800 dark:text-slate-400 shrink-0 group-active:scale-90 transition-transform">
      {icon}
    </div>
    <span className="flex-1 text-left text-[14px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
      {label}
    </span>
    <div className="flex items-center gap-3">
      {rightIcon && <div className="animate-in fade-in zoom-in duration-300">{rightIcon}</div>}
      <svg className="w-5 h-5 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </button>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);
const BusinessIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
);
const SubscriptionIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
);
const ToolsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
);
const GearsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
);
const GearThinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
);
const ImportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
const SupportUserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11c0-4.97-4.03-9-9-9zm0 2c3.87 0 7 3.13 7 7 0 3.25-2.22 6.01-5.22 6.81l-1.78 1.78-1.78-1.78C7.22 17.01 5 14.25 5 11c0-3.87 3.13-7 7-7zm0 2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
);
const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
);
const RateIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
);
const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
);
const WhatsAppIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c1.079.59 1.954.827 3.162.827h.002c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.77-5.766zm3.377 8.203c-.144.405-.833.78-1.145.829-.311.049-.607.067-.93.049-.323-.018-.646-.054-.968-.144-.323-.09-.646-.234-.969-.414-.322-.18-.645-.414-.968-.684-.322-.27-.645-.594-.968-.972-.323-.378-.539-.756-.755-1.134-.216-.378-.323-.756-.378-1.08-.054-.324-.054-.648 0-.972.054-.324.216-.648.432-.864.216-.216.486-.324.756-.324.27 0 .486.054.648.162l.81 1.62c.108.216.054.432-.054.648l-.324.432c-.108.216-.162.432-.054.648.108.216.27.432.432.648.162.216.378.378.594.54.216.162.432.27.648.378.216.108.432.162.648.054l.432-.324c.216-.108.432-.162.648-.054l1.62.81c.108.054.162.27.162.432-.054.432-.162.756-.324.972z"/></svg>
);

export default SettingsMenu;
