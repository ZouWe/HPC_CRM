
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building,
  Info,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users2,
  X,
  User,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { Department, Team, User as UserType } from '../types';
import { api } from '../api';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDeptIds, setExpandedDeptIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected entities
  const [selectedDeptForTeam, setSelectedDeptForTeam] = useState<Department | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'DEPT' | 'TEAM', id: string } | null>(null);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [teamForm, setTeamForm] = useState({ name: '', leaderId: '' });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptList, teamList, userList] = await Promise.all([
        api.departments.list(),
        api.teams.list(),
        api.users.list()
      ]);
      setDepartments(deptList);
      setTeams(teamList);
      setUsers(userList);
    } catch (err) {
      console.error('Load data failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedDeptIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedDeptIds(newSet);
  };

  // Department Handlers
  const handleAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', description: '' });
    setIsDeptModalOpen(true);
  };

  const handleEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '' });
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingDept) {
        await api.departments.update(editingDept.id, deptForm);
      } else {
        await api.departments.add(deptForm);
      }
      setIsDeptModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save department failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Team Handlers
  const handleAddTeam = (dept: Department) => {
    setSelectedDeptForTeam(dept);
    setTeamForm({ name: '', leaderId: '' });
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptForTeam) return;

    setIsLoading(true);
    try {
      await api.teams.add({
        ...teamForm,
        departmentId: selectedDeptForTeam.id
      });
      setIsTeamModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Add team failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Handlers
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      if (itemToDelete.type === 'DEPT') {
        await api.departments.delete(itemToDelete.id);
      } else {
        await api.teams.delete(itemToDelete.id);
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaderName = (leaderId: string) => {
    return users.find(u => u.id === leaderId)?.realName || '未指定负责人';
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-indigo-800">
          部门管理仅限<span className="font-bold">管理员</span>操作。一个部门可以包含多个业务或销售团队。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索部门名称或编码..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAddDept}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          新增部门
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-10 px-6 py-4"></th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">部门架构</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">部门编码</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">团队数量</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepts.map((dept) => {
                const deptTeams = teams.filter(t => t.departmentId === dept.id);
                const isExpanded = expandedDeptIds.has(dept.id);
                
                return (
                  <React.Fragment key={dept.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => toggleExpand(dept.id)}>
                      <td className="px-6 py-4 text-center">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-sm font-black text-slate-900">
                          <Building className="w-5 h-5 text-indigo-600" />
                          {dept.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-indigo-600 font-bold">{dept.code}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-600">
                          <Users2 className="w-4 h-4 opacity-40" />
                          {deptTeams.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAddTeam(dept); }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1 text-xs font-bold"
                            title="新增团队"
                          >
                            <Plus className="w-3 h-3" /> 团队
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditDept(dept); }} 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'DEPT', id: dept.id }); setIsDeleteModalOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-indigo-50/20">
                        <td colSpan={5} className="px-12 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">下属业务团队清单</h4>
                            </div>
                            {deptTeams.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">暂无团队数据，请点击右侧“+团队”进行创建。</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {deptTeams.map(team => (
                                  <div key={team.id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all group/team">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                        {team.name[0]}
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-slate-900">{team.name}</p>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {getLeaderName(team.leaderId)}
                                        </p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => { setItemToDelete({ type: 'TEAM', id: team.id }); setIsDeleteModalOpen(true); }}
                                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg opacity-0 group-hover/team:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 部门管理 Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">{editingDept ? '编辑部门' : '新增部门'}</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">部门名称 *</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  value={deptForm.name}
                  onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">部门编码 *</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase"
                  value={deptForm.code}
                  onChange={e => setDeptForm({...deptForm, code: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">备注描述</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[80px]"
                  value={deptForm.description}
                  onChange={e => setDeptForm({...deptForm, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                  {isLoading ? '正在保存...' : '确认保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 新增团队 Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                 <h3 className="text-lg font-black text-slate-900">创建新团队</h3>
                 <p className="text-xs text-slate-500 mt-1">归属于: {selectedDeptForTeam?.name}</p>
               </div>
               <button onClick={() => setIsTeamModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
             </div>
             <form onSubmit={handleTeamSubmit} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">团队名称 *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="例如：华东销售战队"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    value={teamForm.name}
                    onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">团队负责人 *</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none cursor-pointer"
                    value={teamForm.leaderId}
                    onChange={e => setTeamForm({...teamForm, leaderId: e.target.value})}
                  >
                    <option value="">-- 请选择负责人 --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.realName} (@{u.username})</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex flex-col gap-2">
                   <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                      {isLoading ? '正在保存...' : '确认创建团队'}
                   </button>
                   <button type="button" onClick={() => setIsTeamModalOpen(false)} className="w-full py-3 text-sm font-bold text-slate-400">取消</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* 删除确认 Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">确认删除？</h3>
            <p className="text-slate-500 text-sm mb-6">
              {itemToDelete?.type === 'DEPT' 
                ? '删除部门将同时清理其关联的所有团队及员工归属，请谨慎操作。' 
                : '确定要删除该业务团队吗？'}
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmDelete}
                className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 active:scale-95 transition-all"
              >
                确认删除
              </button>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all"
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

export default Departments;
