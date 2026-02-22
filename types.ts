
export enum RoleType {
  SALES = 'SALES',
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_DIRECTOR = 'SALES_DIRECTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username: string;
  password?: string;
  realName: string;
  phone: string;
  email?: string;
  department?: string; // 兼容旧代码，存储部门名称
  departmentId?: number; // 新增：存储部门 ID
  status: 'ENABLE' | 'DISABLE';
  role: RoleType;
  teamId?: number | string; // 存储团队 ID
  createTime: string;
  creator: string;
  deleteFlag: boolean;
}

export interface OperationLog {
  id: number;
  username: string;
  realName: string;
  module: string;
  operationType: string;
  operationDesc: string;
  requestMethod: string;
  requestUrl: string;
  requestParams: string;
  ipAddress: string;
  userAgent: string;
  isSuccess: boolean;
  errorMessage?: string;
  executionTime: number;
  oldValue?: string;
  newValue?: string;
  createTime: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  createTime: string;
  creator: string;
}

export interface Team {
  id: number;
  name: string;
  leaderId: number;
  departmentId: number; 
}

export interface Customer {
  id: number;
  name: string;           
  companyName: string;    
  contactPerson: string;  
  contactPhone: string;   
  email?: string;
  demandPreference?: string; 
  cooperationStage?: string; 
  followUpStatus?: string;   
  assigneeId: number;       
  creatorId: number;
  teamId: string; // 团队 ID 映射暂保留
  createTime: string;
  deleteFlag: boolean;
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  years: number;
  capital: string;
  mainBusiness: string;
  screenshotUrl?: string;
  creatorId: number;
  teamId: string;
  createTime: string;
  deleteFlag: boolean;
}

export interface GpuModel {
  id: number;
  brand: string;           
  memory: number;          
  cpu: string;             
  ram: number;             
  ibCard: string;          
  nvmeSsd: string;         
  networkAdapter: string;  
  powerSupply: string;     
  rentalPriceMin: number;
  rentalPriceMax: number;
  salePriceMin: number;
  salePriceMax: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  createdBy: string | null;
  status?: 'AVAILABLE' | 'SHORTAGE' | 'UNAVAILABLE';
}

export enum DemandStatus {
  PENDING_REVIEW = 'PENDING_REVIEW', 
  REVIEWING = 'REVIEWING',           
  APPROVED = 'APPROVED',             
  IN_PROGRESS = 'IN_PROGRESS',       
  COMPLETED = 'COMPLETED',           
  CLOSED = 'CLOSED',                 
  REJECTED = 'REJECTED'              
}

export interface BaseDemand {
  id: number;
  title: string;           
  customerId: number;
  status: DemandStatus;
  category: string;        
  priority: string;        
  description?: string;
  source?: string;         
  budget?: string;         
  cost?: string;           
  creatorId: number;
  teamId: string;
  createTime: string;
  deleteFlag: boolean;
}

export interface RentalDemand extends BaseDemand {
  demandType: 'RENTAL';
  gpuModelId?: number;
  serverCount?: number;
  includeNetworking?: boolean;
  storageRequirement?: string;
  computingRequirement?: string;
  networkingRequirement?: string;
  platformRequirement?: string;
  rentalPeriod?: string;   
  deliveryDate?: string;   
  paymentMethod?: string;
}

export interface PurchaseDemand extends BaseDemand {
  demandType: 'PURCHASE';
  gpuModelId?: number;
  serverCount?: number;
  purchaseDate?: string;   
}

export interface ProjectDemand extends BaseDemand {
  demandType: 'PROJECT';
  projectName?: string;
  projectScope?: string;
  technicalRequirement?: string;
  projectDuration?: string;
  servicePrice?: string;   
  serverCount?: number;    
}

export type AnyDemand = RentalDemand | PurchaseDemand | ProjectDemand;
