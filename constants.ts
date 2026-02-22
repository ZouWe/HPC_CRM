
import { RoleType, User, Team, Customer, Company, RentalDemand, PurchaseDemand, ProjectDemand, DemandStatus, Department, GpuModel } from './types';

export const INDUSTRIES = ['互联网', '金融', 'AI', '科研', '制造'];
export const DEMAND_CATEGORIES = ['潜在商机', '战略商机'];
export const CUSTOMER_ROLES = [
  { value: 'INTERMEDIARY', label: '中间人' },
  { value: 'DIRECT', label: '直接客户' },
  { value: 'CHANNEL', label: '渠道' }
];

export const MOCK_GPU_MODELS: GpuModel[] = [
  {
    id: 1,
    brand: 'NVIDIA H100',
    memory: 80,
    cpu: 'Intel Xeon Platinum 8480C',
    ram: 2048,
    ibCard: '4x NDR 200Gbps',
    nvmeSsd: '3.84TB NVMe SSD',
    networkAdapter: 'Dual 100Gbps',
    powerSupply: '3000W redundant',
    rentalPriceMin: 65000,
    rentalPriceMax: 75000,
    salePriceMin: 2800000,
    salePriceMax: 3100000,
    createdAt: '2023-12-01 10:00:00',
    updatedAt: '2023-12-01 10:00:00',
    isDeleted: false,
    createdBy: '1',
    status: 'AVAILABLE'
  },
  {
    id: 2,
    brand: 'NVIDIA A100',
    memory: 80,
    cpu: 'AMD EPYC 7742',
    ram: 1024,
    ibCard: '4x HDR 200Gbps',
    nvmeSsd: '1.92TB NVMe SSD',
    networkAdapter: 'Dual 25Gbps',
    powerSupply: '2200W redundant',
    rentalPriceMin: 38000,
    rentalPriceMax: 42000,
    salePriceMin: 1100000,
    salePriceMax: 1250000,
    createdAt: '2023-01-15 14:00:00',
    updatedAt: '2023-01-15 14:00:00',
    isDeleted: false,
    createdBy: '1',
    status: 'SHORTAGE'
  }
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: '销售一部', code: 'SALES_01', description: '负责华东区业务', createTime: '2023-01-01 10:00:00', creator: 'admin' },
  { id: 2, name: '销售二部', code: 'SALES_02', description: '负责华南区业务', createTime: '2023-01-01 10:00:00', creator: 'admin' },
  { id: 3, name: '系统管理部', code: 'SYS_ADMIN', description: '负责系统维护与安全', createTime: '2023-01-01 10:00:00', creator: 'admin' },
];

export const TEAMS: Team[] = [
  { id: 1, name: '精英销售一队', leaderId: 2, departmentId: 1 },
  { id: 2, name: '卓越销售二队', leaderId: 3, departmentId: 1 },
  { id: 3, name: '大客户开发组', leaderId: 4, departmentId: 2 }
];

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    realName: '超级管理员',
    phone: '13800000000',
    email: 'admin@fuji.com',
    department: '系统管理部',
    status: 'ENABLE',
    role: RoleType.ADMIN,
    createTime: '2023-01-01 10:00:00',
    creator: 'System',
    deleteFlag: false
  },
  {
    id: 2,
    username: 'manager_zhang',
    password: '123456',
    realName: '张主管',
    phone: '13811111111',
    department: '销售一部',
    status: 'ENABLE',
    role: RoleType.SALES_MANAGER,
    teamId: '1',
    createTime: '2023-01-05 10:00:00',
    creator: 'admin',
    deleteFlag: false
  },
  {
    id: 3,
    username: 'sales_li',
    password: '123456',
    realName: '李销售',
    phone: '13822222222',
    department: '销售一部',
    status: 'ENABLE',
    role: RoleType.SALES,
    teamId: '1',
    createTime: '2023-02-01 09:30:00',
    creator: 'manager_zhang',
    deleteFlag: false
  },
  {
    id: 4,
    username: 'director_wang',
    password: '123456',
    realName: '王总监',
    phone: '13833333333',
    department: '销售二部',
    status: 'ENABLE',
    role: RoleType.SALES_DIRECTOR,
    createTime: '2023-01-02 14:00:00',
    creator: 'admin',
    deleteFlag: false
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: '陈大客户项目',
    companyName: '未来科技有限公司',
    contactPerson: '陈大客户',
    contactPhone: '13912345678',
    email: 'chen@future.com',
    demandPreference: '租赁',
    cooperationStage: '初步接触',
    followUpStatus: '跟进中',
    assigneeId: 3,
    creatorId: 3,
    teamId: '1',
    createTime: '2023-10-10 11:00:00',
    deleteFlag: false
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: '未来科技有限公司',
    industry: 'AI',
    years: 5,
    capital: '5000万',
    mainBusiness: '大模型研发',
    creatorId: 3,
    teamId: '1',
    createTime: '2023-10-10 11:05:00',
    deleteFlag: false
  }
];

export const MOCK_RENTAL_DEMANDS: RentalDemand[] = [
  {
    id: 1,
    title: 'H100 租赁需求', 
    priority: '高', 
    demandType: 'RENTAL',
    customerId: 1,
    gpuModelId: 1,
    creatorId: 3,
    teamId: '1',
    status: DemandStatus.PENDING_REVIEW, 
    category: '战略商机', 
    createTime: '2024-01-27 10:00:00',
    deleteFlag: false,
    serverCount: 8,
    networkingRequirement: 'IB',
    rentalPeriod: '12个月', 
    deliveryDate: '2024-03-01', 
    paymentMethod: '季付',
    budget: '6万/台/月', 
    cost: '4.5万/台/月',
    source: '北京' 
  }
];

export const MOCK_PURCHASE_DEMANDS: PurchaseDemand[] = [
  {
    id: 2,
    title: 'A100 采购需求', 
    priority: '中', 
    demandType: 'PURCHASE',
    customerId: 1,
    gpuModelId: 1,
    creatorId: 3,
    teamId: '1',
    status: DemandStatus.REVIEWING,
    category: '潜在商机', 
    createTime: '2024-01-28 15:30:00',
    deleteFlag: false,
    serverCount: 32,
    purchaseDate: '2024-02-15', 
    budget: '4500万' 
  }
];

export const MOCK_PROJECT_DEMANDS: ProjectDemand[] = [
  {
    id: 3,
    title: '企业算力底座项目', 
    priority: '高', 
    demandType: 'PROJECT',
    customerId: 1,
    creatorId: 3,
    teamId: '1',
    status: DemandStatus.IN_PROGRESS,
    category: '战略商机', 
    createTime: '2024-01-29 09:00:00',
    deleteFlag: false,
    projectName: '企业项目', 
    serverCount: 512, 
    projectDuration: '2024-12-31', 
    source: '中卫机房' 
  }
];
