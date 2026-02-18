
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
  Download,
  Loader2
} from 'lucide-react';
import { INDUSTRIES } from '../constants';
import { Company, RoleType, User } from '../types';
import { useAuth } from '../App';
import { api } from '../api';

const Companies: React.FC = () => {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [companyList, userList] = await Promise.all([
        api.companies.list(),
        api.users.list()
      ]);
      setCompanies(companyList);
      setUsers(userList);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCompany) {
        await api.companies.update(editingCompany.id, formData);
      } else {
        await api.companies.add({
          ...formData,
          creatorId: currentUser?.id,
          teamId: currentUser?.teamId
        } as any);
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save company failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (companyToDelete) {
      setIsLoading(true);
      try {
        await api.companies.delete(companyToDelete.id);
        setIsDeleteModalOpen(false);
        setCompanyToDelete(null);
        await loadData();
      } catch (err) {
        console.error('Delete company failed:', err);
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索公司名称..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAddClick} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">
          <Plus className="w-5 h-5 inline mr-2" />
          录入公司
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all group flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <Building2 className="w-10 h-10 text-indigo-600 p-2 bg-indigo-50 rounded-xl" />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditClick(company)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteClick(company)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{company.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">{company.industry}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{company.years}年</span>
            </div>
            <div className="flex-1 space-y-3 mb-6">
               <p className="text-sm text-slate-600 line-clamp-2 italic">"{company.mainBusiness}"</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
               <span>创建人: {getCreatorName(company.creatorId)}</span>
               <a href={`https://www.tianyancha.com/search?key=${encodeURIComponent(company.name)}`} target="_blank" className="text-indigo-600 font-bold flex items-center gap-1">天眼查 <ExternalLink className="w-3 h-3" /></a>
            </div>
          </div>
        ))}
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 overflow-y-auto max-h-[90vh]">
             <h3 className="text-xl font-bold mb-6">{editingCompany ? '编辑企业' : '录入企业'}</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="text-sm font-bold block mb-1">公司全称 *</label>
                   <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-sm font-bold block mb-1">所属行业 *</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                         {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-sm font-bold block mb-1">成立年限 *</label>
                      <input required type="number" className="w-full px-4 py-2 border rounded-lg" value={formData.years} onChange={e => setFormData({...formData, years: parseInt(e.target.value)})} />
                   </div>
                </div>
                <div>
                   <label className="text-sm font-bold block mb-1">业务描述</label>
                   <textarea className="w-full px-4 py-2 border rounded-lg" value={formData.mainBusiness} onChange={e => setFormData({...formData, mainBusiness: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                   <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2">取消</button>
                   <button type="submit" className="px-10 py-2 bg-indigo-600 text-white rounded-lg font-bold">保存</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60">
           <div className="bg-white p-8 rounded-2xl max-w-sm text-center">
              <h3 className="text-xl font-bold mb-4">确认删除？</h3>
              <p className="text-slate-500 mb-8">删除后公司数据将不再可见。</p>
              <div className="flex flex-col gap-2">
                 <button onClick={confirmDelete} className="py-2 bg-rose-600 text-white rounded-lg font-bold">删除</button>
                 <button onClick={() => setIsDeleteModalOpen(false)} className="py-2 bg-slate-100 rounded-lg">取消</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
