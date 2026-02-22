
// import { User, GpuModel, Customer, Company, AnyDemand } from './types';

// const API_BASE_URL = 'http://localhost:8080/api'; // 替换为你的后端实际地址

// /**
//  * 通用请求拦截封装
//  */
// async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
//   const token = localStorage.getItem('fuji_auth_token');
  
//   const headers = new Headers(options.headers);
//   headers.set('Content-Type', 'application/json');
//   if (token) {
//     headers.set('Authorization', `Bearer ${token}`);
//   }

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers,
//   });

//   // 统一错误处理
//   if (!response.ok) {
//     if (response.status === 401) {
//       // Token 过期或无效，清除本地缓存并重定向
//       localStorage.removeItem('fuji_auth_token');
//       window.location.reload();
//     }
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.message || `请求失败: ${response.status}`);
//   }

//   return response.json();
// }

// export const api = {
//   auth: {
//     login: async (username: string, password?: string) => {
//       const response = await request<{ user: User, token: string }>('/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({ username, password }),
//       });
//       // 登录成功后持久化 Token
//       if (response.token) {
//         localStorage.setItem('fuji_auth_token', response.token);
//       }
//       return response.user;
//     },
//     logout: () => {
//       localStorage.removeItem('fuji_auth_token');
//     }
//   },
  
//   users: {
//     list: () => request<User[]>('/users'),
//     add: (user: Partial<User>) => request<User>('/users', {
//       method: 'POST',
//       body: JSON.stringify(user),
//     }),
//     update: (id: string, updates: Partial<User>) => request<User>(`/users/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(updates),
//     }),
//     delete: (id: string) => request<{ success: boolean }>(`/users/${id}`, {
//       method: 'DELETE',
//     }),
//   },

//   gpuModels: {
//     list: () => request<GpuModel[]>('/gpu-devices'),
//     add: (model: Partial<GpuModel>) => request<GpuModel>('/gpu-devices', {
//       method: 'POST',
//       body: JSON.stringify(model),
//     }),
//     update: (id: string, updates: Partial<GpuModel>) => request<GpuModel>(`/gpu-devices/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(updates),
//     }),
//     delete: (id: string) => request<{ success: boolean }>(`/gpu-devices/${id}`, {
//       method: 'DELETE',
//     }),
//   },

//   customers: {
//     list: () => request<Customer[]>('/customers'),
//     add: (cust: Partial<Customer>) => request<Customer>('/customers', {
//       method: 'POST',
//       body: JSON.stringify(cust),
//     }),
//     update: (id: string, updates: Partial<Customer>) => request<Customer>(`/customers/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(updates),
//     }),
//     delete: (id: string) => request<{ success: boolean }>(`/customers/${id}`, {
//       method: 'DELETE',
//     }),
//   },

//   companies: {
//     list: () => request<Company[]>('/companies'),
//     add: (comp: Partial<Company>) => request<Company>('/companies', {
//       method: 'POST',
//       body: JSON.stringify(comp),
//     }),
//     update: (id: string, updates: Partial<Company>) => request<Company>(`/companies/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(updates),
//     }),
//     delete: (id: string) => request<{ success: boolean }>(`/companies/${id}`, {
//       method: 'DELETE',
//     }),
//   },

//   demands: {
//     list: (type: 'RENTAL' | 'PURCHASE' | 'PROJECT') => 
//       request<AnyDemand[]>(`/demands?type=${type}`),
//     add: (type: string, demand: Partial<AnyDemand>) => request<AnyDemand>('/demands', {
//       method: 'POST',
//       body: JSON.stringify({ ...demand, demandType: type }),
//     }),
//     update: (type: string, id: string, updates: Partial<AnyDemand>) => 
//       request<AnyDemand>(`/demands/${id}`, {
//         method: 'PUT',
//         body: JSON.stringify(updates),
//       }),
//     delete: (type: string, id: string) => request<{ success: boolean }>(`/demands/${id}`, {
//       method: 'DELETE',
//     })
//   },

