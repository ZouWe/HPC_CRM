
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

  const getCreatorName = (id: string) => users.find(u => String(u.id) === id)?.realName || '未知用户';
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || '未知客户';
  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || '未知公司';
  const getGpuModelName = (id: string) => gpuModels.find(g => String(g.id) === id)?.brand || id;

  const handleOpenModal = (demand: AnyDemand | null) => {
    if (demand && demand.demandType === 'RENTAL') {
      setRentalFormData(demand as RentalDemand);
    } else {
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
        </div>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          新增{activeSubTab === 'RENTAL' ? '租赁' : activeSubTab === 'PURCHASE' ? '采购' : '项目'}需求
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
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">主体信息</th>
                {activeSubTab !== 'PROJECT' ? (
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">GPU/数量</th>
                ) : (
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">P数/性质</th>
                )}
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-tighter">
                  {activeSubTab === 'RENTAL' ? '租期/财务' : activeSubTab === 'PURCHASE' ? '预算' : '交付机房'}
                </th>
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
                    </td>
                  )}
                  
                  <td className="px-6 py-4 text-sm font-bold">
                     {activeSubTab === 'RENTAL' ? (
                       <div className="space-y-0.5">
                         <p className="text-slate-900">{(demand as RentalDemand).duration}</p>
                         <p className="text-xs text-indigo-600 font-bold">预算: {(demand as RentalDemand).budgetPerMonth}</p>
                       </div>
                     ) : (
                       (demand as any).budgetTotal || (demand as any).dataCenter
                     )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(demand)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && activeSubTab === 'RENTAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">需求详情</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 bg-white space-y-12 custom-scrollbar">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 核心参数
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">GPU 型号</label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                      value={rentalFormData.gpuModelId}
                      onChange={e => setRentalFormData({...rentalFormData, gpuModelId: e.target.value})}
                    >
                      <option value="">选择型号</option>
                      {gpuModels.map(m => <option key={m.id} value={m.id}>{m.brand} ({m.memory}GB)</option>)}
                    </select>
                  </div>
                </div>
              </section>
            </form>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-sm font-black text-slate-500">取消</button>
              <button type="submit" className="px-12 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl">确认保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demands;
