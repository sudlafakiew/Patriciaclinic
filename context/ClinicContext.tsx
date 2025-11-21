import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Service, Appointment, Status, InventoryItem, CourseDefinition, Transaction, TreatmentRecord, CustomerCourse } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface ClinicContextType {
  customers: Customer[];
  services: Service[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  courseDefinitions: CourseDefinition[];
  transactions: Transaction[];
  isLoadingData: boolean;
  dbConnectionError: string | null;
  
  // Appointments
  addAppointment: (apt: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Status) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'history' | 'treatmentHistory' | 'activeCourses'>) => Promise<any>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Services
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Inventory
  updateStock: (id: string, quantityChange: number) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  
  // Courses
  addCourse: (course: Omit<CourseDefinition, 'id'>) => Promise<void>;
  updateCourse: (id: string, data: Partial<CourseDefinition>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  // Operations
  processSale: (customerId: string, items: { type: 'service' | 'course'; id: string; price: number; quantity: number }[], paymentMethod: Transaction['paymentMethod']) => Promise<void>;
  useCourse: (customerId: string, courseInstanceId: string, unitsToUse: number, treatmentDetails: Omit<TreatmentRecord, 'id' | 'date' | 'unitsUsed'>) => Promise<void>;
  
  refreshData: () => Promise<void>;
  seedDatabase: () => Promise<void>;
  exportToSQL: () => Promise<string>;
  resetDatabase: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [courseDefinitions, setCourseDefinitions] = useState<CourseDefinition[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dbConnectionError, setDbConnectionError] = useState<string | null>(null);

  const refreshData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    setDbConnectionError(null);
    try {
      // Fetch parallel
      const [custRes, servRes, apptRes, invRes, courseRes, transRes, custCourseRes, treatRes] = await Promise.all([
        supabase.from('customers').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
        supabase.from('appointments').select('*').order('date', { ascending: false }),
        supabase.from('inventory').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('customer_courses').select('*'),
        supabase.from('treatment_records').select('*').order('date', { ascending: false })
      ]);

      // Check for "relation does not exist" error (Code 42P01)
      const errors = [custRes.error, servRes.error, apptRes.error, invRes.error];
      const tableMissingError = errors.find(e => e?.code === '42P01');
      if (tableMissingError) {
          console.error("Database Tables Missing:", tableMissingError);
          setDbConnectionError('MISSING_TABLES');
          setIsLoadingData(false);
          return;
      }

      // Map relational data for Customers
      const rawCustomers = custRes.data || [];
      const rawCustCourses = custCourseRes.data || [];
      const rawTreatments = treatRes.data || [];

      const enrichedCustomers = rawCustomers.map((c: any) => ({
        ...c,
        birthDate: c.birth_date,
        lineId: c.line_id,
        activeCourses: rawCustCourses.filter((cc: any) => cc.customer_id === c.id).map((cc: any) => ({
             id: cc.id,
             courseId: cc.course_id,
             courseName: cc.course_name,
             totalUnits: cc.total_units,
             remainingUnits: cc.remaining_units,
             purchaseDate: cc.purchase_date,
             expiryDate: cc.expiry_date,
             active: cc.active
        })),
        treatmentHistory: rawTreatments.filter((t: any) => t.customer_id === c.id).map((t: any) => ({
             id: t.id,
             date: t.date,
             treatmentName: t.treatment_name,
             details: t.details,
             doctorName: t.doctor_name,
             unitsUsed: t.units_used,
             photos: []
        })),
        history: [] // Legacy field
      }));

      setCustomers(enrichedCustomers);
      setServices(servRes.data?.map((s:any) => ({
        ...s, 
        durationMinutes: s.duration_minutes,
        imageUrl: s.image_url // Map from DB snake_case to camelCase
      })) || []);
      setAppointments(apptRes.data?.map((a:any) => ({...a, customerId: a.customer_id, serviceId: a.service_id, doctorName: a.doctor_name})) || []);
      setInventory(invRes.data?.map((i:any) => ({...i, minLevel: i.min_level, pricePerUnit: i.price_per_unit})) || []);
      setCourseDefinitions(courseRes.data?.map((c:any) => ({...c, totalUnits: c.total_units})) || []);
      setTransactions(transRes.data?.map((t:any) => ({...t, date: t.created_at, customerId: t.customer_id, totalAmount: t.total_amount, paymentMethod: t.payment_method})) || []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error?.message?.includes('relation') || error?.code === '42P01') {
          setDbConnectionError('MISSING_TABLES');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
        refreshData();
    }
  }, [user]);

  const seedDatabase = async () => {
      setIsLoadingData(true);
      try {
        // 1. Inventory
        await supabase.from('inventory').insert([
          { name: 'Syringe 3ml', quantity: 500, unit: 'ชิ้น', min_level: 100, price_per_unit: 5 },
          { name: 'Botox Allergan 100u', quantity: 20, unit: 'vial', min_level: 5, price_per_unit: 4000 },
          { name: 'Vitamin C Ampoule', quantity: 200, unit: 'ampoule', min_level: 50, price_per_unit: 20 },
          { name: 'Normal Saline 100ml', quantity: 100, unit: 'bag', min_level: 20, price_per_unit: 15 },
          { name: 'Sterile Gloves (M)', quantity: 1000, unit: 'pair', min_level: 100, price_per_unit: 10 },
          { name: 'Meso Fat Solution', quantity: 50, unit: 'vial', min_level: 10, price_per_unit: 500 },
        ]);

        // 2. Services
        await supabase.from('services').insert([
           { name: 'Botox Injection (50u)', price: 8900, duration_minutes: 30, category: 'Injection' },
           { name: 'IV Drip Vitamin Glow', price: 2500, duration_minutes: 45, category: 'Wellness' },
           { name: 'Ultraformer III (Face)', price: 15000, duration_minutes: 60, category: 'Lifting' },
           { name: 'Laser Hair Removal (Arm)', price: 1500, duration_minutes: 20, category: 'Laser' },
           { name: 'Meso Fat แก้มเหนียง', price: 3500, duration_minutes: 30, category: 'Injection' }
        ]);

        // 3. Courses
        await supabase.from('courses').insert([
          { name: 'IV Drip Buffet (10 ครั้ง)', price: 20000, total_units: 10, description: 'วิตามินผิวสูตรเข้มข้น 10 ครั้ง' },
          { name: 'Laser Hair Removal (12 ครั้ง)', price: 12000, total_units: 12, description: 'เลเซอร์กำจัดขน 12 ครั้ง' },
          { name: 'Acne Clear (5 ครั้ง)', price: 4500, total_units: 5, description: 'รักษาสิว กดสิว มาส์กหน้า 5 ครั้ง' }
        ]);

        // 4. Mock Customers
        await supabase.from('customers').insert([
          { name: 'คุณสุดา ใจดี', phone: '081-234-5678', email: 'suda@example.com', notes: 'แพ้ยา Penicillin' },
          { name: 'คุณสมชาย มั่งคั่ง', phone: '089-987-6543', email: 'somchai@example.com', notes: 'ชอบนวดหน้าแรงๆ' },
          { name: 'คุณวิไล สวยเสมอ', phone: '065-432-1111', email: 'wilai@example.com' }
        ]);
        
        // Wait a bit for triggers/indexing
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshData();
      } catch (err) {
        console.error("Seed error:", err);
        setIsLoadingData(false);
      }
  };

  const exportToSQL = async (): Promise<string> => {
      let sql = `-- Patricia Clinic Backup \n-- Date: ${new Date().toISOString()}\n\n`;
      
      // Customers
      if (customers.length > 0) {
          sql += `-- Customers \nINSERT INTO customers (id, name, phone, email, birth_date, notes, address) VALUES \n`;
          sql += customers.map(c => `('${c.id}', '${c.name}', '${c.phone}', '${c.email || ''}', ${c.birthDate ? `'${c.birthDate}'` : 'NULL'}, '${c.notes || ''}', '${c.address || ''}')`).join(',\n') + ';\n\n';
      }

      // Inventory
      if (inventory.length > 0) {
          sql += `-- Inventory \nINSERT INTO inventory (id, name, quantity, unit, min_level, price_per_unit) VALUES \n`;
          sql += inventory.map(i => `('${i.id}', '${i.name}', ${i.quantity}, '${i.unit}', ${i.minLevel}, ${i.pricePerUnit})`).join(',\n') + ';\n\n';
      }

      // Services
      if (services.length > 0) {
          sql += `-- Services \nINSERT INTO services (id, name, price, duration_minutes, category) VALUES \n`;
          sql += services.map(s => `('${s.id}', '${s.name}', ${s.price}, ${s.durationMinutes}, '${s.category}')`).join(',\n') + ';\n\n';
      }
      
      // Courses
      if (courseDefinitions.length > 0) {
           sql += `-- Courses \nINSERT INTO courses (id, name, price, total_units, description) VALUES \n`;
           sql += courseDefinitions.map(c => `('${c.id}', '${c.name}', ${c.price}, ${c.totalUnits}, '${c.description || ''}')`).join(',\n') + ';\n\n';
      }

      return sql;
  };

  const resetDatabase = async () => {
      if (!window.confirm('คำเตือน: การกระทำนี้จะลบข้อมูลในตาราง Inventory, Services, Courses, Customers ทั้งหมด! ยืนยันหรือไม่?')) return;
      setIsLoadingData(true);
      try {
          await supabase.from('treatment_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('customer_courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await refreshData();
      } catch (e) {
          console.error(e);
          alert('เกิดข้อผิดพลาดในการล้างข้อมูล');
      } finally {
          setIsLoadingData(false);
      }
  };

  // --- Operations ---

  // APPOINTMENTS
  const addAppointment = async (apt: Omit<Appointment, 'id'>) => {
    await supabase.from('appointments').insert([{
        customer_id: apt.customerId,
        service_id: apt.serviceId,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        doctor_name: apt.doctorName
    }]);
    refreshData();
  };

  const updateAppointmentStatus = async (id: string, status: Status) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    refreshData();
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) alert('Failed to delete appointment: ' + error.message);
    else refreshData();
  }

  // CUSTOMERS
  const addCustomer = async (customer: Omit<Customer, 'id' | 'history' | 'treatmentHistory' | 'activeCourses'>) => {
    const { data, error } = await supabase.from('customers').insert([{
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        birth_date: customer.birthDate,
        notes: customer.notes,
        line_id: customer.lineId,
        address: customer.address
    }]).select().single();
    
    if (error) {
      console.error("Add customer error:", error);
      alert('เกิดข้อผิดพลาดในการเพิ่มลูกค้า: ' + error.message);
      return null;
    }
    await refreshData();
    return data; // Return the created customer data (snake_case format usually)
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    await supabase.from('customers').update({
        name: data.name,
        phone: data.phone,
        email: data.email,
        birth_date: data.birthDate,
        notes: data.notes,
        address: data.address,
        line_id: data.lineId
    }).eq('id', id);
    refreshData();
  };

  const deleteCustomer = async (id: string) => {
    // Note: This might fail if there are foreign key constraints (history, appointments)
    // In a real app, you'd cascade delete or soft delete.
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
        alert('ไม่สามารถลบลูกค้าได้เนื่องจากมีประวัติการรักษาหรือข้อมูลที่เกี่ยวข้อง (Cannot delete customer with existing records)');
    } else {
        refreshData();
    }
  };

  // SERVICES
  const addService = async (service: Omit<Service, 'id'>) => {
    const { error } = await supabase.from('services').insert([{
        name: service.name,
        price: service.price,
        duration_minutes: service.durationMinutes,
        category: service.category,
        consumables: service.consumables,
        image_url: service.imageUrl
    }]).select();
    
    if (error) {
      alert('Failed to add service: ' + error.message);
      return;
    }
    refreshData();
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    const updatePayload: any = {};
    if (data.name) updatePayload.name = data.name;
    if (data.price !== undefined) updatePayload.price = data.price;
    if (data.durationMinutes !== undefined) updatePayload.duration_minutes = data.durationMinutes;
    if (data.category) updatePayload.category = data.category;
    if (data.consumables) updatePayload.consumables = data.consumables;
    if (data.imageUrl !== undefined) updatePayload.image_url = data.imageUrl;

    const { error } = await supabase.from('services').update(updatePayload).eq('id', id);
    if (error) {
      alert('Failed to update service: ' + error.message);
    } else {
      refreshData();
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
        alert('Error deleting service: ' + error.message);
    } else {
        refreshData();
    }
  };

  // INVENTORY
  const updateStock = async (id: string, quantityChange: number) => {
     const item = inventory.find(i => i.id === id);
     if (item) {
         const newQty = Math.max(0, item.quantity + quantityChange);
         await supabase.from('inventory').update({ quantity: newQty }).eq('id', id);
         refreshData();
     }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    await supabase.from('inventory').insert([{
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        min_level: item.minLevel,
        price_per_unit: item.pricePerUnit
    }]);
    refreshData();
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
      const updatePayload: any = {};
      if (data.name) updatePayload.name = data.name;
      if (data.quantity !== undefined) updatePayload.quantity = data.quantity;
      if (data.unit) updatePayload.unit = data.unit;
      if (data.minLevel !== undefined) updatePayload.min_level = data.minLevel;
      if (data.pricePerUnit !== undefined) updatePayload.price_per_unit = data.pricePerUnit;

      const { error } = await supabase.from('inventory').update(updatePayload).eq('id', id);
      if (error) alert('Failed to update inventory: ' + error.message);
      else refreshData();
  };

  const deleteInventoryItem = async (id: string) => {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) alert('Failed to delete inventory: ' + error.message);
      else refreshData();
  };

  // COURSES
  const addCourse = async (course: Omit<CourseDefinition, 'id'>) => {
      const { error } = await supabase.from('courses').insert([{
          name: course.name,
          price: course.price,
          total_units: course.totalUnits,
          description: course.description,
          consumables: course.consumables
      }]);
      if (error) alert('Failed to add course: ' + error.message);
      else refreshData();
  };

  const updateCourse = async (id: string, data: Partial<CourseDefinition>) => {
      const updatePayload: any = {};
      if (data.name) updatePayload.name = data.name;
      if (data.price !== undefined) updatePayload.price = data.price;
      if (data.totalUnits !== undefined) updatePayload.total_units = data.totalUnits;
      if (data.description) updatePayload.description = data.description;
      if (data.consumables) updatePayload.consumables = data.consumables;

      const { error } = await supabase.from('courses').update(updatePayload).eq('id', id);
      if (error) alert('Failed to update course: ' + error.message);
      else refreshData();
  };

  const deleteCourse = async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) alert('Failed to delete course: ' + error.message);
      else refreshData();
  };


  // TRANSACTIONS & COURSE USAGE
  const processSale = async (customerId: string, items: { type: 'service' | 'course'; id: string; price: number; quantity: number }[], paymentMethod: Transaction['paymentMethod']) => {
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const { data: transData, error: transError } = await supabase.from('transactions').insert([{
          customer_id: customerId,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          items: items
      }]).select();

      if (transError || !transData) {
          console.error("Sale failed", transError);
          return;
      }

      const courseInserts: any[] = [];
      items.forEach(item => {
          if (item.type === 'course') {
              const def = courseDefinitions.find(c => c.id === item.id);
              if (def) {
                  for(let i=0; i<item.quantity; i++) {
                      courseInserts.push({
                          customer_id: customerId,
                          course_id: def.id,
                          course_name: def.name,
                          total_units: def.totalUnits,
                          remaining_units: def.totalUnits,
                          active: true
                      });
                  }
              }
          }
      });

      if (courseInserts.length > 0) {
          await supabase.from('customer_courses').insert(courseInserts);
      }

      refreshData();
  };

  const useCourse = async (customerId: string, courseInstanceId: string, unitsToUse: number, treatmentDetails: Omit<TreatmentRecord, 'id' | 'date' | 'unitsUsed'>) => {
      const customer = customers.find(c => c.id === customerId);
      const courseInstance = customer?.activeCourses.find(c => c.id === courseInstanceId);
      if (!customer || !courseInstance) return;

      const newRemaining = Math.max(0, courseInstance.remainingUnits - unitsToUse);
      await supabase.from('customer_courses').update({
          remaining_units: newRemaining,
          active: newRemaining > 0
      }).eq('id', courseInstanceId);

      await supabase.from('treatment_records').insert([{
          customer_id: customerId,
          treatment_name: treatmentDetails.treatmentName,
          details: treatmentDetails.details,
          doctor_name: treatmentDetails.doctorName,
          units_used: unitsToUse,
          doctor_fee: treatmentDetails.doctorFee || 0
      }]);

      const courseDef = courseDefinitions.find(c => c.id === courseInstance.courseId);
      if (courseDef && courseDef.consumables) {
          for (const con of courseDef.consumables) {
              const invItem = inventory.find(i => i.id === con.inventoryItemId);
              if (invItem) {
                  const deductAmount = con.quantityUsed * unitsToUse;
                  const newQty = Math.max(0, invItem.quantity - deductAmount);
                  await supabase.from('inventory').update({ quantity: newQty }).eq('id', con.inventoryItemId);
              }
          }
      }

      refreshData();
  };

  return (
    <ClinicContext.Provider value={{ 
      customers, services, appointments, inventory, courseDefinitions, transactions, isLoadingData, dbConnectionError,
      addAppointment, updateAppointmentStatus, deleteAppointment,
      addCustomer, updateCustomer, deleteCustomer,
      addService, updateService, deleteService,
      updateStock, addInventoryItem, updateInventoryItem, deleteInventoryItem,
      addCourse, updateCourse, deleteCourse,
      processSale, useCourse, refreshData, seedDatabase, exportToSQL, resetDatabase
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};