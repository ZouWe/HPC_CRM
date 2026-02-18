
import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck,
  Building2,
  Users2,
  FileText,
  History,
  Building,
  Server
} from 'lucide-react';
import { User, RoleType } from './types';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Roles from './pages/Roles';
import Customers from './pages/Customers';
import Companies from './pages/Companies';
import Demands from './pages/Demands';
import Logs from './pages/Logs';
import Departments from './pages/Departments';
import GpuModels from './pages/GpuModels';
import Login from './pages/Login';
import { api } from './api';

// Auth Context
interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // 检查已存在的 Session
  useEffect(() => {
    const savedUser = localStorage.getItem('fuji_user');
    const token = localStorage.getItem('fuji_auth_token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setIsInitializing(false);
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    try {
      const user = await api.auth.login(username, password); 
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('fuji_user', JSON.stringify(user));
        return true;
      }
    } catch (err) {
      console.error('Login Error:', err);
    }
    return false;
  };

  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('fuji_user');
    setCurrentUser(null);
  };

  const hasPermission = (module: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === RoleType.ADMIN) return true;

    const role = currentUser.role;
    switch (module) {
      case 'employees': return false;
      case 'roles': return false;
      case 'departments': return false;
      case 'logs': return role === RoleType.SALES_DIRECTOR;
      case 'gpu_models': return true; 
      case 'logs': return role === RoleType.SALES_DIRECTOR;
      default: return true;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '控制台', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'departments', label: '部门管理', icon: Building, permission: 'departments' },
    { id: 'employees', label: '员工管理', icon: Users, permission: 'employees' },
    { id: 'roles', label: '权限管理', icon: ShieldCheck, permission: 'roles' },
    { id: 'gpu_models', label: 'GPU配置', icon: Server, permission: 'gpu_models' },
    { id: 'customers', label: '客户管理', icon: Users2, permission: 'customers' },
    { id: 'companies', label: '公司管理', icon: Building2, permission: 'companies' },
    { id: 'demands', label: '需求管理', icon: FileText, permission: 'demands' },
    { id: 'logs', label: '操作日志', icon: History, permission: 'logs' },
  ];

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  if (isInitializing) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission }}>
      <div className="flex h-screen bg-slate-50 text-slate-900">
        <aside className="w-64 bg-slate-900 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-indigo-400 w-6 h-6" />
              富脊超算CRM
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {currentUser.realName[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{currentUser.realName}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              退出系统
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-800">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500">
                数据权限: <span className="font-semibold text-indigo-600">
                  {currentUser.role === RoleType.ADMIN ? '全公司' : 
                   currentUser.role === RoleType.SALES_DIRECTOR ? '全公司' :
                   currentUser.role === RoleType.SALES_MANAGER ? '本团队' : '个人'}
                </span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto h-full">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'departments' && <Departments />}
              {activeTab === 'employees' && <Employees />}
              {activeTab === 'roles' && <Roles />}
              {activeTab === 'customers' && <Customers />}
              {activeTab === 'companies' && <Companies />}
              {activeTab === 'demands' && <Demands />}
              {activeTab === 'gpu_models' && <GpuModels />}
              {activeTab === 'logs' && <Logs />}
            </div>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
