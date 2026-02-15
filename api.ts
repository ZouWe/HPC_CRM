
import { User, GpuModel, Customer, Company, AnyDemand } from './types';

const API_BASE_URL = 'http://api.fuji-crm.com/v1'; // 替换为你的后端实际地址

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

  // 统一错误处理
  if (!response.ok) {
    if (response.status === 401) {
      // Token 过期或无效，清除本地缓存并重定向
      localStorage.removeItem('fuji_auth_token');
      window.location.reload();
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `请求失败: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (username: string, password?: string) => {
      const response = await request<{ user: User, token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      // 登录成功后持久化 Token
      if (response.token) {
        localStorage.setItem('fuji_auth_token', response.token);
      }
      return response.user;
    },
    logout: () => {
      localStorage.removeItem('fuji_auth_token');
    }
  },
  
  users: {
    list: () => request<User[]>('/users'),
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
    list: () => request<GpuModel[]>('/gpu-models'),
    add: (model: Partial<GpuModel>) => request<GpuModel>('/gpu-models', {
      method: 'POST',
      body: JSON.stringify(model),
    }),
    update: (id: string, updates: Partial<GpuModel>) => request<GpuModel>(`/gpu-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/gpu-models/${id}`, {
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
  }
};
