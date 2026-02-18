
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
  Building
} from 'lucide-react';
import { User, RoleType, Department } from '../types';
import { useAuth } from '../App';
import { api } from '../api';

const Employees: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected entities for actions
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State
  const initialFormState = {
    username: '',
    password: '',
    realName: '',
    phone: '',
    email: '',
    departmentId: '', 
    role: RoleType.SALES,
    status: 'ENABLE' as 'ENABLE' | 'DISABLE'
  };
  const [formData, setFormData] = useState(initialFormState);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userList, deptList] = await Promise.all([
        api.users.list(),
        api.departments.list()
      ]);
      setUsers(userList);
      setDepartments(deptList);
      
      // 初始化部门选择
      if (deptList.length > 0 && !formData.departmentId) {
        setFormData(prev => ({ ...prev, departmentId: deptList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 重复账号检查
  const isUsernameDuplicate = useMemo(() => {
    if (editingUserId) return false;
    if (!formData.username.trim()) return false;
    return users.some(u => !u.deleteFlag && u.username.toLowerCase() === formData.username.trim().toLowerCase());
  }, [formData.username, users, editingUserId]);

  const filteredUsers = users.filter(u => 
    !u.deleteFlag && 
    ((u.realName || '').includes(searchTerm) || (u.username || '').includes(searchTerm))
  );

  const handleAddClick = () => {
    setEditingUserId(null);
    setFormData({
      ...initialFormState,
      departmentId: departments[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    // 根据部门名称反查 ID 用于回显（如果后端没返回 ID 的话）
    const matchedDept = departments.find(d => d.name === user.department);
    
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      password: '', 
      realName: user.realName,
      phone: user.phone === '-' ? '' : user.phone,
      email: user.email === '-' ? '' : (user.email || ''),
      departmentId: matchedDept?.id || '',
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUserId && isUsernameDuplicate) return;
    
    setIsLoading(true);
    try {
      // 适配后端字段名：fullName, isActive, department_id
      const payload: any = {
        username: formData.username,
        fullName: formData.realName,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        isActive: formData.status === 'ENABLE',
        department_id: formData.departmentId
      };

      // 仅在有输入或新增时发送密码
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
    } catch (err) {
      console.error('Save employee failed:', err);
      alert('保存失败，请检查账号是否重复或网络连接');
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
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">序号</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">员工信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">手机号/邮箱</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">所属部门</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">角色</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">状态</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold uppercase border border-slate-200">
                        {(user.realName || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.realName || '未知'}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{user.phone || '-'}</p>
                    <p className="text-xs text-slate-400">{user.email || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.department || '未分配'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'ENABLE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className={`text-sm font-medium ${user.status === 'ENABLE' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {user.status === 'ENABLE' ? '启用' : '禁用'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="编辑员工"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${user.status === 'ENABLE' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={user.status === 'ENABLE' ? '禁用账号' : '启用账号'}
                      >
                        {user.status === 'ENABLE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    未找到匹配的员工数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  {editingUserId ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{editingUserId ? '修改员工信息' : '新增员工账号'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="employeeForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  账号信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">登录账号 <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      type="text" 
                      placeholder="建议：姓名全拼或工号"
                      disabled={!!editingUserId}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                        editingUserId 
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                          : isUsernameDuplicate 
                            ? 'bg-rose-50 border-rose-300 focus:ring-rose-100' 
                            : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                      }`}
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                    {isUsernameDuplicate && (
                      <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3 h-3" /> 账号已存在，请更换
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      密码 {editingUserId ? '(重置密码)' : <span className="text-rose-500">*</span>}
                    </label>
                    <input 
                      required={!editingUserId}
                      type="password" 
                      placeholder={editingUserId ? "留空则不修改密码" : "请输入登录密码"}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  个人资料
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">真实姓名 <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.realName}
                      onChange={e => setFormData({...formData, realName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">手机号 <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">电子邮箱</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  岗位归属
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">所属部门 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      value={formData.departmentId}
                      onChange={e => setFormData({...formData, departmentId: e.target.value})}
                    >
                      <option value="">-- 请选择部门 --</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">关联角色 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as RoleType})}
                    >
                      <option value={RoleType.SALES}>销售</option>
                      <option value={RoleType.SALES_MANAGER}>销售主管</option>
                      <option value={RoleType.SALES_DIRECTOR}>销售总监</option>
                      <option value={RoleType.ADMIN}>管理员</option>
                    </select>
                  </div>
                </div>
              </section>
              
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  账号状态
                </h4>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="status"
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" 
                      checked={formData.status === 'ENABLE'}
                      onChange={() => setFormData({...formData, status: 'ENABLE'})}
                    />
                    <span className="text-sm font-medium text-slate-700">启用</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="status"
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" 
                      checked={formData.status === 'DISABLE'}
                      onChange={() => setFormData({...formData, status: 'DISABLE'})}
                    />
                    <span className="text-sm font-medium text-slate-700">禁用</span>
                  </label>
                </div>
              </section>
            </form>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                type="submit"
                form="employeeForm"
                disabled={(!editingUserId && isUsernameDuplicate) || isLoading}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                  (!editingUserId && isUsernameDuplicate) || isLoading 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUserId ? '保存修改' : '确认新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">确认删除员工？</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              你正在尝试删除员工 <span className="font-bold text-slate-900">{userToDelete?.realName}</span>。<br/>
              该操作将使其无法登录系统，请务必确认该员工已离职或不再需要访问权限。
            </p>
            <div className="flex flex-col gap-2">
              <button 
                disabled={isLoading}
                onClick={confirmDelete}
                className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {isLoading ? '删除中...' : '确认删除'}
              </button>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200"
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

export default Employees;