//   departments: {
//     list: () => request<any[]>('/departments'),
//   }
// };


import { User, GpuModel, Customer, Company, AnyDemand, RoleType } from './types';

const API_BASE_URL = 'http://localhost:8080/api'; // 替换为你的后端实际地址


interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface LoginResponseData {
  token: string;
  username: string;
  fullName: string;
  role: string;
  userId: number;
}

const ROLE_NAME_MAP: Record<string, RoleType> = {
  'ADMIN': RoleType.ADMIN,
  'SALES_DIRECTOR': RoleType.SALES_DIRECTOR,
  'SALES_MANAGER': RoleType.SALES_MANAGER,
  'SALES': RoleType.SALES,
};

// 辅助函数：格式化日期为 yyyy-mm-dd hh:mm:ss
function formatDateTime(dateInput: string | number | Date | undefined): string {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());

  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('fuji_auth_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `网络请求失败: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  if (result.code === 401) {
    handleUnauthorized();
    throw new Error(result.message || '登录已过期');
  }
  if (result.code !== 200) {
    throw new Error(result.message || '服务器处理异常');
  }
  return result.data;
}

function handleUnauthorized() {
  localStorage.removeItem('fuji_auth_token');
  localStorage.removeItem('fuji_user');
  window.location.href = '/';
}

