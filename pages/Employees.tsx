
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserX, 
  UserCheck, 
  X, 
  UserPlus, 
  UserCog, 
  AlertTriangle, 
  AlertCircle, 
  Loader2, 
  Building,
  Users2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { User, RoleType, Department, Team } from '../types';
import { useAuth } from '../App';
import { api } from '../api';

const PAGE_SIZE = 10;

const Employees: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected entities for actions
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State
  const initialFormState = {
    username: '',
    password: '',
    realName: '',
    phone: '',
    email: '',
    departmentId: '' as string | number, 
    teamId: '' as string | number,
    role: RoleType.SALES,
    status: 'ENABLE' as 'ENABLE' | 'DISABLE'
  };
  const [formData, setFormData] = useState(initialFormState);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userList, deptList, teamList] = await Promise.all([
        api.users.list(),
        api.departments.list(),
        api.teams.list()
      ]);
      setUsers(userList);
      setDepartments(deptList);
      setTeams(teamList);
    } catch (err) {
      console.error('Failed to load employee data:', err);
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

  // 根据当前选择的部门过滤团队
  const availableTeams = useMemo(() => {
    if (!formData.departmentId) return [];
    return teams.filter(t => String(t.departmentId) === String(formData.departmentId));
  }, [formData.departmentId, teams]);

  // 根据 ID 获取部门名称
  const getDepartmentName = (deptId: string | number | undefined) => {
    if (!deptId) return '';
    const dept = departments.find(d => String(d.id) === String(deptId));
    return dept ? dept.name : '';
  };

  // 根据 ID 获取团队名称
  const getTeamName = (teamId: string | number | undefined) => {
    if (!teamId) return '';
    const team = teams.find(t => String(t.id) === String(teamId));
    return team ? team.name : '';
  };

  // 重复账号检查
  const isUsernameDuplicate = useMemo(() => {
    if (editingUserId) return false;
    if (!formData.username.trim()) return false;
    return users.some(u => !u.deleteFlag && u.username.toLowerCase() === formData.username.trim().toLowerCase());
  }, [formData.username, users, editingUserId]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      !u.deleteFlag && 
      ((u.realName || '').includes(searchTerm) || (u.username || '').includes(searchTerm))
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddClick = () => {
    setEditingUserId(null);
    setSubmissionError(null);
    setFormData({
      ...initialFormState,
      departmentId: departments[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setSubmissionError(null);
    setFormData({
      username: user.username,
      password: '', 
      realName: user.realName,
      phone: user.phone === '-' ? '' : user.phone,
      email: user.email === '-' ? '' : (user.email || ''),
      departmentId: user.departmentId || '',
      teamId: user.teamId || '',
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!editingUserId && isUsernameDuplicate) {
      setSubmissionError('登录账号已存在');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload: any = {
        username: formData.username,
        fullName: formData.realName,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        isActive: formData.status === 'ENABLE',
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        teamId: formData.teamId ? Number(formData.teamId) : null
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUserId) {
        await api.users.update(editingUserId, payload);
      } else {
        await api.users.add(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Save employee failed:', err);
      setSubmissionError(err.message || '保存失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    setIsLoading(true);
    try {
      const newActiveState = user.status !== 'ENABLE';
      await api.users.update(user.id, { isActive: newActiveState } as any);
      await loadData();
    } catch (err) {
      console.error('Toggle status failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('无法删除当前登录的管理员账号。');
      return;
    }
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      setIsLoading(true);
      try {
        await api.users.delete(userToDelete.id);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        await loadData();
      } catch (err) {
        console.error('Delete employee failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索登录账号、真实姓名..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          新增员工
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-bold text-slate-600">正在同步员工数据...</p>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">序号</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">员工信息</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">所属部门</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">所属团队</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">角色权限</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">#{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 uppercase">
                        {(user.realName || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{user.realName || '未知'}</p>
                        <p className="text-xs text-slate-500 font-medium">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.departmentId ? (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Building className="w-3.5 h-3.5 text-indigo-500" />
                        {getDepartmentName(user.departmentId)}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic">未分配</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.teamId ? (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Users2 className="w-3.5 h-3.5 text-indigo-500" />
                        {getTeamName(user.teamId)}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic">未分配</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'ENABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span className={`text-xs font-black uppercase tracking-tighter ${user.status === 'ENABLE' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {user.status === 'ENABLE' ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="编辑员工"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-all ${user.status === 'ENABLE' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={user.status === 'ENABLE' ? '禁用账号' : '启用账号'}
                      >
                        {user.status === 'ENABLE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="软删除员工"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-slate-400 italic font-medium">
                    未找到匹配的员工数据
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
              显示第 <span className="text-indigo-600">{(currentPage - 1) * PAGE_SIZE + 1}</span> 至 <span className="text-indigo-600">{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}</span> 条，共 <span className="text-indigo-600">{filteredUsers.length}</span> 条
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
                  {editingUserId ? <UserCog className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingUserId ? '修改员工信息' : '录入新员工'}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Staff Credential Profile</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form id="employeeForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* 错误显示区域 */}
              {submissionError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-rose-700">{submissionError}</p>
                </div>
              )}

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <UserCheck className="w-4 h-4" /> 1. 账号基础信息 (Account Base)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">登录账号 *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="唯一登录 ID"
                      disabled={!!editingUserId}
                      className={`w-full px-5 py-3 border rounded-xl outline-none focus:ring-2 transition-all font-bold ${
                        editingUserId 
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                          : isUsernameDuplicate 
                            ? 'bg-rose-50 border-rose-300 focus:ring-rose-100 text-rose-700' 
                            : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                      }`}
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                    {isUsernameDuplicate && (
                      <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-black uppercase italic">
                        <AlertCircle className="w-3 h-3" /> Error: Username Taken
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">
                      安全密码 {editingUserId ? '(重置密码)' : '*'}
                    </label>
                    <input 
                      required={!editingUserId}
                      type="password" 
                      placeholder={editingUserId ? "留空则不修改" : "设置初始密码"}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <Building className="w-4 h-4" /> 2. 岗位归属信息 (Affiliation)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">所属部门 *</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none cursor-pointer"
                        value={formData.departmentId}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData({
                            ...formData, 
                            departmentId: val ? Number(val) : '',
                            teamId: '' // 切换部门时重置团队选择
                          });
                        }}
                      >
                        <option value="">-- 请选择部门 --</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">所属团队 (可选)</label>
                    <div className="relative">
                      <select 
                        className={`w-full px-5 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none ${!formData.departmentId ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 cursor-pointer'}`}
                        value={formData.teamId}
                        disabled={!formData.departmentId}
                        onChange={e => setFormData({...formData, teamId: e.target.value ? Number(e.target.value) : ''})}
                      >
                        {!formData.departmentId ? (
                          <option value="">请先选择部门</option>
                        ) : availableTeams.length === 0 ? (
                          <option value="">该部门暂无团队</option>
                        ) : (
                          <>
                            <option value="">-- 未分配具体团队 --</option>
                            {availableTeams.map(team => (
                              <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black text-slate-700 uppercase">角色权限 *</label>
                    <select 
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as RoleType})}
                    >
                      <option value={RoleType.SALES}>销售 (仅看个人数据)</option>
                      <option value={RoleType.SALES_MANAGER}>销售主管 (查看本团队数据)</option>
                      <option value={RoleType.SALES_DIRECTOR}>销售总监 (全公司业务总览)</option>
                      <option value={RoleType.ADMIN}>超级管理员 (系统全局控制)</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <AlertTriangle className="w-4 h-4" /> 3. 个人与状态 (Status)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">真实姓名 *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      value={formData.realName}
                      onChange={e => setFormData({...formData, realName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">联系手机 *</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-black text-slate-700 uppercase">账号当前状态</label>
                    <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="status"
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" 
                          checked={formData.status === 'ENABLE'}
                          onChange={() => setFormData({...formData, status: 'ENABLE'})}
                        />
                        <span className="text-sm font-black text-slate-700 uppercase">Active (正常启用)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="status"
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" 
                          checked={formData.status === 'DISABLE'}
                          onChange={() => setFormData({...formData, status: 'DISABLE'})}
                        />
                        <span className="text-sm font-black text-slate-400 uppercase">Disabled (锁定禁用)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </form>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-8 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                取消
              </button>
              <button 
                type="submit" 
                form="employeeForm" 
                disabled={(!editingUserId && isUsernameDuplicate) || isLoading} 
                className={`px-10 py-3 text-sm font-black text-white rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
                  (!editingUserId && isUsernameDuplicate) || isLoading 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUserId ? '保存修改档案' : '确认新增员工'}
              </button>
            </div>
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
            <h3 className="text-xl font-black text-slate-900 mb-2">确认废弃账号？</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
              您正在尝试删除员工 <span className="font-black text-slate-900 underline decoration-rose-200">{userToDelete?.realName}</span> 的档案。<br/>
              系统将撤销其所有访问权限，此操作不可撤销。
            </p>
            <div className="flex flex-col gap-2">
              <button 
                disabled={isLoading}
                onClick={confirmDelete}
                className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-black shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? '正在处理...' : '确认立即删除'}
              </button>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                返回取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
