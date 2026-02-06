
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Server, 
  Cpu, 
  Edit2, 
  Trash2, 
  X, 
  Activity, 
  Database,
  Zap,
  AlertTriangle,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  CreditCard,
  Banknote,
  Minus
} from 'lucide-react';
import { MOCK_GPU_MODELS, MOCK_USERS } from '../constants';
import { GpuModel, RoleType } from '../types';
import { useAuth } from '../App';

const GpuModels: React.FC = () => {
  const { currentUser } = useAuth();
  const [models, setModels] = useState<GpuModel[]>(MOCK_GPU_MODELS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<GpuModel | null>(null);
  const [modelToDelete, setModelToDelete] = useState<GpuModel | null>(null);

  const canEdit = [RoleType.ADMIN, RoleType.SALES_DIRECTOR, RoleType.SALES_MANAGER].includes(currentUser?.role!);

  // Form state adjusted for ranges
  const initialFormState = {
    name: '',
    manufacturer: 'NVIDIA',
    vram: '',
    serverType: '8卡',
    tflops: '',
    rentalMin: '',
    rentalMax: '',
    saleMin: '',
    saleMax: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'SHORTAGE' | 'UNAVAILABLE'
  };
  const [formData, setFormData] = useState(initialFormState);

  const filteredModels = useMemo(() => {
    return models.filter(m => 
      !m.deleteFlag && 
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [models, searchTerm]);

  // Helper to extract numeric/text values from formatted string (e.g., "¥65,000-¥75,000/月")
  const parsePriceRange = (priceStr?: string) => {
    if (!priceStr) return { min: '', max: '' };
    // Simple logic: split by '-' and remove non-digit/dot/comma chars loosely, 
    // but better to just split by standard delimiters if format is consistent.
    // Assuming format "¥Min-¥Max..."
    const cleanStr = priceStr.replace(/[¥,]/g, '').replace(/\/.*$/, ''); // Remove ¥, commas, and unit suffix
    const parts = cleanStr.split('-');
    if (parts.length === 2) {
      return { min: parts[0].trim(), max: parts[1].trim() };
    }
    // If single value
    return { min: cleanStr.trim(), max: '' };
  };

  const handleAddClick = () => {
    setEditingModel(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (model: GpuModel) => {
    setEditingModel(model);
    const rental = parsePriceRange(model.rentalPrice);
    const sale = parsePriceRange(model.salePrice);
    
    setFormData({
      name: model.name,
      manufacturer: model.manufacturer,
      vram: model.vram,
      serverType: model.serverType,
      tflops: model.tflops || '',
      rentalMin: rental.min,
      rentalMax: rental.max,
      saleMin: sale.min,
      saleMax: sale.max,
      status: model.status
    });
    setIsModalOpen(true);
  };

  const formatPrice = (min: string, max: string, unit: string) => {
    if (!min && !max) return '';
    const prefix = '¥';
    if (min && max && min !== max) {
      return `${prefix}${min}-${prefix}${max}${unit}`;
    }
    return `${prefix}${min || max}${unit}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rentalPrice = formatPrice(formData.rentalMin, formData.rentalMax, '/月');
    const salePrice = formatPrice(formData.saleMin, formData.saleMax, ''); // Sale price usually doesn't have a suffix like /month in db, but display might vary. MOCK uses '万' sometimes manually typed. 
    // To handle manual units like '万', we rely on user inputting '280万' or just '280'. 
    // Let's assume user inputs raw numbers or text with units. The helper just joins them.
    
    // Better strategy: The user inputs "65,000", we format. 
    // BUT given the prototype nature, let's trust user input but add separators.
    
    const finalData = {
      name: formData.name,
      manufacturer: formData.manufacturer,
      vram: formData.vram,
      serverType: formData.serverType,
      tflops: formData.tflops,
      rentalPrice: rentalPrice,
      salePrice: salePrice,
      status: formData.status
    };

    if (editingModel) {
      setModels(models.map(m => m.id === editingModel.id ? {
        ...m,
        ...finalData
      } : m));
    } else {
      const newModel: GpuModel = {
        id: `GPU${Date.now()}`,
        ...finalData,
        creatorId: currentUser?.id || 'U1',
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        deleteFlag: false
      };
      setModels([newModel, ...models]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (modelToDelete) {
      setModels(models.map(m => m.id === modelToDelete.id ? { ...m, deleteFlag: true } : m));
      setIsDeleteModalOpen(false);
      setModelToDelete(null);
    }
  };

  const getStatusInfo = (status: GpuModel['status']) => {
    switch (status) {
      case 'AVAILABLE': return { label: '供货充沛', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'SHORTAGE': return { label: '供货偏紧', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
      case 'UNAVAILABLE': return { label: '目前缺货', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索型号、厂商..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canEdit && (
          <button 
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            新增GPU型号
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => {
          const status = getStatusInfo(model.status);
          return (
            <div key={model.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white border border-slate-800">
                  <Cpu className="w-6 h-6" />
                </div>
                {canEdit && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(model)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setModelToDelete(model); setIsDeleteModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1">{model.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{model.manufacturer}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
                    <Database className="w-3 h-3" /> 显存
                  </p>
                  <p className="text-sm font-bold text-slate-700">{model.vram}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> 规格
                  </p>
                  <p className="text-sm font-bold text-slate-700">{model.serverType}</p>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 性能指标
                  </p>
                  <p className="text-sm font-bold text-slate-700">{model.tflops || '未标注'}</p>
                </div>
              </div>

              {/* 价格信息区域 */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">租赁参考</span>
                   </div>
                   <span className="text-sm font-black text-indigo-700">{model.rentalPrice || '--'}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Banknote className="w-3.5 h-3.5 text-slate-500" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">售卖参考</span>
                   </div>
                   <span className="text-sm font-black text-slate-700">{model.salePrice || '--'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${status.color}`}>
                  <status.icon className="w-3 h-3" />
                  {status.label}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{model.createTime.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}

        {filteredModels.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-300">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium italic">未查询到 GPU 配置数据</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300 max-h-[95vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{editingModel ? '编辑配置参数' : '登记新显卡型号'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
              {/* 参数信息分组 */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="w-8 h-[2px] bg-slate-200"></span> 硬件参数
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-black text-slate-700 uppercase">型号名称 <span className="text-rose-500">*</span></label>
                    <input required type="text" placeholder="如: NVIDIA H100" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">厂商 <span className="text-rose-500">*</span></label>
                    <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold appearance-none cursor-pointer" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})}>
                      <option>NVIDIA</option>
                      <option>AMD</option>
                      <option>Intel</option>
                      <option>寒武纪</option>
                      <option>壁仞科技</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">显存容量 <span className="text-rose-500">*</span></label>
                    <input required type="text" placeholder="如: 80GB HBM3" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold" value={formData.vram} onChange={e => setFormData({...formData, vram: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">服务器规格</label>
                    <input type="text" placeholder="如: 8卡 SXM5" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold" value={formData.serverType} onChange={e => setFormData({...formData, serverType: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">算力指标</label>
                    <input type="text" placeholder="如: 67 TFLOPS" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold" value={formData.tflops} onChange={e => setFormData({...formData, tflops: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 价格信息分组 - 升级为区间 */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="w-8 h-[2px] bg-slate-200"></span> 价格策略 (区间参考价)
                </h4>
                
                {/* 租赁价格区间 */}
                <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-50 space-y-4">
                  <label className="text-xs font-black text-indigo-700 uppercase flex items-center gap-2">
                     <CreditCard className="w-3 h-3" /> 裸金属租赁价格 (月)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 text-xs font-bold">¥</span>
                      <input 
                        type="text" 
                        placeholder="最低价" 
                        className="w-full pl-6 pr-3 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-indigo-700 placeholder:text-indigo-200 text-sm" 
                        value={formData.rentalMin} 
                        onChange={e => setFormData({...formData, rentalMin: e.target.value})} 
                      />
                    </div>
                    <Minus className="w-4 h-4 text-indigo-200" />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 text-xs font-bold">¥</span>
                      <input 
                        type="text" 
                        placeholder="最高价" 
                        className="w-full pl-6 pr-3 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none font-bold text-indigo-700 placeholder:text-indigo-200 text-sm" 
                        value={formData.rentalMax} 
                        onChange={e => setFormData({...formData, rentalMax: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* 售卖价格区间 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                     <Banknote className="w-3 h-3" /> 售卖价格 (台)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">¥</span>
                      <input 
                        type="text" 
                        placeholder="最低价" 
                        className="w-full pl-6 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm" 
                        value={formData.saleMin} 
                        onChange={e => setFormData({...formData, saleMin: e.target.value})} 
                      />
                    </div>
                    <Minus className="w-4 h-4 text-slate-300" />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">¥</span>
                      <input 
                        type="text" 
                        placeholder="最高价" 
                        className="w-full pl-6 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm" 
                        value={formData.saleMax} 
                        onChange={e => setFormData({...formData, saleMax: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* 状态分组 */}
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span className="w-8 h-[2px] bg-slate-200"></span> 供货状态
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['AVAILABLE', 'SHORTAGE', 'UNAVAILABLE'] as const).map(s => {
                    const info = getStatusInfo(s);
                    return (
                      <button key={s} type="button" onClick={() => setFormData({...formData, status: s})} className={`px-3 py-3 text-[10px] font-black rounded-xl border transition-all ${formData.status === s ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-widest">取消</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">确认删除配置？</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4">
                你正在尝试删除 GPU 型号 <span className="font-black text-slate-900 underline">{modelToDelete?.name}</span>。<br/>
                如果该型号已被需求关联，删除可能会影响历史统计数据的完整性。
              </p>
              <div className="space-y-3">
                <button onClick={confirmDelete} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 uppercase tracking-widest">确认永久删除</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors uppercase tracking-widest">暂不删除</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GpuModels;
