
export enum RoleType {
  SALES = 'SALES',
  SALES_MANAGER = 'SALES_MANAGER',
  SALES_DIRECTOR = 'SALES_DIRECTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  password?: string;
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
  departmentId: string; // 关联的部门ID
}

export interface Customer {
  id: string;
  name: string;
  title?: string;
  phone: string;
  role: 'INTERMEDIARY' | 'DIRECT' | 'CHANNEL';
  companyId?: string; // 关联的企业ID
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

/**
 * 更新后的 GPU 配置模型，匹配后端 JSON
 */
export interface GpuModel {
  id: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  brand: string;           // 品牌型号，如 NVIDIA H100
  memory: number;          // 显存，如 80 (GB)
  cpu: string;             // 处理器信息
  ram: number;             // 系统内存，如 512 (GB)
  ibCard: string;          // IB网卡
  nvmeSsd: string;         // 硬盘
  networkAdapter: string;  // 网卡
  powerSupply: string;     // 电源
  rentalPriceMin: number;
  rentalPriceMax: number;
  salePriceMin: number;
  salePriceMax: number;
  createdBy: string | null;
  // 保持 UI 逻辑兼容的可选字段
  status?: 'AVAILABLE' | 'SHORTAGE' | 'UNAVAILABLE';
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
  type: string;
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
  cost?: string;
  purchasingTime?: string;
  source?: string;
  region: string;
}

export interface PurchaseDemand extends BaseDemand {
  demandType: 'PURCHASE';
  gpuModelId: string;
  serverCount: number;
  isSpot: boolean;
  deliveryTime: string;
  budgetTotal: string;
}

export interface ProjectDemand extends BaseDemand {
  demandType: 'PROJECT';
  nature: string;
  pNumber: number;
  hasApproval: boolean;
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
