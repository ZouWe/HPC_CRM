
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Cpu, 
  ShoppingBag, 
  Database, 
  X, 
  Edit2, 
  Loader2, 
  Zap,
  Building2,
  Users2,
  Tags,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  LayoutGrid,
  FileText,
  Settings,
  ShieldCheck,
  Info,
  Server,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../App';
import { RoleType, DemandStatus, AnyDemand, GpuModel, Customer } from '../types';
import { DEMAND_CATEGORIES } from '../constants';
import { api } from '../api';

const PAGE_SIZE = 10;
type SubTab = 'RENTAL' | 'PURCHASE' | 'PROJECT';

const Demands: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('RENTAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [demands, setDemands] = useState<AnyDemand[]>([]);
  const [gpuModels, setGpuModels] = useState<GpuModel[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<AnyDemand | null>(null);

  // 权限控制逻辑
  const role = currentUser?.role;
  const isAdminOrDirector = role === RoleType.ADMIN || role === RoleType.SALES_DIRECTOR;
  const isManager = role === RoleType.SALES_MANAGER;
  
  // 是否展示相应字段的控制位
  const showCategory = isAdminOrDirector || isManager;
  const showPriority = isAdminOrDirector || isManager;
  const showStatus = isAdminOrDirector;
  const showPayment = true; // 所有人可见
  const showBudget = true;  // 所有人可见

  // Unified Form State
  const initialForm: Partial<AnyDemand> = {
    title: '',
    customerId: 0,
    category: DEMAND_CATEGORIES[0],
    status: DemandStatus.PENDING_REVIEW,
    priority: '中',
    description: '',
    source: '',
    budget: '',
    cost: '',
    gpuModelId: 0,
    serverCount: 1,
    includeNetworking: false,
    rentalPeriod: '',
    deliveryDate: '', 
    purchaseDate: '',  
    paymentMethod: '',
    projectName: '',
    projectScope: '',
    technicalRequirement: '',
    projectDuration: '',
    servicePrice: ''
  };
  const [formData, setFormData] = useState<any>(initialForm);

  const selectedModel = useMemo(() => {
    return gpuModels.find(m => m.id === Number(formData.gpuModelId));
  }, [formData.gpuModelId, gpuModels]);

  const referencePriceRange = useMemo(() => {
    if (!selectedModel) return null;
    const rMin = Number(selectedModel.rentalPriceMin ?? 0);
    const rMax = Number(selectedModel.rentalPriceMax ?? 0);
    const sMin = Number(selectedModel.salePriceMin ?? 0);
    const sMax = Number(selectedModel.salePriceMax ?? 0);

    if (activeSubTab === 'RENTAL') {
      if (rMin === 0 && rMax === 0) return '价格待定';
      return `¥${rMin.toLocaleString()} - ¥${rMax.toLocaleString()}`;
    }
    if (activeSubTab === 'PURCHASE') {
      if (sMin === 0 && sMax === 0) return '价格待定';
      return `¥${sMin.toLocaleString()} - ¥${sMax.toLocaleString()}`;
    }
    return null;
  }, [selectedModel, activeSubTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [demandList, modelList, customerList] = await Promise.all([
        api.demands.list(activeSubTab),
        api.gpuModels.list(),
        api.customers.list()
      ]);
      setDemands(demandList);
      setGpuModels(modelList);
      setCustomers(customerList);
    } catch (err) {
      console.error('Failed to load demands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [activeSubTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredDemands = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = demands.filter(d => {
      if (!term) return true;
      const custName = customers.find(c => c.id === d.customerId)?.name.toLowerCase() || '';
      return d.title.toLowerCase().includes(term) || custName.includes(term);
    });
    return filtered;
  }, [demands, searchTerm, customers]);

  const totalPages = Math.ceil(filteredDemands.length / PAGE_SIZE);
  const paginatedDemands = filteredDemands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleOpenModal = (demand: AnyDemand | null) => {
    setSubmissionError(null);
    if (demand) {
      setEditingDemand(demand);
      setFormData({ ...demand });
    } else {
      setEditingDemand(null);
      setFormData({ ...initialForm, demandType: activeSubTab });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setIsLoading(true);
    try {
      if (editingDemand) {
        await api.demands.update(activeSubTab, editingDemand.id, formData);
      } else {
        await api.demands.add(activeSubTab, formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Save failed:', err);
      setSubmissionError(err.message || '保存需求失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: DemandStatus) => {
    const map: Record<DemandStatus, string> = {
      [DemandStatus.PENDING_REVIEW]: '待审核',
      [DemandStatus.REVIEWING]: '审核中',
      [DemandStatus.APPROVED]: '已通过',
      [DemandStatus.IN_PROGRESS]: '进行中',
      [DemandStatus.COMPLETED]: '已完成',
      [DemandStatus.CLOSED]: '已关闭',
      [DemandStatus.REJECTED]: '已驳回'
    };
    return map[status] || status;
  };

  const getStatusStyles = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.COMPLETED: 
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case DemandStatus.REJECTED:
      case DemandStatus.CLOSED: 
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case DemandStatus.PENDING_REVIEW: 
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case DemandStatus.REVIEWING:
      case DemandStatus.APPROVED:
      case DemandStatus.IN_PROGRESS: 
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getCustomerName = (id: number) => {
    const found = customers.find(c => c.id === id);
    return found ? found.name : `未知客户(${id})`;
  };

  const getGpuBrand = (id: number | undefined) => {
    if (!id) return '未选型号';
    const found = gpuModels.find(g => g.id === id);
    return found ? found.brand : '未知型号';
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
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
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索项目标题、关联客户..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          录入需求
        </button>
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
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">需求标题/项目名</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">关联客户</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">台数/规格</th>
                
                {/* 动态权限列头 */}
                {showCategory && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">商机分类</th>}
                {showPriority && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter text-center">优先级</th>}
                {showStatus && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter text-center">需求进度</th>}
                {showPayment && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">支付/账期</th>}
                {showBudget && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">预算金额</th>}
                
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDemands.map((demand) => (
                <tr key={demand.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900 line-clamp-1">{demand.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">ID: {demand.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-bold whitespace-nowrap">
                      <Users2 className="w-3.5 h-3.5 text-slate-400" />
                      {getCustomerName(demand.customerId)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200">
                           {(demand as any).serverCount || 0} {demand.demandType === 'PROJECT' ? 'P' : '台'}
                         </span>
                         {demand.demandType !== 'PROJECT' && (
                           <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                             {getGpuBrand((demand as any).gpuModelId)}
                           </span>
                         )}
                      </div>
                    </div>
                  </td>

                  {/* 动态权限列内容 */}
                  {showCategory && (
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                        <BarChart3 className="w-3 h-3" />
                        {demand.category || '未分类'}
                      </span>
                    </td>
                  )}

                  {showPriority && (
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border ${
                        demand.priority === '高' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                        demand.priority === '中' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                        'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {demand.priority?.[0] || '中'}
                      </span>
                    </td>
                  )}

                  {showStatus && (
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${getStatusStyles(demand.status)}`}>
                        {getStatusLabel(demand.status)}
                      </span>
                    </td>
                  )}

                  {showPayment && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <CreditCard className="w-3.5 h-3.5 opacity-40" />
                        <span className="line-clamp-1">{(demand as any).paymentMethod || '待谈'}</span>
                      </div>
                    </td>
                  )}

                  {showBudget && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-black text-indigo-600">
                        <TrendingUp className="w-4 h-4 opacity-40" />
                        {demand.demandType === 'PROJECT' ? (demand as any).servicePrice || '-' : demand.budget || '-'}
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(demand)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="查看/编辑详情"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredDemands.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-24 text-center text-slate-400 italic font-medium">
                    暂无符合条件的记录
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
              共 <span className="text-indigo-600">{filteredDemands.length}</span> 条
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

      {/* Complex Demand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                  {activeSubTab === 'RENTAL' ? <Cpu className="w-6 h-6" /> : activeSubTab === 'PURCHASE' ? <ShoppingBag className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingDemand ? '更新需求档案' : '录入业务需求'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Category: {activeSubTab} DEMAND</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 bg-white space-y-12 custom-scrollbar">
              {/* 错误显示区域 */}
              {submissionError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-rose-700">{submissionError}</p>
                </div>
              )}

              {/* Section 1: Core Business Identity */}
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <LayoutGrid className="w-4 h-4" /> 1. 核心商机标识 (Core Identity)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">需求标题 / 项目简称 *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="例：某自动驾驶公司 H100 8机季度租赁"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">关联客户 *</label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none cursor-pointer"
                      value={formData.customerId || ''}
                      onChange={e => setFormData({...formData, customerId: Number(e.target.value)})}
                    >
                      <option value="">-- 请选择客户 --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">商机分类</label>
                    <select 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {DEMAND_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">响应优先级</label>
                    <select 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="高">高 (P0 - 立即处理)</option>
                      <option value="中">中 (P1 - 常规处理)</option>
                      <option value="低">低 (P2 - 长期跟进)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">处理进度状态</label>
                    <select 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as DemandStatus})}
                    >
                      {Object.values(DemandStatus).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Section 2: Technical Specification */}
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <Zap className="w-4 h-4" /> 2. 算力规格与硬件配置 (Specs)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeSubTab !== 'PROJECT' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase">GPU 机型选择</label>
                        <select 
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          value={formData.gpuModelId || ''}
                          onChange={e => setFormData({...formData, gpuModelId: Number(e.target.value)})}
                        >
                          <option value="">未指定型号</option>
                          {gpuModels.map(m => <option key={m.id} value={m.id}>{m.brand}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase">需求台数 (Server Count)</label>
                        <input 
                          type="number" 
                          min="1"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          value={formData.serverCount}
                          onChange={e => setFormData({...formData, serverCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-1.5 flex items-end pb-3">
                         <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={formData.includeNetworking}
                              onChange={e => setFormData({...formData, includeNetworking: e.target.checked})}
                            />
                            <span className="text-xs font-black text-slate-700 uppercase">含 IB/ROCE 组网</span>
                         </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase">正式项目名称</label>
                        <input 
                          type="text" 
                          placeholder="项目全称"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          value={formData.projectName}
                          onChange={e => setFormData({...formData, projectName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase">算力总量需求 (P数/台数)</label>
                        <input 
                          type="number" 
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          value={formData.serverCount}
                          onChange={e => setFormData({...formData, serverCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase">项目周期 (天/月)</label>
                        <input 
                          type="text" 
                          placeholder="例：90天"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                          value={formData.projectDuration}
                          onChange={e => setFormData({...formData, projectDuration: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1">
                       <Database className="w-3 h-3" /> 计算与存储需求
                    </label>
                    <textarea 
                      placeholder="描述具体的 CPU、存储空间大小、IOPS 要求..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[100px] outline-none font-medium"
                      value={formData.computingRequirement || formData.storageRequirement}
                      onChange={e => setFormData({...formData, computingRequirement: e.target.value, storageRequirement: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1">
                       <ShieldCheck className="w-3 h-3" /> 技术与安全要求 (Technical Requirement)
                    </label>
                    <textarea 
                      placeholder="详细描述项目所需的技术规范、合规要求、安全标准等..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[100px] outline-none font-medium"
                      value={formData.technicalRequirement}
                      onChange={e => setFormData({...formData, technicalRequirement: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Timeline & Commercials */}
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <CreditCard className="w-4 h-4" /> 3. 商务交付与预算周期 (Commercials)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">
                      {activeSubTab === 'PURCHASE' ? '预计购买日期 *' : '预计交付日期 *'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input 
                        required
                        type="date"
                        className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        value={activeSubTab === 'PURCHASE' ? formData.purchaseDate : formData.deliveryDate}
                        onChange={e => {
                          if (activeSubTab === 'PURCHASE') setFormData({...formData, purchaseDate: e.target.value});
                          else setFormData({...formData, deliveryDate: e.target.value});
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">预算金额 (¥)</label>
                    <input 
                      type="text" 
                      placeholder="如：650000.00"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600"
                      value={activeSubTab === 'PROJECT' ? formData.servicePrice : formData.budget}
                      onChange={e => activeSubTab === 'PROJECT' ? setFormData({...formData, servicePrice: e.target.value}) : setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700 uppercase">成本评估 (¥)</label>
                      {referencePriceRange && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 animate-in fade-in duration-300">
                          <span className="flex items-center gap-1"><Info className="w-3 h-3" />参考: {referencePriceRange}</span>
                        </span>
                      )}
                    </div>
                    <input 
                      type="text" 
                      placeholder="参考成本"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={formData.cost}
                      onChange={e => setFormData({...formData, cost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">支付/账期要求</label>
                    <input 
                      type="text" 
                      placeholder="例：季付、预付30%等"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">机房/地域来源</label>
                    <input 
                      type="text" 
                      placeholder="例：北京/中卫/客户自有"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      value={formData.source}
                      onChange={e => setFormData({...formData, source: e.target.value})}
                    />
                  </div>
                  {activeSubTab === 'RENTAL' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">租赁周期</label>
                      <input 
                        type="text" 
                        placeholder="例：3个月"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                        value={formData.rentalPeriod}
                        onChange={e => setFormData({...formData, rentalPeriod: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Section 4: Project Scope & Description */}
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <FileText className="w-4 h-4" /> 4. 描述与备注 (Detailed Info)
                </h4>
                <div className="space-y-6">
                  {activeSubTab === 'PROJECT' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">项目范围 (Project Scope)</label>
                      <textarea 
                        placeholder="清晰定义项目的起止边界、包含的具体任务、阶段性产出物等..."
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px] outline-none font-medium"
                        value={formData.projectScope}
                        onChange={e => setFormData({...formData, projectScope: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">综合描述与补充备注</label>
                    <textarea 
                      placeholder="在此录入不属于上述分类的补充信息、背景资料或特别注意事项..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px] outline-none font-medium"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </section>
            </form>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                取消返回
              </button>
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingDemand ? '更新并同步记录' : '完成录入并同步'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demands;
