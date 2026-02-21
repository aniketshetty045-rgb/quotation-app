import { Settings } from './types';

export const APP_STORAGE_KEY = 'quoteflow_pro_v1';

export const PAYMENT_MODES = [
  'Cash', 'Cheque', 'Debit Card', 'Credit Card', 'Bank Transfer', 
  'UPI', 'GPay', 'PhonePe', 'Paytm', 'Wire Transfer', 'Mobile Money'
];

export interface Country {
  name: string;
  code: string;
  flag: string;
  currencySymbol: string;
  currencyName: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫', currencySymbol: '؋', currencyName: 'AFN' },
  { name: 'Albania', code: '+355', flag: '🇦🇱', currencySymbol: 'L', currencyName: 'ALL' },
  { name: 'Algeria', code: '+213', flag: '🇩🇿', currencySymbol: 'د.ج', currencyName: 'DZD' },
  { name: 'Andorra', code: '+376', flag: '🇦🇩', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Angola', code: '+244', flag: '🇦🇴', currencySymbol: 'Kz', currencyName: 'AOA' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷', currencySymbol: '$', currencyName: 'ARS' },
  { name: 'Armenia', code: '+374', flag: '🇦🇲', currencySymbol: '֏', currencyName: 'AMD' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', currencySymbol: '$', currencyName: 'AUD' },
  { name: 'Austria', code: '+43', flag: '🇦🇹', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Azerbaijan', code: '+994', flag: '🇦🇿', currencySymbol: '₼', currencyName: 'AZN' },
  { name: 'Bahamas', code: '+1', flag: '🇧🇸', currencySymbol: '$', currencyName: 'BSD' },
  { name: 'Bahrain', code: '+973', flag: '🇧🇭', currencySymbol: '.د.ب', currencyName: 'BHD' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', currencySymbol: '৳', currencyName: 'BDT' },
  { name: 'Barbados', code: '+1', flag: '🇧🇧', currencySymbol: '$', currencyName: 'BBD' },
  { name: 'Belarus', code: '+375', flag: '🇧🇾', currencySymbol: 'Br', currencyName: 'BYN' },
  { name: 'Belgium', code: '+32', flag: '🇧🇪', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Belize', code: '+501', flag: '🇧🇿', currencySymbol: '$', currencyName: 'BZD' },
  { name: 'Benin', code: '+229', flag: '🇧🇯', currencySymbol: 'Fr', currencyName: 'XOF' },
  { name: 'Bhutan', code: '+975', flag: '🇧🇹', currencySymbol: 'Nu.', currencyName: 'BTN' },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴', currencySymbol: 'Bs.', currencyName: 'BOB' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', currencySymbol: 'R$', currencyName: 'BRL' },
  { name: 'Brunei', code: '+673', flag: '🇧🇳', currencySymbol: '$', currencyName: 'BND' },
  { name: 'Bulgaria', code: '+359', flag: '🇧🇬', currencySymbol: 'лв', currencyName: 'BGN' },
  { name: 'Cambodia', code: '+855', flag: '🇰🇭', currencySymbol: '៛', currencyName: 'KHR' },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲', currencySymbol: 'Fr', currencyName: 'XAF' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', currencySymbol: '$', currencyName: 'CAD' },
  { name: 'Chile', code: '+56', flag: '🇨🇱', currencySymbol: '$', currencyName: 'CLP' },
  { name: 'China', code: '+86', flag: '🇨🇳', currencySymbol: '¥', currencyName: 'CNY' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴', currencySymbol: '$', currencyName: 'COP' },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷', currencySymbol: '₡', currencyName: 'CRC' },
  { name: 'Croatia', code: '+385', flag: '🇭🇷', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Cuba', code: '+53', flag: '🇨🇺', currencySymbol: '$', currencyName: 'CUP' },
  { name: 'Cyprus', code: '+357', flag: '🇨🇾', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Czechia', code: '+420', flag: '🇨🇿', currencySymbol: 'Kč', currencyName: 'CZK' },
  { name: 'Denmark', code: '+45', flag: '🇩🇰', currencySymbol: 'kr', currencyName: 'DKK' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬', currencySymbol: 'E£', currencyName: 'EGP' },
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹', currencySymbol: 'Br', currencyName: 'ETB' },
  { name: 'Fiji', code: '+679', flag: '🇫🇯', currencySymbol: '$', currencyName: 'FJD' },
  { name: 'Finland', code: '+358', flag: '🇫🇮', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'France', code: '+33', flag: '🇫🇷', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Georgia', code: '+995', flag: '🇬🇪', currencySymbol: '₾', currencyName: 'GEL' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭', currencySymbol: '₵', currencyName: 'GHS' },
  { name: 'Greece', code: '+30', flag: '🇬🇷', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Hungary', code: '+36', flag: '🇭🇺', currencySymbol: 'Ft', currencyName: 'HUF' },
  { name: 'Iceland', code: '+354', flag: '🇮🇸', currencySymbol: 'kr', currencyName: 'ISK' },
  { name: 'India', code: '+91', flag: '🇮🇳', currencySymbol: '₹', currencyName: 'INR' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩', currencySymbol: 'Rp', currencyName: 'IDR' },
  { name: 'Iran', code: '+98', flag: '🇮🇷', currencySymbol: '﷼', currencyName: 'IRR' },
  { name: 'Iraq', code: '+964', flag: '🇮🇶', currencySymbol: 'ع.د', currencyName: 'IQD' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Israel', code: '+972', flag: '🇮🇱', currencySymbol: '₪', currencyName: 'ILS' },
  { name: 'Italy', code: '+39', flag: '🇮🇹', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Jamaica', code: '+1', flag: '🇯🇲', currencySymbol: '$', currencyName: 'JMD' },
  { name: 'Japan', code: '+81', flag: '🇯🇵', currencySymbol: '¥', currencyName: 'JPY' },
  { name: 'Jordan', code: '+962', flag: '🇯🇴', currencySymbol: 'د.ا', currencyName: 'JOD' },
  { name: 'Kazakhstan', code: '+7', flag: '🇰🇿', currencySymbol: '₸', currencyName: 'KZT' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', currencySymbol: 'Sh', currencyName: 'KES' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼', currencySymbol: 'د.ك', currencyName: 'KWD' },
  { name: 'Lebanon', code: '+961', flag: '🇱🇧', currencySymbol: 'ل.ل', currencyName: 'LBP' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾', currencySymbol: 'RM', currencyName: 'MYR' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽', currencySymbol: '$', currencyName: 'MXN' },
  { name: 'Morocco', code: '+212', flag: '🇲🇦', currencySymbol: 'د.م.', currencyName: 'MAD' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵', currencySymbol: 'रू', currencyName: 'NPR' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿', currencySymbol: '$', currencyName: 'NZD' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', currencySymbol: '₦', currencyName: 'NGN' },
  { name: 'Norway', code: '+47', flag: '🇳🇴', currencySymbol: 'kr', currencyName: 'NOK' },
  { name: 'Oman', code: '+968', flag: '🇴🇲', currencySymbol: 'ر.ع.', currencyName: 'OMR' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰', currencySymbol: '₨', currencyName: 'PKR' },
  { name: 'Peru', code: '+51', flag: '🇵🇪', currencySymbol: 'S/', currencyName: 'PEN' },
  { name: 'Philippines', code: '+63', flag: '🇵🇭', currencySymbol: '₱', currencyName: 'PHP' },
  { name: 'Poland', code: '+48', flag: '🇵🇱', currencySymbol: 'zł', currencyName: 'PLN' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦', currencySymbol: 'ر.ق', currencyName: 'QAR' },
  { name: 'Romania', code: '+40', flag: '🇷🇴', currencySymbol: 'lei', currencyName: 'RON' },
  { name: 'Russia', code: '+7', flag: '🇷🇺', currencySymbol: '₽', currencyName: 'RUB' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', currencySymbol: 'ر.س', currencyName: 'SAR' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', currencySymbol: '$', currencyName: 'SGD' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', currencySymbol: 'R', currencyName: 'ZAR' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷', currencySymbol: '₩', currencyName: 'KRW' },
  { name: 'Spain', code: '+34', flag: '🇪🇸', currencySymbol: '€', currencyName: 'EUR' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', currencySymbol: 'Rs', currencyName: 'LKR' },
  { name: 'Sweden', code: '+46', flag: '🇸🇪', currencySymbol: 'kr', currencyName: 'SEK' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭', currencySymbol: 'Fr.', currencyName: 'CHF' },
  { name: 'Thailand', code: '+66', flag: '🇹🇭', currencySymbol: '฿', currencyName: 'THB' },
  { name: 'Turkey', code: '+90', flag: '🇹🇷', currencySymbol: '₺', currencyName: 'TRY' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦', currencySymbol: '₴', currencyName: 'UAH' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', currencySymbol: 'د.إ', currencyName: 'AED' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', currencySymbol: '£', currencyName: 'GBP' },
  { name: 'United States', code: '+1', flag: '🇺🇸', currencySymbol: '$', currencyName: 'USD' },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳', currencySymbol: '₫', currencyName: 'VND' },
];

export const DATE_FORMATS = [
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'yyyy-MM-dd',
  'dd-MMM-yyyy'
];

export const DEFAULT_DOC_SETTING = {
  prefix: 'QT',
  serialNumber: 1,
  topMessage: 'Dear Sir/Mam,\nThank you for your valuable inquiry. We are pleased to quote as below:',
  bottomMessage: 'We hope you find our offer to be in line with your requirement.',
  discountDisplay: 'No Discount' as const,
  taxDisplay: 'Per Item' as const,
  taxRate: 18.0,
  hsnDisplay: 'Yes' as const,
  bankDisplay: 'Yes' as const,
  upiDisplay: 'Yes' as const,
  signatureDisplay: 'Yes' as const,
};

export const DEFAULT_COLUMN_SETTINGS = {
  taxLabel: 'GST',
  hsnLabel: 'HSN',
  otherChargesLabel: 'Other Charges',
  showQty2: false,
  qty2Label: 'QTY2'
};

export const DEFAULT_GENERAL_SETTINGS = {
  dateFormat: 'dd/MM/yyyy',
  country: 'India',
  currencySymbol: '₹',
  currencyName: 'INR'
};

export const DEFAULT_SETTINGS: Settings = {
  quotation: { ...DEFAULT_DOC_SETTING, prefix: 'Quote-' },
  invoice: { ...DEFAULT_DOC_SETTING, prefix: 'INV-', topMessage: '', bottomMessage: '', taxDisplay: 'Per Item' },
  receipt: { ...DEFAULT_DOC_SETTING, prefix: 'RECEIPT-', receiptType: 'Simple', topMessage: '', bottomMessage: '' },
  purchase_order: { ...DEFAULT_DOC_SETTING, prefix: 'PO-' },
  delivery_note: { ...DEFAULT_DOC_SETTING, prefix: 'DN-', topMessage: '', bottomMessage: '' },
  proforma: { ...DEFAULT_DOC_SETTING, prefix: 'PI-', topMessage: '', bottomMessage: '' },
  columnHeadings: DEFAULT_COLUMN_SETTINGS,
  general: DEFAULT_GENERAL_SETTINGS
};
