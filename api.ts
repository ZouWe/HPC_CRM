
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

/**
 * 后端统一响应接口定义
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 登录返回的原始数据结构
 */
interface LoginResponseData {
  token: string;
  username: string;
  fullName: string;
  role: string;
  userId: number;
}

/**
 * 角色映射表：将后端中文角色名转换为前端枚举
 */
const ROLE_NAME_MAP: Record<string, RoleType> = {
  '管理员': RoleType.ADMIN,
  '销售总监': RoleType.SALES_DIRECTOR,
  '销售主管': RoleType.SALES_MANAGER,
  '销售': RoleType.SALES,
};

/**
 * 通用请求拦截封装
 */
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

  // 处理 HTTP 状态码错误
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('fuji_auth_token');
      localStorage.removeItem('fuji_user');
      window.location.reload();
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `网络请求失败: ${response.status}`);
  }

  // 解析后端统一包装格式 { code, message, data }
  const result: ApiResponse<T> = await response.json();

  if (result.code !== 200) {
    throw new Error(result.message || '业务逻辑错误');
  }

  return result.data; // 直接返回业务数据部分
}

export const api = {
  auth: {
    login: async (username: string, password?: string): Promise<User> => {
      const data = await request<LoginResponseData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (data.token) {
        localStorage.setItem('fuji_auth_token', data.token);
      }

      const mappedUser: User = {
        id: String(data.userId),
        username: data.username,
        realName: data.fullName,
        role: ROLE_NAME_MAP[data.role] || RoleType.SALES,
        phone: '', 
        department: '',
        status: 'ENABLE',
        createTime: new Date().toISOString(),
        creator: 'System',
        deleteFlag: false
      };

      return mappedUser;
    },
    logout: () => {
      localStorage.removeItem('fuji_auth_token');
      localStorage.removeItem('fuji_user');
    }
  },
  
  users: {
    list: async () => {
      // 适配后端返回的实体结构
      const rawData = await request<any[]>('/users');
      return rawData.map(u => ({
        id: String(u.id),
        username: u.username,
        realName: u.fullName || u.username || '未知',
        phone: u.phone || '-',
        email: u.email || '-',
        // 后端可能返回 null，这里做一层保护
        department: u.department?.name || (typeof u.department === 'string' ? u.department : '未分配'),
        status: u.isActive === false ? 'DISABLE' : 'ENABLE', // 映射后端 isActive
        role: u.role as RoleType,
        createTime: u.createdAt || '',
        creator: '',
        deleteFlag: u.isDeleted || false
      })) as User[];
    },
    add: (user: Partial<User>) => request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
    update: (id: string, updates: Partial<User>) => request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    }),
  },

  gpuModels: {
    list: () => request<GpuModel[]>('/gpu-devices'),
    add: (model: Partial<GpuModel>) => request<GpuModel>('/gpu-devices', {
      method: 'POST',
      body: JSON.stringify(model),
    }),
    update: (id: string, updates: Partial<GpuModel>) => request<GpuModel>(`/gpu-devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/gpu-devices/${id}`, {
      method: 'DELETE',
    }),
  },

  customers: {
    list: () => request<Customer[]>('/customers'),
    add: (cust: Partial<Customer>) => request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(cust),
    }),
    update: (id: string, updates: Partial<Customer>) => request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
  },

  companies: {
    list: () => request<Company[]>('/companies'),
    add: (comp: Partial<Company>) => request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(comp),
    }),
    update: (id: string, updates: Partial<Company>) => request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/companies/${id}`, {
      method: 'DELETE',
    }),
  },

  demands: {
    list: (type: 'RENTAL' | 'PURCHASE' | 'PROJECT') => 
      request<AnyDemand[]>(`/demands?type=${type}`),
    add: (type: string, demand: Partial<AnyDemand>) => request<AnyDemand>('/demands', {
      method: 'POST',
      body: JSON.stringify({ ...demand, demandType: type }),
    }),
    update: (type: string, id: string, updates: Partial<AnyDemand>) => 
      request<AnyDemand>(`/demands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (type: string, id: string) => request<{ success: boolean }>(`/demands/${id}`, {
      method: 'DELETE',
    })
  },

  departments: {
    list: () => request<any[]>('/departments'),
    add: (dept: any) => request<any>('/departments', { method: 'POST', body: JSON.stringify(dept) }),
    update: (id: string, updates: any) => request<any>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: string) => request<any>(`/departments/${id}`, { method: 'DELETE' }),
  },

  teams: {
    list: () => request<Team[]>('/teams'),
    add: (team: Partial<Team>) => request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    }),
    update: (id: string, updates: Partial<Team>) => request<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/teams/${id}`, {
      method: 'DELETE',
    }),
  }
};
