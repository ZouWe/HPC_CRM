import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  LayoutGrid,
  ShoppingBag,
  Cpu,
  Database,
  X,
  Trash2,
  Edit2,
  AlertTriangle,
  Tags,
  Loader2,
  Calendar,
  Globe,
  Settings,
  CreditCard,
  User,
  Zap,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../App';
import { RoleType, DemandStatus, AnyDemand, RentalDemand, PurchaseDemand, ProjectDemand, GpuModel, Customer, Company } from '../types';
import { DEMAND_CATEGORIES } from '../constants';
import { api } from '../api';

type SubTab = 'RENTAL' | 'PURCHASE' | 'PROJECT';

const Demands: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('RENTAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [demands, setDemands] = useState<AnyDemand[]>([]);
  const [gpuModels, setGpuModels] = useState<GpuModel[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<AnyDemand | null>(null);
  const [demandToDelete, setDemandToDelete] = useState<AnyDemand | null>(null);

  // Form State for Rental
  const [rentalFormData, setRentalFormData] = useState<Partial<RentalDemand>>({});

  useEffect(() => {
    loadData();
  }, [activeSubTab, currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // Fix: Removed currentUser from api calls to match method signatures in api.ts
      const [demandList, modelList, customerList, companyList, userList] = await Promise.all([
        api.demands.list(activeSubTab),
        api.gpuModels.list(),
        api.customers.list(),
        api.companies.list(),
        api.users.list()
      ]);
      setDemands(demandList);
      setGpuModels(modelList);
      setCustomers(customerList);
      setCompanies(companyList);
      setUsers(userList);
    } catch (err) {
      console.error('Failed to load demands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDemands = useMemo(() => {
    if (!searchTerm) return demands;
    const term = searchTerm.toLowerCase();
    return demands.filter(d => {
      const custName = customers.find(c => c.id === d.customerId)?.name.toLowerCase() || '';
      const compName = companies.find(c => c.id === d.companyId)?.name.toLowerCase() || '';
      return custName.includes(term) || compName.includes(term);
    });
  }, [demands, searchTerm, customers, companies]);

  // Permissions based on 5.2
  const canEditCategory = currentUser?.role !== RoleType.SALES;
  const canEditStatus = [RoleType.ADMIN, RoleType.SALES_DIRECTOR].includes(currentUser?.role!);

  const getStatusColor = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case DemandStatus.EVALUATING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case DemandStatus.DEVELOPING: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case DemandStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCreatorName = (id: string) => users.find(u => u.id === id)?.realName || '未知用户';
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || '未知客户';
  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || '未知公司';
  const getGpuModelName = (id: string) => gpuModels.find(g => g.id === id)?.name || id;

  const handleOpenModal = (demand: AnyDemand | null) => {
    if (demand && demand.demandType === 'RENTAL') {
      setRentalFormData(demand as RentalDemand);
    } else {
      // Default initial state for new Rental demand
      setRentalFormData({
        demandType: 'RENTAL',
        status: DemandStatus.PENDING,
        type: DEMAND_CATEGORIES[0],
        serverCount: 1,
        isBareMetal: true,
        networkingRequirement: 'IB',
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        creatorId: currentUser?.id,
        teamId: currentUser?.teamId
      });
    }
    setEditingDemand(demand);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingDemand) {
        await api.demands.update('RENTAL', editingDemand.id, rentalFormData);
      } else {
        await api.demands.add('RENTAL', rentalFormData as RentalDemand);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {(['RENTAL', 'PURCHASE', 'PROJECT'] as SubTab[]).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab === 'RENTAL' ? <Cpu className="w-4 h-4" /> : tab === 'PURCHASE' ? <ShoppingBag className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            {tab === 'RENTAL' ? '租赁需求' : tab === 'PURCHASE' ? '采购需求' : '项目需求'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索客户、公司..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          新增{activeSubTab === 'RENTAL' ? '租赁' : activeSubTab === 'PURCHASE' ? '采购' : '项目'}需求
        </button>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-sm font-black text-indigo-900 animate-pulse">正在从富脊超算调取数据...</p>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">主体信息</th>
                {activeSubTab !== 'PROJECT' ? (
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">GPU/数量</th>
                ) : (
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">P数/性质</th>
                )}
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">
                  {activeSubTab === 'RENTAL' ? '租期/财务' : activeSubTab === 'PURCHASE' ? '预算' : '交付机房'}
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">时间信息</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">进度</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDemands.map((demand) => (
                <tr key={demand.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900 truncate max-w-[180px]">{getCompanyName(demand.companyId)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">客户: {getCustomerName(demand.customerId)}</p>
                  </td>
                  
                  {activeSubTab === 'RENTAL' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                          {getGpuModelName((demand as RentalDemand).gpuModelId)}
                        </span>
                        <span className="text-sm font-black text-slate-900">x{(demand as RentalDemand).serverCount}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                        {(demand as RentalDemand).isBareMetal ? '裸金属' : '虚拟机'} / {(demand as RentalDemand).networkingRequirement}组网
                      </p>
                    </td>
                  )}
                  {/* ... (Other tabs table cells) */}
                  
                  <td className="px-6 py-4 text-sm font-bold">
                     {activeSubTab === 'RENTAL' ? (
                       <div className="space-y-0.5">
                         <p className="text-slate-900">{(demand as RentalDemand).duration}</p>
                         <p className="text-xs text-indigo-600 font-bold" title="客户预算">预算: {(demand as RentalDemand).budgetPerMonth}</p>
                         {(demand as RentalDemand).cost && (
                           <p className="text-[10px] text-slate-400 font-normal" title="成本">成本: {(demand as RentalDemand).cost}</p>
                         )}
                       </div>
                     ) : (
                       (demand as any).budgetTotal || (demand as any).dataCenter
                     )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-900">
                    {activeSubTab === 'RENTAL' ? (
                      <div>
                        <p className="font-bold">{(demand as RentalDemand).deliveryTime}</p>
                        {(demand as RentalDemand).purchasingTime && (
                          <p className="text-[10px] text-slate-400 mt-0.5" title="采购时间">
                            采购: {(demand as RentalDemand).purchasingTime}
                          </p>
                        )}
                      </div>
                    ) : (
                      activeSubTab === 'PROJECT' ? (demand as ProjectDemand).deadline : (demand as any).deliveryTime
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(demand.status)}`}>
                      {demand.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(demand)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5.2 Rental Demand Modal */}
      {isModalOpen && activeSubTab === 'RENTAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                   <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingDemand ? '编辑' : '登记'}算力租赁需求
                  </h3>
                  <p className="text-xs text-slate-500">按照 5.2 业务规范填写租赁核心参数</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 bg-white space-y-12 custom-scrollbar">
              
              {/* 1. 关联信息 */}
              <section className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <Globe className="w-4 h-4" /> 关联信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">所属客户 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold"
                      value={rentalFormData.customerId}
                      onChange={e => setRentalFormData({...rentalFormData, customerId: e.target.value})}
                    >
                      <option value="">请选择客户</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">签约公司 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold"
                      value={rentalFormData.companyId}
                      onChange={e => setRentalFormData({...rentalFormData, companyId: e.target.value})}
                    >
                      <option value="">请选择公司</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">GPU服务器型号 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold"
                      value={rentalFormData.gpuModelId}
                      onChange={e => setRentalFormData({...rentalFormData, gpuModelId: e.target.value})}
                    >
                      <option value="">请选择型号</option>
                      {gpuModels.map(m => <option key={m.id} value={m.id}>{m.name} ({m.vram})</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* 2. 核心参数 */}
              <section className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <Zap className="w-4 h-4" /> 核心参数
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">服务器数量 <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.serverCount}
                      onChange={e => setRentalFormData({...rentalFormData, serverCount: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">产品规格 <span className="text-rose-500">*</span></label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setRentalFormData({...rentalFormData, isBareMetal: true})}
                        className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${rentalFormData.isBareMetal ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >裸金属</button>
                      <button 
                        type="button"
                        onClick={() => setRentalFormData({...rentalFormData, isBareMetal: false})}
                        className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${!rentalFormData.isBareMetal ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >含组网/云化</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">存储需求</label>
                    <input 
                      type="text" 
                      placeholder="如: 100TB NVMe" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.storageRequirement}
                      onChange={e => setRentalFormData({...rentalFormData, storageRequirement: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">通算需求</label>
                    <input 
                      type="text" 
                      placeholder="如: 50TFLOPS" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.computeRequirement}
                      onChange={e => setRentalFormData({...rentalFormData, computeRequirement: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* 3. 组网配置 */}
              <section className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <Settings className="w-4 h-4" /> 组网配置
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">组网要求 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.networkingRequirement}
                      onChange={e => setRentalFormData({...rentalFormData, networkingRequirement: e.target.value as 'IB' | 'ROCE'})}
                    >
                      <option value="IB">IB 组网 (InfiniBand)</option>
                      <option value="ROCE">RoCE 组网</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">平台要求</label>
                    <input 
                      type="text" 
                      placeholder="如: 指定 OS 或管理平台" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.platformRequirement}
                      onChange={e => setRentalFormData({...rentalFormData, platformRequirement: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* 4. 时间信息 */}
              <section className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <Calendar className="w-4 h-4" /> 时间信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">预期租期 <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      placeholder="如: 6个月 / 1年" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.duration}
                      onChange={e => setRentalFormData({...rentalFormData, duration: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">交付时间 <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="date" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.deliveryTime}
                      onChange={e => setRentalFormData({...rentalFormData, deliveryTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">采购时间</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.purchasingTime || ''}
                      onChange={e => setRentalFormData({...rentalFormData, purchasingTime: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* 5. 成本信息 */}
              <section className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <CreditCard className="w-4 h-4" /> 成本信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">付款方式 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.paymentMethod}
                      onChange={e => setRentalFormData({...rentalFormData, paymentMethod: e.target.value})}
                    >
                      <option value="">选择付款方式</option>
                      <option>预付全款</option>
                      <option>按月支付</option>
                      <option>按季支付</option>
                      <option>按年支付</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">预算台/月 <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      placeholder="如: 5.5万/台/月" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.budgetPerMonth}
                      onChange={e => setRentalFormData({...rentalFormData, budgetPerMonth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">成本 <span className="text-slate-400 font-normal">(台/月)</span></label>
                    <input 
                      type="text" 
                      placeholder="如: 4.5万/台/月" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.cost || ''}
                      onChange={e => setRentalFormData({...rentalFormData, cost: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* 6. 基础信息 (Read-only for existing) */}
              <section className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <HardDrive className="w-4 h-4" /> 基础信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">信息来源</label>
                    <input 
                      type="text" 
                      placeholder="如: 官网/客户介绍" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                      value={rentalFormData.source}
                      onChange={e => setRentalFormData({...rentalFormData, source: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 opacity-60">
                    <label className="text-xs font-black text-slate-700 uppercase">收集日期 (只读)</label>
                    <div className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       {rentalFormData.createTime}
                    </div>
                  </div>
                  <div className="space-y-1.5 opacity-60">
                    <label className="text-xs font-black text-slate-700 uppercase">创建人 (只读)</label>
                    <div className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold flex items-center gap-2">
                       <User className="w-4 h-4 text-slate-400" />
                       {getCreatorName(rentalFormData.creatorId || '')}
                    </div>
                  </div>
                </div>
              </section>

              {/* 7. 分类状态 (Permission Controlled) */}
              <section className="space-y-6 pt-6 border-t border-slate-100">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                  <Tags className="w-4 h-4" /> 分类状态
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                      需求分类 <span className="text-rose-500">*</span>
                      {/* Wrapped AlertCircle in a span with title to fix type error on Lucide icon */}
                      {!canEditCategory && (
                        <span title="销售权限不可改">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        </span>
                      )}
                    </label>
                    <select 
                      disabled={!canEditCategory}
                      className={`w-full px-5 py-3 border rounded-xl outline-none font-bold transition-all ${canEditCategory ? 'bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-100' : 'bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed'}`}
                      value={rentalFormData.type}
                      onChange={e => setRentalFormData({...rentalFormData, type: e.target.value})}
                    >
                      {DEMAND_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                      需求状态 <span className="text-rose-500">*</span>
                      {/* Wrapped AlertCircle in a span with title to fix type error on Lucide icon */}
                      {!canEditStatus && (
                        <span title="仅总监/管理员可改">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        </span>
                      )}
                    </label>
                    <select 
                      disabled={!canEditStatus}
                      className={`w-full px-5 py-3 border rounded-xl outline-none font-bold transition-all ${canEditStatus ? 'bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-100' : 'bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed'}`}
                      value={rentalFormData.status}
                      onChange={e => setRentalFormData({...rentalFormData, status: e.target.value as DemandStatus})}
                    >
                      {Object.values(DemandStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </section>

            </form>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-sm font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-widest"
              >
                取消
              </button>
              <button 
                type="submit"
                onClick={handleSave}
                className="px-12 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 uppercase tracking-widest flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingDemand ? '保存更新' : '确认录入需求'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demands;