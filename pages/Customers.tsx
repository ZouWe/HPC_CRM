
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Phone, 
  Edit2, 
  Trash2, 
  X, 
  UserPlus, 
  UserCheck,
  AlertTriangle,
  Briefcase,
  Loader2
} from 'lucide-react';
import { CUSTOMER_ROLES } from '../constants';
import { Customer, RoleType, User } from '../types';
import { useAuth } from '../App';
import { api } from '../api';

const Customers: React.FC = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected entities for actions
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    title: '',
    phone: '',
    role: 'DIRECT' as 'INTERMEDIARY' | 'DIRECT' | 'CHANNEL'
  };
  const [formData, setFormData] = useState(initialFormState);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [customerList, userList] = await Promise.all([
        api.customers.list(),
        api.users.list()
      ]);
      setCustomers(customerList);
      setUsers(userList);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Data Isolation & Filter Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (c.deleteFlag) return false;

      // 前端权限过滤（兜底，后端API应已过滤）
      let hasAccess = false;
      if (currentUser?.role === RoleType.ADMIN || currentUser?.role === RoleType.SALES_DIRECTOR) {
        hasAccess = true;
      } else if (currentUser?.role === RoleType.SALES_MANAGER) {
        hasAccess = c.teamId === currentUser.teamId;
      } else {
        hasAccess = c.creatorId === currentUser?.id;
      }

      if (!hasAccess) return false;

      const matchesSearch = c.name.includes(searchTerm) || c.phone.includes(searchTerm);
      return matchesSearch;
    });
  }, [customers, searchTerm, currentUser]);

  const handleAddClick = () => {
    setEditingCustomer(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      title: customer.title || '',
      phone: customer.phone,
      role: customer.role
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCustomer) {
        await api.customers.update(editingCustomer.id, formData);
      } else {
        await api.customers.add({
          ...formData,
          creatorId: currentUser?.id,
          teamId: currentUser?.teamId
        } as any);
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save customer failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      setIsLoading(true);
      try {
        await api.customers.delete(customerToDelete.id);
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
        await loadData();
      } catch (err) {
        console.error('Delete customer failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCreatorName = (creatorId: string) => {
    return users.find(u => u.id === creatorId)?.realName || '未知用户';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索客户姓名、手机号..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          新增客户
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">序号</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">客户名称</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">联系方式</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">客户角色</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">归属信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer, idx) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-200">
                        {customer.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {customer.title || '职务未填'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      customer.role === 'DIRECT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      customer.role === 'CHANNEL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {CUSTOMER_ROLES.find(r => r.value === customer.role)?.label || customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{getCreatorName(customer.creatorId)}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{customer.createTime?.split(' ')[0]}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(customer)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(customer)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    未找到匹配的客户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{editingCustomer ? '编辑客户信息' : '新增客户'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">客户名称 <span className="text-rose-500">*</span></label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">职务</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">手机号 <span className="text-rose-500">*</span></label>
                  <input required type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">客户角色 <span className="text-rose-500">*</span></label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                  {CUSTOMER_ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2 text-sm font-medium text-slate-500">取消</button>
                <button type="submit" className="px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md">
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">确认删除客户？</h3>
            <p className="text-slate-500 text-sm mb-6">删除客户后无法恢复，是否继续？</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-bold">确认删除</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
