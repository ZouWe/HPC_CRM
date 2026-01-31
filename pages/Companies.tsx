
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Building2, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  X, 
  Briefcase, 
  Globe, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Download
} from 'lucide-react';
import { MOCK_COMPANIES, INDUSTRIES, MOCK_USERS } from '../constants';
import { Company, RoleType } from '../types';
import { useAuth } from '../App';

const Companies: React.FC = () => {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Selection state
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    industry: INDUSTRIES[0],
    years: 1,
    capital: '',
    mainBusiness: '',
    screenshotUrl: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // ESC Key listener for lightbox
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Filter & Access Control Logic
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (c.deleteFlag) return false;

      let hasAccess = false;
      if (currentUser?.role === RoleType.ADMIN || currentUser?.role === RoleType.SALES_DIRECTOR) {
        hasAccess = true;
      } else if (currentUser?.role === RoleType.SALES_MANAGER) {
        hasAccess = c.teamId === currentUser.teamId;
      } else {
        hasAccess = c.creatorId === currentUser?.id;
      }

      if (!hasAccess) return false;

      return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [companies, searchTerm, currentUser]);

  const handleAddClick = () => {
    setEditingCompany(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      years: company.years,
      capital: company.capital,
      mainBusiness: company.mainBusiness,
      screenshotUrl: company.screenshotUrl || ''
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, screenshotUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setFormData({ ...formData, screenshotUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      setCompanies(companies.map(c => c.id === editingCompany.id ? {
        ...c,
        name: formData.name,
        industry: formData.industry,
        years: formData.years,
        capital: formData.capital,
        mainBusiness: formData.mainBusiness,
        screenshotUrl: formData.screenshotUrl
      } : c));
    } else {
      const newCompany: Company = {
        id: `COM${Date.now()}`,
        name: formData.name,
        industry: formData.industry,
        years: formData.years,
        capital: formData.capital,
        mainBusiness: formData.mainBusiness,
        screenshotUrl: formData.screenshotUrl,
        creatorId: currentUser?.id || 'U1',
        teamId: currentUser?.teamId || 'T1',
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        deleteFlag: false
      };
      setCompanies([newCompany, ...companies]);
    }

    setIsFormModalOpen(false);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      setCompanies(companies.map(c => c.id === companyToDelete.id ? { ...c, deleteFlag: true } : c));
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
    }
  };

  const getCreatorName = (creatorId: string) => {
    return MOCK_USERS.find(u => u.id === creatorId)?.realName || '未知用户';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索公司名称、行业..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 w-full md:w-auto justify-center active:scale-95"
        >
          <Plus className="w-5 h-5" />
          录入公司
        </button>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <button 
                  onClick={() => handleEditClick(company)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="编辑公司"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(company)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="移除公司"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
              {company.name}
            </h3>
            
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-widest">
                <Globe className="w-3 h-3" /> {company.industry}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> {company.years}年
              </span>
            </div>

            <div className="space-y-4 mb-6 flex-1">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> 注册资本
                </p>
                <p className="text-sm font-bold text-slate-700">{company.capital}</p>
              </div>
              {company.screenshotUrl && (
                <div className="relative group/img">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> 天眼查附件
                  </p>
                  <div 
                    onClick={() => setPreviewImage(company.screenshotUrl!)}
                    className="w-full h-32 rounded-xl overflow-hidden border border-slate-100 relative shadow-inner bg-slate-50 cursor-zoom-in"
                  >
                    <img 
                      src={company.screenshotUrl} 
                      alt="Tianyan Check Screenshot" 
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                       <div className="p-2 bg-white rounded-full text-indigo-600 shadow-xl scale-90 group-hover/img:scale-100 transition-transform">
                          <Maximize2 className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> 主要业务
                </p>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
                  "{company.mainBusiness}"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                  {getCreatorName(company.creatorId)[0]}
                </div>
                <span className="text-xs font-semibold text-slate-500">{getCreatorName(company.creatorId)}</span>
              </div>
              <a 
                href={`https://www.tianyancha.com/search?key=${encodeURIComponent(company.name)}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
              >
                天眼查 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}

        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-300">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium italic">暂无匹配的公司数据</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal (Lightbox) */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12 transition-all duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            {/* Actions */}
            <div className="absolute top-0 right-0 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
               <a 
                 href={previewImage} 
                 download="attachment.png" 
                 className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur transition-colors"
                 title="下载附件"
               >
                 <Download className="w-5 h-5" />
               </a>
               <button 
                 onClick={() => setPreviewImage(null)}
                 className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur transition-colors"
                 title="关闭预览 (ESC)"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            {/* Main Image */}
            <div className="w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <img 
                src={previewImage} 
                alt="Full Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300 transform scale-100 select-none"
                style={{ filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))' }}
              />
            </div>
            
            {/* Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-full pointer-events-none backdrop-blur">
              点击背景或按 ESC 关闭
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingCompany ? '编辑企业资料' : '录入新企业'}</h3>
                  <p className="text-xs text-slate-500">完善公司信息并上传天眼查快照</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-black text-slate-700 uppercase">公司全称 <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="请输入工商登记名称"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black text-slate-700 uppercase">所属行业 <span className="text-rose-500">*</span></label>
                  <select 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-medium"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black text-slate-700 uppercase">成立年限 (年) <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.years}
                    onChange={e => setFormData({...formData, years: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black text-slate-700 uppercase">注册资本 <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    placeholder="如: 500万 / 10亿"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.capital}
                    onChange={e => setFormData({...formData, capital: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-black text-slate-700 uppercase">天眼查截图附件</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-32 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer group/upload overflow-hidden ${
                      formData.screenshotUrl 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    {formData.screenshotUrl ? (
                      <>
                        <img src={formData.screenshotUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-upload:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button 
                             type="button"
                             onClick={(e) => { e.stopPropagation(); removeAttachment(); }}
                             className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-xl"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                           <button 
                             type="button"
                             className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-xl"
                           >
                             <Edit2 className="w-4 h-4" />
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover/upload:text-indigo-500 transition-colors" />
                        <p className="text-xs font-bold text-slate-400 group-hover/upload:text-indigo-600 uppercase">点击或拖拽上传</p>
                        <p className="text-[10px] text-slate-300 mt-1">支持 PNG, JPG 格式图片</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-black text-slate-700 uppercase">主要业务说明</label>
                  <textarea 
                    rows={3}
                    placeholder="请描述公司的核心业务方向及技术栈..."
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                    value={formData.mainBusiness}
                    onChange={e => setFormData({...formData, mainBusiness: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-10 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-8 py-3 text-sm font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-widest"
                >
                  放弃更改
                </button>
                <button 
                  type="submit"
                  className="px-12 py-3 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 uppercase tracking-widest"
                >
                  {editingCompany ? '保存修改' : '确认录入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">确认移除企业？</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4">
                你正在尝试移除 <span className="font-black text-slate-900 underline decoration-rose-300">{companyToDelete?.name}</span>。<br/>
                此操作将使其从活跃企业库中消失。所有关联的未结需求将受此影响。
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95 uppercase tracking-widest"
                >
                  确认永久移除
                </button>
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setCompanyToDelete(null); }}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors uppercase tracking-widest"
                >
                  保留企业信息
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