export const api = {
  auth: {
    login: async (username: string, password?: string): Promise<User> => {
      const data = await request<LoginResponseData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (data.token) localStorage.setItem('fuji_auth_token', data.token);
      return {
        id: Number(data.userId),
        username: data.username,
        realName: data.fullName,
        role: ROLE_NAME_MAP[data.role] || RoleType.SALES,
        phone: '', 
        status: 'ENABLE',
        createTime: new Date().toISOString(),
        creator: 'System',
        deleteFlag: false
      };
    },
    logout: () => handleUnauthorized()
  },
  
  users: {
    list: async () => {
      const rawData = await request<any[]>('/users');
      return rawData.map(u => ({
        id: Number(u.id),
        username: u.username,
        realName: u.fullName || u.username || '未知',
        phone: u.phone || '-',
        email: u.email || '-',
        departmentId: u.departmentId, 
        teamId: u.teamId,
        status: u.isActive === false ? 'DISABLE' : 'ENABLE',
        role: u.role as RoleType,
        createTime: u.createdAt || '',
        creator: '',
        deleteFlag: u.isDeleted || false
      })) as User[];
    },
    add: (user: any) => request<User>('/users', { method: 'POST', body: JSON.stringify(user) }),
    update: (id: number, updates: any) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: number) => request<any>(`/users/${id}`, { method: 'DELETE' }),
  },

  customers: {
    list: async () => {
      const rawData = await request<any[]>('/customers');
      return rawData.map(c => {
        const creatorId = typeof c.createdBy === 'number' 
          ? c.createdBy 
          : Number(c.createdBy?.id || c.creator_id || 0);
          
        const assigneeId = Number(c.assignee?.id || c.assignee_id || creatorId || 0);

        return {
          id: Number(c.id),
          name: c.title || c.name,
          companyName: c.company_name || c.companyName,
          contactPerson: c.contact_person || c.contactPerson,
          contactPhone: c.contact_phone || c.contactPhone,
          email: c.email,
          demandPreference: c.demand_preference || c.demandPreference,
          cooperationStage: c.cooperation_stage || c.cooperationStage,
          followUpStatus: c.follow_up_status || c.followUpStatus,
          assigneeId: assigneeId,
          creatorId: creatorId,
          teamId: String(c.team?.id || c.team_id || ''),
          createTime: c.createdAt || c.createTime,
          deleteFlag: c.isDeleted || false
        };
      }) as Customer[];
    },
    add: (cust: Partial<Customer>) => {
      const payload = {
        name: cust.name, // 增加 name 属性
        title: cust.name,
        companyName: cust.companyName, // 替换为驼峰命名
        contactPerson: cust.contactPerson,
        contactPhone: cust.contactPhone,
        email: cust.email,
        demandPreference: cust.demandPreference,
        cooperationStage: cust.cooperationStage,
        followUpStatus: cust.followUpStatus,
        assigneeId: cust.assigneeId ? Number(cust.assigneeId) : null
      };
      return request<Customer>('/customers', { method: 'POST', body: JSON.stringify(payload) });
    },
    update: (id: number, updates: Partial<Customer>) => {
      const payload = {
        name: updates.name, // 增加 name 属性
        title: updates.name,
        companyName: updates.companyName, // 替换为驼峰命名
        contactPerson: updates.contactPerson,
        contactPhone: updates.contactPhone,
        email: updates.email,
        demandPreference: updates.demandPreference,
        cooperationStage: updates.cooperationStage,
        followUpStatus: updates.followUpStatus,
        assigneeId: updates.assigneeId ? Number(updates.assigneeId) : null
      };
      return request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    delete: (id: number) => request<any>(`/customers/${id}`, { method: 'DELETE' }),
  },

  companies: {
    list: async () => {
      const rawData = await request<any[]>('/companies');
      return rawData.map(c => ({
        id: Number(c.id),
        name: c.name,
        industry: c.industry,
        years: c.years,
        capital: c.capital,
        mainBusiness: c.main_business || c.mainBusiness,
        screenshotUrl: c.screenshot_url || c.screenshotUrl,
        creatorId: Number(c.creator_id || c.createdBy?.id || 0),
        teamId: String(c.team_id || c.team?.id || ''),
        createTime: c.createdAt || c.createTime || '',
        deleteFlag: c.isDeleted || false
      })) as Company[];
    },
    add: (comp: any) => request<Company>('/companies', { method: 'POST', body: JSON.stringify(comp) }),
    update: (id: number, updates: any) => request<Company>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: number) => request<any>(`/companies/${id}`, { method: 'DELETE' }),
  },

  departments: {
    list: async () => {
      const rawData = await request<any[]>('/departments');
      return rawData.map(d => ({
        ...d,
        id: Number(d.id),
        createTime: d.createdAt,
      })) as Department[];
    },
    add: (dept: any) => request<Department>('/departments', { method: 'POST', body: JSON.stringify(dept) }),
    update: (id: number, updates: any) => request<Department>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: number) => request<any>(`/departments/${id}`, { method: 'DELETE' }),
  },

  teams: {
    list: async () => {
      const rawData = await request<any[]>('/teams');
      return rawData.map(t => ({
        id: Number(t.id),
        name: t.name,
        leaderId: Number(t.manager?.id || t.managerId || 0),
        departmentId: Number(t.department?.id || 0),
      })) as Team[];
    },
    add: (team: any) => {
      const payload = {
        name: team.name,
        departmentId: team.departmentId,
        managerId: team.leaderId ? Number(team.leaderId) : null
      };
      return request<Team>('/teams', { method: 'POST', body: JSON.stringify(payload) });
    },
    update: (id: number, updates: any) => {
      const payload = {
        name: updates.name,
        departmentId: updates.departmentId,
        managerId: updates.leaderId ? Number(updates.leaderId) : null
      };
      return request<Team>(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    delete: (id: number) => request<any>(`/teams/${id}`, { method: 'DELETE' }),
  },

  gpuModels: {
    list: async () => {
      const rawData = await request<any[]>('/gpu-devices');
      return rawData.map(m => ({
        ...m,
        id: Number(m.id),
        isDeleted: m.isDeleted || false
      })) as GpuModel[];
    },
    add: (data: any) => request<GpuModel>('/gpu-devices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<GpuModel>(`/gpu-devices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<any>(`/gpu-devices/${id}`, { method: 'DELETE' }),
  },

  demands: {
    list: async (type: string) => {
      const rawData = await request<any[]>(`/demands?type=${type}`);
      return rawData.map(d => {
        let budgetDisplay = '';
        if (d.budget && typeof d.budget === 'object') {
          budgetDisplay = d.budget.source || String(d.budget.parsedValue || '');
        } else {
          budgetDisplay = d.budget ? String(d.budget) : '';
        }

        let costDisplay = '';
        if (d.cost && typeof d.cost === 'object') {
          costDisplay = d.cost.source || String(d.cost.parsedValue || '');
        } else {
          costDisplay = d.cost ? String(d.cost) : '';
        }

        return {
          id: Number(d.id),
          title: d.title || '未命名需求',
          demandType: d.type || type,
          status: d.status,
          category: d.category || '潜在商机',
          priority: d.priority || '中',
          description: d.description,
          source: d.source,
          customerId: Number(d.customerId ?? d.customer?.id ?? 0),
          gpuModelId: d.gpuDeviceId || d.gpuDevice?.id ? Number(d.gpuDeviceId ?? d.gpuDevice?.id) : undefined,
          serverCount: d.serverCount ?? 0,
          includeNetworking: d.include_networking || d.includeNetworking || false,
          storageRequirement: d.storage_requirement || d.storageRequirement,
          computingRequirement: d.computing_requirement || d.computingRequirement,
          networkingRequirement: d.networking_requirement || d.networkingRequirement,
          platformRequirement: d.platform_requirement || d.platformRequirement,
          rentalPeriod: d.rental_period || d.rentalPeriod,
          deliveryDate: d.deliveryDate || d.delivery_date || '',
          purchaseDate: d.purchaseDate || d.purchase_date || '',
          paymentMethod: d.payment_method || d.paymentMethod,
          budget: budgetDisplay,
          cost: costDisplay,
          projectName: d.project_name || d.projectName,
          projectScope: d.project_scope || d.projectScope,
          technicalRequirement: d.technical_requirement || d.technicalRequirement,
          projectDuration: d.project_duration || d.projectDuration,
          servicePrice: d.service_price ? String(d.servicePrice) : '',
          creatorId: Number(d.createdBy?.id || d.creator_id || 0),
          teamId: String(d.team?.id || d.team_id || ''),
          createTime: d.createdAt,
          deleteFlag: d.isDeleted || false
        };
      }) as AnyDemand[];
    },
    add: (type: string, data: any) => {
      const payload = {
        ...data,
        name: data.title, // 增加 name 属性
        type: type, 
        customerId: data.customerId ? Number(data.customerId) : null, // 替换为驼峰
        gpuDeviceId: data.gpuModelId ? Number(data.gpuModelId) : null, // 替换为驼峰
      };
      return request<AnyDemand>(`/demands?type=${type}`, { method: 'POST', body: JSON.stringify(payload) });
    },
    update: (type: string, id: number, data: any) => {
      const payload = {
        ...data,
        name: data.title, // 增加 name 属性
        type: type, 
        customerId: data.customerId ? Number(data.customerId) : null, // 替换为驼峰
        gpuDeviceId: data.gpuModelId ? Number(data.gpuModelId) : null, // 替换为驼峰
      };
      return request<AnyDemand>(`/demands/${id}?type=${type}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
  },

  logs: {
    list: async () => {
      const rawData = await request<any[]>('/logs');
      return rawData.map(l => ({
        id: Number(l.id),
        username: l.user?.username || 'System',
        realName: l.user?.realName || l.user?.fullName || '系统',
        module: l.module,
        operationType: l.operationType,
        operationDesc: l.operationDesc,
        requestMethod: l.requestMethod,
        requestUrl: l.requestUrl,
        requestParams: l.requestParams,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        isSuccess: l.isSuccess === undefined ? true : l.isSuccess,
        errorMessage: l.errorMessage,
        executionTime: formatDateTime(l.executionTime),
        oldValue: l.oldValue,
        newValue: l.newValue,
        createTime: formatDateTime(l.createdAt || l.createTime), // 使用格式化函数
      })) as OperationLog[];
    },
    clear: () => request<any>('/operation-logs', { method: 'DELETE' }),
  }
};
