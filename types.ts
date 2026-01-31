
export enum RoleType {
  SALES = 'SALES',
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_DIRECTOR = 'SALES_DIRECTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  realName: string;
  phone: string;
  email?: string;
  department: string;
  status: 'ENABLE' | 'DISABLE';
  role: RoleType;
  teamId?: string;
  createTime: string;
  creator: string;
  deleteFlag: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createTime: string;
  creator: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
}

export interface Customer {
  id: string;
  name: string;
  title?: string;
  phone: string;
  role: 'INTERMEDIARY' | 'DIRECT' | 'CHANNEL';
  creatorId: string;
  teamId: string;
  createTime: string;
  deleteFlag: boolean;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  years: number;
  capital: string;
  mainBusiness: string;
  screenshotUrl?: string;
  creatorId: string;
  teamId: string;
  createTime: string;
  deleteFlag: boolean;
}

export interface GpuModel {
  id: string;
  name: string;
  manufacturer: string;
  vram: string; // 显存，如 80GB
  serverType: string; // 服务器规格，如 8卡, 4卡
  tflops?: string; // 算力
  status: 'AVAILABLE' | 'SHORTAGE' | 'UNAVAILABLE';
  creatorId: string;
  createTime: string;
  deleteFlag: boolean;
}

export enum DemandStatus {
  PENDING = 'PENDING',
  EVALUATING = 'EVALUATING',
  DEVELOPING = 'DEVELOPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface BaseDemand {
  id: string;
  customerId: string;
  companyId: string;
  creatorId: string;
  teamId: string;
  status: DemandStatus;
  type: string; // 需求分类
  createTime: string;
  deleteFlag: boolean;
}

export interface RentalDemand extends BaseDemand {
  demandType: 'RENTAL';
  gpuModelId: string;
  serverCount: number;
  isBareMetal: boolean;
  storageRequirement?: string;
  computeRequirement?: string;
  networkingRequirement: 'IB' | 'ROCE';
  platformRequirement?: string;
  duration: string;
  deliveryTime: string;
  paymentMethod: string;
  budgetPerMonth: string;
  source?: string;
  region: string;
}

export interface PurchaseDemand extends BaseDemand {
  demandType: 'PURCHASE';
  gpuModelId: string;
  serverCount: number;
  isSpot: boolean; // 期货/现货
  deliveryTime: string;
  budgetTotal: string;
}

export interface ProjectDemand extends BaseDemand {
  demandType: 'PROJECT';
  nature: string; // 政府/企业
  pNumber: number; // P数
  hasApproval: boolean; // 批文
  deadline: string;
  dataCenter: string;
}

export type AnyDemand = RentalDemand | PurchaseDemand | ProjectDemand;

export interface OperationLog {
  id: string;
  time: string;
  username: string;
  realName: string;
  module: string;
  action: 'LOGIN' | 'LOGOUT' | 'ADD' | 'UPDATE' | 'DELETE';
  content: string;
  ip: string;
}
