
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Phone, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle,
  Loader2,
  Building2,
  Users2,
  Mail,
  Tag,
  Flag,
  User,
  ShieldCheck,
  Briefcase,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Customer, RoleType, User as UserType } from '../types';
import { useAuth } from '../App';
import { api } from '../api';

const PAGE_SIZE = 10;
const DEMAND_PREFERENCES = ['租赁', '采购', '算力租借', '项目外包', '其他'];
const COOPERATION_STAGES = ['初步接触', '商务洽谈', '方案评估', '合同签订', '售后服务', '合作终止'];
const FOLLOW_UP_STATUSES = ['待跟进', '跟进中', '高意向', '已成交', '已挂起', '已流失'];

const Customers: React.FC = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // 权限判断
  const canAssignRepresentative = useMemo(() => {
    return [RoleType.ADMIN, RoleType.SALES_DIRECTOR, RoleType.SALES_MANAGER].includes(currentUser?.role!);
  }, [currentUser]);

  const initialCustomerForm: Partial<Customer> = {
    name: '',
    companyName: '',
    contactPerson: '',
    contactPhone: '',
    email: '',
    demandPreference: DEMAND_PREFERENCES[0],
    cooperationStage: COOPERATION_STAGES[0],
    followUpStatus: FOLLOW_UP_STATUSES[0],
    assigneeId: currentUser?.id ?? 0 
  };
  const [customerForm, setCustomerForm] = useState(initialCustomerForm);

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
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredItems = useMemo(() => {
    return customers.filter(c => {
      if (c.deleteFlag) return false;
      
      const isAdmin = currentUser?.role === RoleType.ADMIN || currentUser?.role === RoleType.SALES_DIRECTOR;
      const isManager = currentUser?.role === RoleType.SALES_MANAGER && c.teamId === currentUser.teamId;
      const isOwner = c.creatorId === currentUser?.id || c.assigneeId === currentUser?.id;
      
      if (!isAdmin && !isManager && !isOwner) return false;

      const search = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(search) || 
        c.companyName.toLowerCase().includes(search) || 
        c.contactPerson.toLowerCase().includes(search) ||
        c.contactPhone.includes(search)
      );
    });
  }, [customers, searchTerm, currentUser]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setSubmissionError(null);
    setCustomerForm({
      ...initialCustomerForm,
      assigneeId: currentUser?.id ?? 0
    });
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setSubmissionError(null);
    setCustomerForm({
      name: c.name,
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      contactPhone: c.contactPhone,
      email: c.email || '',
      demandPreference: c.demandPreference || DEMAND_PREFERENCES[0],
      cooperationStage: c.cooperationStage || COOPERATION_STAGES[0],
      followUpStatus: c.followUpStatus || FOLLOW_UP_STATUSES[0],
      assigneeId: c.assigneeId || c.creatorId
    });
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setIsLoading(true);
    try {
      if (editingCustomer) {
        await api.customers.update(editingCustomer.id, customerForm as Customer);
      } else {
        await api.customers.add({
          ...customerForm,
          creatorId: currentUser?.id,
          teamId: currentUser?.teamId
        } as any);
      }
      setIsCustomerModalOpen(false);
      await loadData();
    } catch (err: any) { 
      console.error(err);
      setSubmissionError(err.message || '保存客户档案失败，请检查输入或重试');
    } finally { 
      setIsLoading(false); 
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    setIsLoading(true);
    try {
      await api.customers.delete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const getEmployeeName = (id: string | number) => {
    const idNum = Number(id);
    const user = users.find(u => u.id === idNum);
    return user ? user.realName : `用户ID: ${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          客户资料管理
        </h2>
        <button 
          onClick={handleAddCustomer}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          新增客户记录
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索项目名、公司、联系人、电话..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          共计 <span className="text-indigo-600 font-bold">{filteredItems.length}</span> 位客户
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">客户/项目名</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">所属公司</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">联系人信息</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">跟进状态</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">对接负责人</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter">
                        偏好: {customer.demandPreference || '未填'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                        <UserPlus className="w-2.5 h-2.5" />
                        创建人: {getEmployeeName(customer.creatorId)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {customer.companyName || '个人客户'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                        <Users2 className="w-3.5 h-3.5 text-slate-400" />
                        {customer.contactPerson}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {customer.contactPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 self-start">
                        {customer.cooperationStage}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border self-start ${
                        customer.followUpStatus === '已成交' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        customer.followUpStatus === '高意向' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        customer.followUpStatus === '已流失' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {customer.followUpStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 font-black">
                          {getEmployeeName(customer.assigneeId)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Assignee ID: {customer.assigneeId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditCustomer(customer)} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setItemToDelete(customer.id); setIsDeleteModalOpen(true); }} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-slate-400 italic font-medium">
                    未找到匹配的客户记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页控制 UI */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              显示第 <span className="text-indigo-600">{(currentPage - 1) * PAGE_SIZE + 1}</span> 至 <span className="text-indigo-600">{Math.min(currentPage * PAGE_SIZE, filteredItems.length)}</span> 条，共 <span className="text-indigo-600">{filteredItems.length}</span> 条
            </p>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    currentPage === i + 1 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 客户编辑/新增 Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-6 h-6 text-indigo-600" />
                {editingCustomer ? '编辑客户档案' : '建立新客户档案'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCustomerSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {submissionError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-rose-700">{submissionError}</p>
                </div>
              )}

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> 基本及公司信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">项目/客户名称 *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="项目名称"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                      value={customerForm.name} 
                      onChange={e => setCustomerForm({...customerForm, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">所属公司</label>
                    <input 
                      type="text" 
                      placeholder="公司全称"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                      value={customerForm.companyName} 
                      onChange={e => setCustomerForm({...customerForm, companyName: e.target.value})} 
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users2 className="w-4 h-4" /> 联系人详情
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">联系人 *</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" 
                      value={customerForm.contactPerson} 
                      onChange={e => setCustomerForm({...customerForm, contactPerson: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">电话 *</label>
                    <input 
                      required 
                      type="tel" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" 
                      value={customerForm.contactPhone} 
                      onChange={e => setCustomerForm({...customerForm, contactPhone: e.target.value})} 
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Flag className="w-4 h-4" /> 合作状态
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase text-[10px]">需求偏好</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={customerForm.demandPreference} 
                      onChange={e => setCustomerForm({...customerForm, demandPreference: e.target.value})}
                    >
                      {DEMAND_PREFERENCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase text-[10px]">跟进状态</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={customerForm.followUpStatus} 
                      onChange={e => setCustomerForm({...customerForm, followUpStatus: e.target.value})}
                    >
                      {FOLLOW_UP_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase text-[10px]">合作阶段</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={customerForm.cooperationStage} 
                      onChange={e => setCustomerForm({...customerForm, cooperationStage: e.target.value})}
                    >
                      {COOPERATION_STAGES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 对接与指派
                </h4>
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">对接负责人 *</label>
                    {canAssignRepresentative ? (
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                        <select 
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 text-slate-900"
                          value={customerForm.assigneeId}
                          onChange={e => setCustomerForm({...customerForm, assigneeId: Number(e.target.value)})}
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.realName} (@{u.username})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-black text-slate-500 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {getEmployeeName(customerForm.assigneeId || 0)} (自动指派)
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCustomerModalOpen(false)} 
                  className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '完成并提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认 Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-sm p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">废弃此记录？</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              确定要删除该客户记录吗？此操作不可撤销。
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmDelete} 
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
              >
                确认删除
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
