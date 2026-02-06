
import { db } from './backend';
import { User, Department, GpuModel, Customer, Company, AnyDemand, RoleType } from './types';

export const api = {
  auth: {
    login: (u: string, p?: string) => db.login(u, p),
  },
  
  users: {
    list: (currentUser: User) => db.getCollection<User>('users', currentUser),
    add: (user: User) => db.addItem('users', user),
    update: (id: string, updates: Partial<User>) => db.updateItem('users', id, updates),
    delete: (id: string) => db.deleteItem('users', id),
    checkUnique: async (username: string) => {
      const data = (db as any).getData();
      return !data.users.some((u: User) => !u.deleteFlag && u.username.toLowerCase() === username.toLowerCase());
    }
  },

  gpuModels: {
    list: (currentUser: User) => db.getCollection<GpuModel>('gpuModels', currentUser),
    add: (model: GpuModel) => db.addItem('gpuModels', model),
    update: (id: string, updates: Partial<GpuModel>) => db.updateItem('gpuModels', id, updates),
    delete: (id: string) => db.deleteItem('gpuModels', id),
  },

  customers: {
    list: (currentUser: User) => db.getCollection<Customer>('customers', currentUser),
    add: (cust: Customer) => db.addItem('customers', cust),
    update: (id: string, updates: Partial<Customer>) => db.updateItem('customers', id, updates),
    delete: (id: string) => db.deleteItem('customers', id),
  },

  companies: {
    list: (currentUser: User) => db.getCollection<Company>('companies', currentUser),
    add: (comp: Company) => db.addItem('companies', comp),
    update: (id: string, updates: Partial<Company>) => db.updateItem('companies', id, updates),
    delete: (id: string) => db.deleteItem('companies', id),
  },

  demands: {
    list: (type: 'RENTAL' | 'PURCHASE' | 'PROJECT', currentUser: User) => {
      const key = type === 'RENTAL' ? 'rentalDemands' : type === 'PURCHASE' ? 'purchaseDemands' : 'projectDemands';
      return db.getCollection<AnyDemand>(key, currentUser);
    },
    add: (type: string, demand: AnyDemand) => {
      const key = type === 'RENTAL' ? 'rentalDemands' : type === 'PURCHASE' ? 'purchaseDemands' : 'projectDemands';
      return db.addItem(key, demand);
    },
    update: (type: string, id: string, updates: Partial<AnyDemand>) => {
      const key = type === 'RENTAL' ? 'rentalDemands' : type === 'PURCHASE' ? 'purchaseDemands' : 'projectDemands';
      return db.updateItem(key, id, updates);
    },
    delete: (type: string, id: string) => {
      const key = type === 'RENTAL' ? 'rentalDemands' : type === 'PURCHASE' ? 'purchaseDemands' : 'projectDemands';
      return db.deleteItem(key, id);
    }
  },

  departments: {
    list: (currentUser: User) => db.getCollection<Department>('departments', currentUser),
  }
};
