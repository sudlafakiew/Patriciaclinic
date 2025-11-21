import { Customer, Service, Appointment, Status, InventoryItem, CourseDefinition } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv1', name: 'Syringe 3ml', quantity: 500, unit: 'ชิ้น', minLevel: 100, pricePerUnit: 5 },
  { id: 'inv2', name: 'Botox Allergan 100u', quantity: 10, unit: 'vial', minLevel: 5, pricePerUnit: 4000 },
  { id: 'inv3', name: 'Vitamin C Ampoule', quantity: 200, unit: 'ampoule', minLevel: 50, pricePerUnit: 20 },
  { id: 'inv4', name: 'Sterile Gloves (M)', quantity: 1000, unit: 'คู่', minLevel: 200, pricePerUnit: 10 },
  { id: 'inv5', name: 'Gauze Pads', quantity: 50, unit: 'pack', minLevel: 10, pricePerUnit: 30 },
  { id: 'inv6', name: 'Meso Fat Solution', quantity: 50, unit: 'vial', minLevel: 10, pricePerUnit: 500 },
];

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Ultraformer III', price: 15000, durationMinutes: 60, category: 'Lifting' },
  { 
    id: 's2', 
    name: 'Botox Allergan (50u)', 
    price: 8900, 
    durationMinutes: 30, 
    category: 'Injection',
    consumables: [
        { inventoryItemId: 'inv2', quantityUsed: 0.5 }, // Uses half vial
        { inventoryItemId: 'inv1', quantityUsed: 2 },   // Uses 2 syringes
        { inventoryItemId: 'inv4', quantityUsed: 1 }    // Uses 1 pair of gloves
    ]
  },
  { 
    id: 's3', 
    name: 'IV Drip Vitamin', 
    price: 2500, 
    durationMinutes: 45, 
    category: 'Wellness',
    consumables: [
        { inventoryItemId: 'inv3', quantityUsed: 2 },
        { inventoryItemId: 'inv1', quantityUsed: 1 }
    ]
  },
  { id: 's4', name: 'Laser Hair Removal', price: 1500, durationMinutes: 20, category: 'Laser' },
  { 
    id: 's5', 
    name: 'Meso Fat', 
    price: 3500, 
    durationMinutes: 30, 
    category: 'Injection',
    consumables: [
        { inventoryItemId: 'inv6', quantityUsed: 5 }, // 5cc
        { inventoryItemId: 'inv1', quantityUsed: 2 }
    ]
  },
];

export const INITIAL_COURSES: CourseDefinition[] = [
  { 
      id: 'course1', 
      name: 'IV Drip Buffet (10 ครั้ง)', 
      price: 20000, 
      totalUnits: 10, 
      description: 'วิตามินผิวสูตรเข้มข้น 10 ครั้ง',
      consumables: [
        { inventoryItemId: 'inv3', quantityUsed: 2 },
        { inventoryItemId: 'inv1', quantityUsed: 1 }
      ]
  },
  { id: 'course2', name: 'Laser Hair Removal (12 ครั้ง)', price: 12000, totalUnits: 12, description: 'เลเซอร์กำจัดขน Diode 12 ครั้ง' },
  { id: 'course3', name: 'Acne Clear (5 ครั้ง)', price: 4500, totalUnits: 5, description: 'รักษาสิว กดสิว มาส์กหน้า 5 ครั้ง' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { 
    id: 'c1', 
    name: 'คุณสุดา ใจดี', 
    phone: '081-234-5678', 
    email: 'suda@example.com', 
    birthDate: '1990-05-15',
    history: ['s2'], 
    notes: 'แพ้ยาเพนนิซิลิน',
    treatmentHistory: [
        { id: 'th1', date: '2023-10-01', treatmentName: 'Botox Allergan', doctorName: 'หมอฟ้า', details: 'ฉีดลดกราม 50u', unitsUsed: 1, photos: [] }
    ],
    activeCourses: [
        { id: 'cc1', courseId: 'course1', courseName: 'IV Drip Buffet', totalUnits: 10, remainingUnits: 8, purchaseDate: '2023-09-01', expiryDate: '2024-09-01', active: true }
    ]
  },
  { 
    id: 'c2', 
    name: 'คุณสมชาย มั่งคั่ง', 
    phone: '089-987-6543', 
    email: 'somchai@example.com', 
    history: ['s1', 's3'], 
    notes: 'ชอบนวดหน้าแรงๆ',
    treatmentHistory: [],
    activeCourses: []
  },
  { 
    id: 'c3', 
    name: 'คุณวิไล สวยเสมอ', 
    phone: '065-432-1111', 
    email: 'wilai@example.com', 
    history: [], 
    notes: '',
    treatmentHistory: [],
    activeCourses: []
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'a1', customerId: 'c1', serviceId: 's2', date: new Date().toISOString().split('T')[0], time: '10:00', status: Status.CONFIRMED, doctorName: 'หมอฟ้า' },
  { id: 'a2', customerId: 'c2', serviceId: 's3', date: new Date().toISOString().split('T')[0], time: '11:30', status: Status.PENDING, doctorName: 'หมอเอก' },
  { id: 'a3', customerId: 'c3', serviceId: 's1', date: new Date().toISOString().split('T')[0], time: '14:00', status: Status.CONFIRMED, doctorName: 'หมอฟ้า' },
];