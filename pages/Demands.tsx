
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  LayoutGrid,
  ShoppingBag,
  Cpu,
  Database,
  X,
  Trash2,
  Edit2,
  AlertTriangle,
  History,
  Tags
} from 'lucide-react';
import { useAuth } from '../App';
import { RoleType, DemandStatus, AnyDemand, RentalDemand, PurchaseDemand, ProjectDemand } from '../types';
import { 
  MOCK_RENTAL_DEMANDS, 
  MOCK_PURCHASE_DEMANDS, 
  MOCK_PROJECT_DEMANDS, 
  MOCK_GPU_MODELS, 
  MOCK_CUSTOMERS, 
  MOCK_COMPANIES, 
  MOCK_USERS,
  DEMAND_CATEGORIES
} from '../constants';

type SubTab = 'RENTAL' | 'PURCHASE' | 'PROJECT';

const Demands: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('RENTAL');
  const [searchTerm, setSearchTerm] = useState('');

  // Demands state
  const [rentalDemands, setRentalDemands] = useState<RentalDemand[]>(MOCK_RENTAL_DEMANDS);
  const [purchaseDemands, setPurchaseDemands] = useState<PurchaseDemand[]>(MOCK_PURCHASE_DEMANDS);
  const [projectDemands, setProjectDemands] = useState<ProjectDemand[]>(MOCK_PROJECT_DEMANDS);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<AnyDemand | null>(null);
  const [demandToDelete, setDemandToDelete] = useState<AnyDemand | null>(null);

  // Visibility & Editability Rules
  const canSeeCategory = hasPermission('demand_categories');
  const canSeeStatus = hasPermission('demand_status');
  
  // Editable by Sales Managers, Sales Directors and Administrators
  const canEditCategory = currentUser?.role === RoleType.ADMIN || 
                          currentUser?.role === RoleType.SALES_DIRECTOR || 
                          currentUser?.role === RoleType.SALES_MANAGER;
                          
  const canEditStatus = currentUser?.role === RoleType.ADMIN || 
                        currentUser?.role === RoleType.SALES_DIRECTOR;

  // Filter Data Isolation Logic
  const filterIsolation = <T extends AnyDemand>(list: T[]) => {
    return list.filter(d => {
      if (d.deleteFlag) return false;
      let hasAccess = false;
      if (currentUser?.role === RoleType.ADMIN || currentUser?.role === RoleType.SALES_DIRECTOR) {
        hasAccess = true;
      } else if (currentUser?.role === RoleType.SALES_MANAGER) {
        hasAccess = d.teamId === currentUser.teamId;
      } else {
        hasAccess = d.creatorId === currentUser?.id;
      }
      return hasAccess;
    });
  };

  const filteredDemands = useMemo(() => {
    let list: AnyDemand[] = [];
    if (activeSubTab === 'RENTAL') list = filterIsolation(rentalDemands);
    else if (activeSubTab === 'PURCHASE') list = filterIsolation(purchaseDemands);
    else if (activeSubTab === 'PROJECT') list = filterIsolation(projectDemands);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(d => {
        const custName = MOCK_CUSTOMERS.find(c => c.id === d.customerId)?.name.toLowerCase() || '';
        const compName = MOCK_COMPANIES.find(c => c.id === d.companyId)?.name.toLowerCase() || '';
        return custName.includes(term) || compName.includes(term);
      });
    }
    return list;
  }, [activeSubTab, rentalDemands, purchaseDemands, projectDemands, searchTerm, currentUser]);

  const getStatusColor = (status: DemandStatus) => {
    switch (status) {
      case DemandStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case DemandStatus.EVALUATING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case DemandStatus.DEVELOPING: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case DemandStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCreatorName = (id: string) => MOCK_USERS.find(u => u.id === id)?.realName || '未知用户';
  const getCustomerName = (id: string) => MOCK_CUSTOMERS.find(c => c.id === id)?.name || '未知客户';
  const getCompanyName = (id: string) => MOCK_COMPANIES.find(c => c.id === id)?.name || '未知公司';
  const getGpuModelName = (id: string) => MOCK_GPU_MODELS.find(g => g.id === id)?.name || id;

  const handleDelete = (demand: AnyDemand) => {
    setDemandToDelete(demand);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!demandToDelete) return;
    const setter = demandToDelete.demandType === 'RENTAL' ? setRentalDemands :
                   demandToDelete.demandType === 'PURCHASE' ? setPurchaseDemands : setProjectDemands;
    
    setter((prev: any) => prev.map((d: any) => d.id === demandToDelete.id ? { ...d, deleteFlag: true } : d));
    setIsDeleteModalOpen(false);
    setDemandToDelete(null);
  };

  const handleEdit = (demand: AnyDemand) => {
    setEditingDemand(demand);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button 
          onClick={() => setActiveSubTab('RENTAL')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'RENTAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Cpu className="w-4 h-4" /> 租赁需求
        </button>
        <button 
          onClick={() => setActiveSubTab('PURCHASE')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'PURCHASE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShoppingBag className="w-4 h-4" /> 采购需求
        </button>
        <button 
          onClick={() => setActiveSubTab('PROJECT')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'PROJECT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Database className="w-4 h-4" /> 项目需求
        </button>
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
          onClick={() => { setEditingDemand(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          新增{activeSubTab === 'RENTAL' ? '租赁' : activeSubTab === 'PURCHASE' ? '采购' : '项目'}需求
        </button>
      </div>

      {/* Lists */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                  {activeSubTab === 'RENTAL' ? '租期/预算' : activeSubTab === 'PURCHASE' ? '预算' : '交付机房'}
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">交付时间</th>
                {canSeeCategory && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">类型</th>}
                {canSeeStatus && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">进度</th>}
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">创建人</th>
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

                  {activeSubTab === 'PURCHASE' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 uppercase tracking-wider">
                          {getGpuModelName((demand as PurchaseDemand).gpuModelId)}
                        </span>
                        <span className="text-sm font-black text-slate-900">x{(demand as PurchaseDemand).serverCount}</span>
                      </div>
                      <p className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${(demand as PurchaseDemand).isSpot ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {(demand as PurchaseDemand).isSpot ? '现货' : '期货'}
                      </p>
                    </td>
                  )}

                  {activeSubTab === 'PROJECT' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 uppercase tracking-wider">
                          {(demand as ProjectDemand).pNumber} P
                        </span>
                        <span className="text-sm font-black text-slate-900">{(demand as ProjectDemand).nature}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                        批文: {(demand as ProjectDemand).hasApproval ? '是' : '否'}
                      </p>
                    </td>
                  )}

                  <td className="px-6 py-4">
                    {activeSubTab === 'RENTAL' ? (
                      <>
                        <p className="text-sm text-slate-900 font-bold">{(demand as RentalDemand).duration}</p>
                        <p className="text-xs text-slate-500">{(demand as RentalDemand).budgetPerMonth}</p>
                      </>
                    ) : activeSubTab === 'PURCHASE' ? (
                      <p className="text-sm text-slate-900 font-bold">{(demand as PurchaseDemand).budgetTotal}</p>
                    ) : (
                      <p className="text-sm text-slate-900 font-bold">{(demand as ProjectDemand).dataCenter}</p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 font-medium">
                      {activeSubTab === 'PROJECT' ? (demand as ProjectDemand).deadline : (demand as RentalDemand | PurchaseDemand).deliveryTime}
                    </p>
                    {activeSubTab === 'RENTAL' && <p className="text-xs text-slate-400">{(demand as RentalDemand).region}</p>}
                  </td>

                  {canSeeCategory && (
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest border border-slate-200">
                        {demand.type}
                      </span>
                    </td>
                  )}

                  {canSeeStatus && (
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(demand.status)}`}>
                        {demand.status === DemandStatus.PENDING && <Clock className="w-3 h-3" />}
                        {demand.status === DemandStatus.EVALUATING && <AlertCircle className="w-3 h-3" />}
                        {demand.status === DemandStatus.COMPLETED && <CheckCircle2 className="w-3 h-3" />}
                        {demand.status}
                      </span>
                    </td>
                  )}

                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{getCreatorName(demand.creatorId)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{demand.createTime.split(' ')[0]}</p>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEdit(demand)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(demand)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDemands.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <LayoutGrid className="w-12 h-12 mb-4 opacity-10" />
                      <p className="text-sm font-bold italic">暂无匹配的需求数据</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">确认废弃此需求？</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4 italic">
                “该操作会将需求移至回收站，关联的算力资源预定可能会被取消。历史状态流将保留以备审计。”
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95 uppercase tracking-widest"
                >
                  确认废弃
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors uppercase tracking-widest"
                >
                  暂不处理
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generic Demand Modal (Demo for Add/Edit UI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                   {activeSubTab === 'RENTAL' ? <Cpu className="w-6 h-6" /> : activeSubTab === 'PURCHASE' ? <ShoppingBag className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingDemand ? '更新' : '登记'}{activeSubTab === 'RENTAL' ? '算力租赁' : activeSubTab === 'PURCHASE' ? '硬件采购' : '项目集'}需求
                  </h3>
                  <p className="text-xs text-slate-500">请确保核心算力参数及交付地域准确无误</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white space-y-10 custom-scrollbar">
              {/* Section 1: Basic Info */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="w-8 h-[2px] bg-slate-200"></span> 关联主体信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">所属客户 <span className="text-rose-500">*</span></label>
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-bold">
                      {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">签约公司 <span className="text-rose-500">*</span></label>
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-bold">
                      {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">交付地域 <span className="text-rose-500">*</span></label>
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-bold">
                      <option>北京机房</option>
                      <option>上海机房</option>
                      <option>宁夏机房</option>
                      <option>贵州机房</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Params (Dynamic based on SubTab) */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="w-8 h-[2px] bg-slate-200"></span> 核心需求参数
                </h4>
                
                {activeSubTab !== 'PROJECT' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1.5 lg:col-span-2">
                      <label className="text-xs font-black text-slate-700 uppercase">GPU服务器型号 <span className="text-rose-500">*</span></label>
                      <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-bold">
                        {MOCK_GPU_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.vram})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">需求台数 <span className="text-rose-500">*</span></label>
                      <input type="number" min="1" defaultValue="8" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">资源类型 <span className="text-rose-500">*</span></label>
                      <div className="flex gap-2">
                         <button type="button" className="flex-1 py-3 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black">裸金属</button>
                         <button type="button" className="flex-1 py-3 border-2 border-slate-200 text-slate-400 rounded-xl text-xs font-black">虚拟机</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">项目性质 <span className="text-rose-500">*</span></label>
                      <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-bold">
                        <option>政府项目</option>
                        <option>科研项目</option>
                        <option>企业专区</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">P 数要求 <span className="text-rose-500">*</span></label>
                      <input type="number" min="1" placeholder="如: 512" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase">是否有批文 <span className="text-rose-500">*</span></label>
                      <div className="flex gap-2">
                         <button type="button" className="flex-1 py-3 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black">是</button>
                         <button type="button" className="flex-1 py-3 border-2 border-slate-200 text-slate-400 rounded-xl text-xs font-black">否</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Cost & Timeline */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="w-8 h-[2px] bg-slate-200"></span> 交付及商务条款
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">
                      {activeSubTab === 'RENTAL' ? '预估租期' : '截止/交付时间'} <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" placeholder={activeSubTab === 'RENTAL' ? "如: 12个月" : "YYYY-MM-DD"} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">
                      {activeSubTab === 'RENTAL' ? '预算(台/月)' : '预算总额'} <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" placeholder="请输入金额或范围" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">付款方式 <span className="text-rose-500">*</span></label>
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer font-bold">
                      <option>预付全款</option>
                      <option>按月支付</option>
                      <option>按季支付</option>
                      <option>年底结算</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Classification & Status (Prompt Update) */}
              {canSeeCategory && (
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span className="w-8 h-[2px] bg-slate-200"></span> 分类及进度管理
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                        需求分类 <span className="text-rose-500">*</span>
                        {!canEditCategory && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-normal lowercase tracking-tight">只读</span>}
                      </label>
                      <div className="relative">
                        <Tags className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select 
                          disabled={!canEditCategory}
                          className={`w-full pl-11 pr-5 py-3 border rounded-xl outline-none transition-all appearance-none cursor-pointer font-bold ${
                            canEditCategory 
                              ? 'bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500' 
                              : 'bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed'
                          }`}
                          defaultValue={editingDemand?.type || DEMAND_CATEGORIES[0]}
                        >
                          {DEMAND_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    {canSeeStatus && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                          进度状态 <span className="text-rose-500">*</span>
                          {!canEditStatus && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-normal lowercase tracking-tight">只读</span>}
                        </label>
                        <select 
                          disabled={!canEditStatus}
                          className={`w-full px-5 py-3 border rounded-xl outline-none transition-all appearance-none cursor-pointer font-bold ${
                            canEditStatus 
                              ? 'bg-slate-50 border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500' 
                              : 'bg-slate-100 border-slate-100 text-slate-500 cursor-not-allowed'
                          }`}
                          defaultValue={editingDemand?.status || DemandStatus.PENDING}
                        >
                          {Object.values(DemandStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 text-sm font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-widest"
              >
                取消
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-12 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 uppercase tracking-widest"
              >
                {editingDemand ? '保存修改' : '确认录入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demands;
