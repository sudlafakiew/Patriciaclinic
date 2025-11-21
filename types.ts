export enum Status {
  PENDING = 'รอการยืนยัน',
  CONFIRMED = 'ยืนยันแล้ว',
  COMPLETED = 'เสร็จสิ้น',
  CANCELLED = 'ยกเลิก'
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minLevel: number;
  pricePerUnit: number;
}

export interface Consumable {
  inventoryItemId: string;
  quantityUsed: number; // Amount used per 1 unit of service/course
}

export interface CourseDefinition {
  id: string;
  name: string;
  price: number;
  totalUnits: number; // จำนวนครั้งที่ใช้ได้
  description: string;
  consumables?: Consumable[]; // Items used per session
}

export interface CustomerCourse {
  id: string; // Unique ID of this purchase
  courseId: string;
  courseName: string;
  totalUnits: number;
  remainingUnits: number;
  purchaseDate: string;
  expiryDate: string | null;
  active: boolean;
}

export interface TreatmentRecord {
  id: string;
  date: string;
  treatmentName: string;
  details: string; // Diagnosis/Notes
  doctorName: string;
  doctorFee?: number; // Calculated commission/fee
  unitsUsed: number; // For courses
  photos: string[]; // Mock URLs
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate?: string;
  lineId?: string;
  address?: string;
  history: string[]; // Legacy simple history
  treatmentHistory: TreatmentRecord[]; // Detailed history
  activeCourses: CustomerCourse[];
  notes: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  consumables?: Consumable[]; // Items used per service
  imageUrl?: string; // Base64 or URL
}

export interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  date: string; // ISO Date string
  time: string;
  status: Status;
  doctorName: string;
}

export interface Transaction {
  id: string;
  date: string;
  customerId: string;
  items: { name: string; price: number; quantity: number }[];
  totalAmount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Transfer';
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}