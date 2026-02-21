export type DocType = 'quotation' | 'invoice' | 'receipt' | 'purchase_order' | 'delivery_note' | 'proforma';

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  upiId: string;
}

export interface BusinessInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  address3?: string;
  logo?: string;
  signature?: string;
  headerImage?: string; 
  footerImage?: string; 
  bankDetails: BankDetails;
  otherInfo?: string;
  businessLabel?: string;
  businessNumber?: string;
  state?: string;
  businessCategory?: string;
  password?: string; // For mock change password functionality
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  mobile: string;
  address1: string;
  state: string;
  gstin?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  uom: string;
  gst: number;
  description: string;
  hsn: string;
}

export interface DocumentItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  hsn: string;
  gst: number;
  description: string;
}

export interface OtherCharge {
  label: string;
  amount: number;
  isTaxable: boolean;
  gstPercent?: number;
}

export interface PaidInfo {
  amount: number;
  date: string;
  note: string;
}

export interface TermCondition {
  id: string;
  type: DocType;
  content: string;
}

export interface Document {
  id: string;
  type: DocType;
  docNumber: string;
  date: string;
  dueDate?: string;
  poNumber?: string;
  refNo?: string;
  customerId: string;
  items: DocumentItem[];
  otherCharges: OtherCharge[];
  paidInfo?: PaidInfo[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  termsId?: string;
  roundOff?: boolean;
  paymentMode?: string;
  paymentRef?: string;
  totalAmountPaid?: number;
  paymentFor?: string;
}

export interface ColumnSettings {
  taxLabel: string;
  hsnLabel: string;
  otherChargesLabel: string;
  showQty2: boolean;
  qty2Label: string;
}

export interface GeneralSettings {
  dateFormat: string;
  country: string;
  currencySymbol: string;
  currencyName: string;
}

export interface Settings {
  quotation: DocSetting;
  invoice: DocSetting;
  receipt: DocSetting;
  purchase_order: DocSetting;
  delivery_note: DocSetting;
  proforma: DocSetting;
  columnHeadings: ColumnSettings;
  general: GeneralSettings;
}

export interface DocSetting {
  prefix: string;
  serialNumber: number;
  topMessage: string;
  bottomMessage: string;
  discountDisplay: 'No Discount' | 'Per Item' | 'On Total';
  taxDisplay: 'No Tax' | 'Per Item' | 'On Total';
  taxRate?: number;
  hsnDisplay: 'No' | 'Yes';
  bankDisplay: 'No' | 'Yes';
  upiDisplay: 'No' | 'Yes';
  signatureDisplay: 'No' | 'Yes';
  receiptType?: 'Simple' | 'Itemized';
}
