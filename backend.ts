
import { 
  User, Department, GpuModel, Customer, Company, 
  RentalDemand, PurchaseDemand, ProjectDemand, 
  AnyDemand, DemandStatus, RoleType 
} from './types';
import { 
  MOCK_USERS, MOCK_DEPARTMENTS, MOCK_GPU_MODELS, 
  MOCK_CUSTOMERS, MOCK_COMPANIES, 
  MOCK_RENTAL_DEMANDS, MOCK_PURCHASE_DEMANDS, MOCK_PROJECT_DEMANDS 
} from './constants';

/**
 * MockDatabase: Simulates a server-side storage and logic layer.
 * Enforces business rules and role-based access control.
 */
class MockDatabase {
  private storageKey = 'fuji_crm_db';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        users: MOCK_USERS,
        departments: MOCK_DEPARTMENTS,
        gpuModels: MOCK_GPU_MODELS,
        customers: MOCK_CUSTOMERS,
        companies: MOCK_COMPANIES,
        rentalDemands: MOCK_RENTAL_DEMANDS,
        purchaseDemands: MOCK_PURCHASE_DEMANDS,
        projectDemands: MOCK_PROJECT_DEMANDS,
        logs: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  private getData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // --- Authentication ---
  async login(username: string, password?: string): Promise<User | null> {
    await this.delay();
    const data = this.getData();
    const user = data.users.find((u: User) => u.username === username && u.password === password && !u.deleteFlag);
    return user || null;
  }

  // --- Generic CRUD Helpers ---
  async getCollection<T>(key: string, currentUser: User, filterFn?: (item: T) => boolean): Promise<T[]> {
    await this.delay();
    const data = this.getData();
    let list = data[key] || [];

    // Apply data isolation rules if the item has access-related fields
    list = list.filter((item: any) => {
      if (item.deleteFlag) return false;
      
      // Admin and Director see everything
      if (currentUser.role === RoleType.ADMIN || currentUser.role === RoleType.SALES_DIRECTOR) return true;
      
      // Managers see their team
      if (currentUser.role === RoleType.SALES_MANAGER && item.teamId) {
        return item.teamId === currentUser.teamId;
      }
      
      // Sales see their own creations
      if (item.creatorId) {
        return item.creatorId === currentUser.id;
      }

      return true; // Default fallback for system collections like GPU Models or Departments
    });

    if (filterFn) list = list.filter(filterFn);
    return list;
  }

  async addItem(key: string, item: any) {
    await this.delay();
    const data = this.getData();
    data[key] = [item, ...(data[key] || [])];
    this.saveData(data);
    return item;
  }

  async updateItem(key: string, id: string, updates: any) {
    await this.delay();
    const data = this.getData();
    data[key] = data[key].map((item: any) => item.id === id ? { ...item, ...updates } : item);
    this.saveData(data);
    return updates;
  }

  async deleteItem(key: string, id: string) {
    await this.delay();
    const data = this.getData();
    // Soft delete
    data[key] = data[key].map((item: any) => item.id === id ? { ...item, deleteFlag: true } : item);
    this.saveData(data);
    return id;
  }

  private delay(ms = 400) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const db = new MockDatabase();
