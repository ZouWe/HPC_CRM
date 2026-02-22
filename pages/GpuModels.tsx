
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Cpu, 
  Edit2, 
  Trash2, 
  X, 
  Activity, 
  Database,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Loader2,
  HardDrive,
  Network,
  Microchip,
  BatteryCharging,
  DollarSign,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GpuModel, RoleType } from '../types';
import { useAuth } from '../App';
import { api } from '../api';

const PAGE_SIZE = 10;

const GpuModels: React.FC = () => {
  const { currentUser } = useAuth();
  const [models, setModels] = useState<GpuModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<GpuModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<GpuModel | null>(null);

  const canEdit = [RoleType.ADMIN, RoleType.SALES_DIRECTOR, RoleType.SALES_MANAGER].includes(currentUser?.role!);

  const initialFormState = {
    brand: '',
    memory: 80,
    cpu: '',
    ram: 512,
    ibCard: '',
    nvmeSsd: '',
    networkAdapter: '',
    powerSupply: '',
    rentalPriceMin: 0,
    rentalPriceMax: 0,
    salePriceMin: 0,
    salePriceMax: 0,
    status: 'AVAILABLE' as 'AVAILABLE' | 'SHORTAGE' | 'UNAVAILABLE'
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.gpuModels.list();
      setModels(data);
    } catch (err) {
      console.error('Load GPU models failed:', err);
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

  const filteredModels = useMemo(() => {
    return models.filter(m => 
      !m.isDeleted && 
      (m.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
       m.cpu.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [models, searchTerm]);

  const totalPages = Math.ceil(filteredModels.length / PAGE_SIZE);
  const paginatedModels = filteredModels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleEditClick = (model: GpuModel) => {
    setEditingModel(model);
    setFormData({
      brand: model.brand,
      memory: model.memory,
      cpu: model.cpu,
      ram: model.ram,
      ibCard: model.ibCard,
      nvmeSsd: model.nvmeSsd,
      networkAdapter: model.networkAdapter,
      powerSupply: model.powerSupply,
      rentalPriceMin: model.rentalPriceMin,
      rentalPriceMax: model.rentalPriceMax,
      salePriceMin: model.salePriceMin,
      salePriceMax: model.salePriceMax,
      status: model.status || 'AVAILABLE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingModel) {
        await api.gpuModels.update(editingModel.id, formData);
      } else {
        await api.gpuModels.add(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save GPU model failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (modelToDelete) {
      setIsLoading(true);
      try {
        await api.gpuModels.delete(modelToDelete.id);
        setIsDeleteModalOpen(false);
        setModelToDelete(null);
        await loadData();
      } catch (err) {
        console.error('Delete GPU model failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索品牌型号、处理器..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditingModel(null); setFormData(initialFormState); setIsModalOpen(true); }} 
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />录入算力机型
          </button>
        )}
      </div>

      <div className="relative min-h-[400px] flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
          {paginatedModels.map((model) => (
            <div key={model.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all group flex flex-col overflow-hidden h-fit">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">{model.brand}</h3>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">GPU Memory: {model.memory}GB HBM</p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(model)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { setModelToDelete(model); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-1">
                      <Microchip className="w-3 h-3" /> CPU
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate" title={model.cpu}>{model.cpu}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-1">
                      <Database className="w-3 h-3" /> RAM
                    </div>
                    <p className="text-xs font-bold text-slate-700">{model.ram}GB</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-1">
                      <Network className="w-3 h-3" /> IB
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate" title={model.ibCard}>{model.ibCard}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-1">
                      <HardDrive className="w-3 h-3" /> 存储
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate" title={model.nvmeSsd}>{model.nvmeSsd}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 租赁 (月)
                    </p>
                    <p className="text-sm font-black text-indigo-600">
                      ¥{model.rentalPriceMin.toLocaleString()} - ¥{model.rentalPriceMax.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> 售卖
                    </p>
                    <p className="text-sm font-black text-emerald-600">
                      ¥{model.salePriceMin.toLocaleString()} - ¥{model.salePriceMax.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                     <BatteryCharging className="w-3.5 h-3.5 text-slate-400" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{model.powerSupply}</span>
                   </div>
                   <div className="w-px h-3 bg-slate-200" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase">{model.networkAdapter}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-tighter ${
                  model.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {model.status === 'AVAILABLE' ? '现货充沛' : '货源偏紧'}
                </span>
              </div>
            </div>
          ))}
          {filteredModels.length === 0 && !isLoading && (
            <div className="col-span-full py-24 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 italic">
              暂无匹配的算力机型规格
            </div>
          )}
        </div>

        {/* 分页控制 UI */}
        {totalPages > 1 && (
          <div className="mt-8 px-6 py-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <p className="text-xs font-bold text-slate-500">
              显示第 <span className="text-indigo-600">{(currentPage - 1) * PAGE_SIZE + 1}</span> 至 <span className="text-indigo-600">{Math.min(currentPage * PAGE_SIZE, filteredModels.length)}</span> 条，共 <span className="text-indigo-600">{filteredModels.length}</span> 条
            </p>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
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
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 增强型 GPU 编辑 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{editingModel ? '编辑规格' : '录入新机型'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 <section className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> 基础硬件参数
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">品牌型号 *</label>
                        <input required type="text" placeholder="如 NVIDIA H100" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">显存 (GB) *</label>
                        <input required type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.memory} onChange={e => setFormData({...formData, memory: parseInt(e.target.value)})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">处理器 (CPU) *</label>
                        <input required type="text" placeholder="Intel Xeon / AMD EPYC..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.cpu} onChange={e => setFormData({...formData, cpu: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">系统内存 (GB) *</label>
                        <input required type="number" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.ram} onChange={e => setFormData({...formData, ram: parseInt(e.target.value)})} />
                      </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> 存储与组网
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">IB 组网卡</label>
                        <input type="text" placeholder="如 Mellanox NDR" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.ibCard} onChange={e => setFormData({...formData, ibCard: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase">NVMe 存储</label>
                        <input type="text" placeholder="如 3.84TB SSD" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.nvmeSsd} onChange={e => setFormData({...formData, nvmeSsd: e.target.value})} />
                      </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> 价格策略配置
                    </h4>
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-6">
                       <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-black text-indigo-600">
                           <Clock className="w-3.5 h-3.5" /> 租赁价格区间 (月)
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">起租单价 (¥)</label>
                              <input required type="number" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500" value={formData.rentalPriceMin} onChange={e => setFormData({...formData, rentalPriceMin: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">顶租单价 (¥)</label>
                              <input required type="number" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500" value={formData.rentalPriceMax} onChange={e => setFormData({...formData, rentalPriceMax: parseFloat(e.target.value)})} />
                            </div>
                         </div>
                       </div>

                       <div className="space-y-3">
                         <div className="flex items-center gap-2 text-xs font-black text-emerald-600">
                           <DollarSign className="w-3.5 h-3.5" /> 设备售卖价格区间
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">售卖起价 (¥)</label>
                              <input required type="number" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500" value={formData.salePriceMin} onChange={e => setFormData({...formData, salePriceMin: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">售卖顶价 (¥)</label>
                              <input required type="number" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500" value={formData.salePriceMax} onChange={e => setFormData({...formData, salePriceMax: parseFloat(e.target.value)})} />
                            </div>
                         </div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                       <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> 其他配置
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase">库存状态</label>
                          <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold appearance-none bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                            <option value="AVAILABLE">现货 (现货充沛)</option>
                            <option value="SHORTAGE">紧缺 (货源偏紧)</option>
                            <option value="UNAVAILABLE">下架 (暂时缺货)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-500 uppercase">电源冗余</label>
                          <input type="text" placeholder="如 3000W 1+1" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl font-bold" value={formData.powerSupply} onChange={e => setFormData({...formData, powerSupply: e.target.value})} />
                        </div>
                    </div>
                 </section>
              </form>

              <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">取消</button>
                 <button onClick={handleSubmit} className="px-12 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '确认保存'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-3xl max-w-sm text-center shadow-2xl animate-in zoom-in-95">
              <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">确认删除？</h3>
              <p className="text-slate-500 text-sm mb-8">删除此 GPU 配置可能会影响已关联的需求单，此操作不可逆。</p>
              <div className="flex flex-col gap-2">
                 <button onClick={confirmDelete} className="py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 active:scale-95 transition-all">立即删除</button>
                 <button onClick={() => setIsDeleteModalOpen(false)} className="py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-all">取消</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GpuModels;
