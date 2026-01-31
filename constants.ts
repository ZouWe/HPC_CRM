
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
    id: 'GPU1',
    name: 'NVIDIA H100',
    manufacturer: 'NVIDIA',
    vram: '80GB HBM3',
    serverType: '8卡 SXM5',
    tflops: '67 TFLOPS (FP64)',
    status: 'AVAILABLE',
    creatorId: 'U1',
    createTime: '2023-12-01 10:00:00',
    deleteFlag: false
  },
  {
    id: 'GPU2',
    name: 'NVIDIA A100',
    manufacturer: 'NVIDIA',
    vram: '80GB HBM2e',
    serverType: '8卡 SXM4',
    tflops: '19.5 TFLOPS (FP64)',
    status: 'SHORTAGE',
    creatorId: 'U1',
    createTime: '2023-01-15 14:00:00',
    deleteFlag: false
  },
  {
    id: 'GPU3',
    name: 'NVIDIA A800',
    manufacturer: 'NVIDIA',
    vram: '80GB HBM2e',
    serverType: '8卡 NVLink',
    status: 'AVAILABLE',
    creatorId: 'U1',
    createTime: '2023-06-20 09:30:00',
    deleteFlag: false
  }
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'D1', name: '销售一部', code: 'SALES_01', description: '负责华东区业务', createTime: '2023-01-01 10:00:00', creator: 'admin' },
  { id: 'D2', name: '销售二部', code: 'SALES_02', description: '负责华南区业务', createTime: '2023-01-01 10:00:00', creator: 'admin' },
  { id: 'D3', name: '系统管理部', code: 'SYS_ADMIN', description: '负责系统维护与安全', createTime: '2023-01-01 10:00:00', creator: 'admin' },
  { id: 'D4', name: '技术部', code: 'TECH', description: '负责 GPU 资源调度', createTime: '2023-01-01 10:00:00', creator: 'admin' },
];

export const TEAMS: Team[] = [
  { id: 'T1', name: '精英销售一队', leaderId: 'U2' },
  { id: 'T2', name: '卓越销售二队', leaderId: 'U3' }
];

export const MOCK_USERS: User[] = [
  {
    id: 'U1',
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
    id: 'U2',
    username: 'manager_zhang',
    password: '123456',
    realName: '张主管',
    phone: '13811111111',
    department: '销售一部',
    status: 'ENABLE',
    role: RoleType.SALES_MANAGER,
    teamId: 'T1',
    createTime: '2023-01-05 10:00:00',
    creator: 'admin',
    deleteFlag: false
  },
  {
    id: 'U3',
    username: 'sales_li',
    password: '123456',
    realName: '李销售',
    phone: '13822222222',
    department: '销售部',
    status: 'ENABLE',
    role: RoleType.SALES,
    teamId: 'T1',
    createTime: '2023-02-01 09:30:00',
    creator: 'manager_zhang',
    deleteFlag: false
  },
  {
    id: 'U4',
    username: 'director_wang',
    password: '123456',
    realName: '王总监',
    phone: '13833333333',
    department: '销售部',
    status: 'ENABLE',
    role: RoleType.SALES_DIRECTOR,
    createTime: '2023-01-02 14:00:00',
    creator: 'admin',
    deleteFlag: false
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'C1',
    name: '陈大客户',
    title: 'CTO',
    phone: '13912345678',
    role: 'DIRECT',
    creatorId: 'U3',
    teamId: 'T1',
    createTime: '2023-10-10 11:00:00',
    deleteFlag: false
  },
  {
    id: 'C2',
    name: '林经理',
    title: '采购总监',
    phone: '13788889999',
    role: 'CHANNEL',
    creatorId: 'U3',
    teamId: 'T1',
    createTime: '2023-11-15 14:20:00',
    deleteFlag: false
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'COM1',
    name: '未来科技有限公司',
    industry: 'AI',
    years: 5,
    capital: '5000万',
    mainBusiness: '大模型研发',
    screenshotUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    creatorId: 'U3',
    teamId: 'T1',
    createTime: '2023-10-10 11:05:00',
    deleteFlag: false
  },
  {
    id: 'COM2',
    name: '智算云服务（北京）有限公司',
    industry: '互联网',
    years: 8,
    capital: '1.2亿',
    mainBusiness: '算力租赁与运营',
    creatorId: 'U3',
    teamId: 'T1',
    createTime: '2023-11-15 14:25:00',
    deleteFlag: false
  }
];

export const MOCK_RENTAL_DEMANDS: RentalDemand[] = [
  {
    id: 'R1',
    demandType: 'RENTAL',
    customerId: 'C1',
    companyId: 'COM1',
    gpuModelId: 'GPU1',
    creatorId: 'U3',
    teamId: 'T1',
    status: DemandStatus.PENDING,
    type: '战略商机',
    createTime: '2024-01-27 10:00:00',
    deleteFlag: false,
    serverCount: 8,
    isBareMetal: true,
    networkingRequirement: 'IB',
    duration: '12个月',
    deliveryTime: '2024-03-01',
    paymentMethod: '季付',
    budgetPerMonth: '6万/台/月',
    region: '北京'
  }
];

export const MOCK_PURCHASE_DEMANDS: PurchaseDemand[] = [
  {
    id: 'P1',
    demandType: 'PURCHASE',
    customerId: 'C2',
    companyId: 'COM2',
    gpuModelId: 'GPU3',
    creatorId: 'U3',
    teamId: 'T1',
    status: DemandStatus.EVALUATING,
    type: '潜在商机',
    createTime: '2024-01-28 15:30:00',
    deleteFlag: false,
    serverCount: 32,
    isSpot: true,
    deliveryTime: '2024-02-15',
    budgetTotal: '4500万'
  }
];

export const MOCK_PROJECT_DEMANDS: ProjectDemand[] = [
  {
    id: 'PRJ1',
    demandType: 'PROJECT',
    customerId: 'C1',
    companyId: 'COM1',
    creatorId: 'U3',
    teamId: 'T1',
    status: DemandStatus.DEVELOPING,
    type: '战略商机',
    createTime: '2024-01-29 09:00:00',
    deleteFlag: false,
    nature: '企业项目',
    pNumber: 512,
    hasApproval: true,
    deadline: '2024-12-31',
    dataCenter: '中卫机房'
  }
];
