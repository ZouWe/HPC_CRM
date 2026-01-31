
import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { MOCK_USERS, MOCK_DEPARTMENTS } from '../constants';
import { User, RoleType } from '../types';
import { useAuth } from '../App';

const Employees: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  
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
    department: MOCK_DEPARTMENTS[0]?.name || '',
    role: RoleType.SALES,
    status: 'ENABLE' as 'ENABLE' | 'DISABLE'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filter out soft-deleted users and apply search
  const filteredUsers = users.filter(u => 
    !u.deleteFlag && 
    (u.realName.includes(searchTerm) || u.username.includes(searchTerm))
  );

  // Open modal for adding
  const handleAddClick = () => {
    setEditingUserId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      password: '', 
      realName: user.realName,
      phone: user.phone,
      email: user.email || '',
      department: user.department,
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUserId) {
      setUsers(users.map(u => u.id === editingUserId ? {
        ...u,
        realName: formData.realName,
        phone: formData.phone,
        email: formData.email,
        department: formData.department,
        role: formData.role,
        status: formData.status
      } : u));
    } else {
      const newUser: User = {
        id: `U${Date.now()}`,
        username: formData.username,
        realName: formData.realName,
        phone: formData.phone,
        email: formData.email,
        department: formData.department,
        status: formData.status,
        role: formData.role,
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        creator: currentUser?.realName || 'Admin',
        deleteFlag: false
      };
      setUsers([newUser, ...users]);
    }

    setIsModalOpen(false);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? {
      ...u, 
      status: u.status === 'ENABLE' ? 'DISABLE' : 'ENABLE'
    } : u));
  };

  // Trigger Delete Modal
  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('无法删除当前登录的管理员账号。');
      return;
    }
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm Soft Delete
  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.map(u => u.id === userToDelete.id ? { ...u, deleteFlag: true } : u));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                        {user.realName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.realName}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{user.phone}</p>
                    <p className="text-xs text-slate-400">{user.email || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.department}</td>
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
                        onClick={() => toggleUserStatus(user.id)}
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
              {filteredUsers.length === 0 && (
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

      {/* Main Form Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  {editingUserId ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{editingUserId ? '修改员工信息' : '新增员工账号'}</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="employeeForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Group: Account Info */}
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
                      placeholder="字母+数字, 6-20位"
                      disabled={!!editingUserId}
                      className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${editingUserId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'}`}
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                    {editingUserId && <p className="text-[10px] text-slate-400 mt-1">编辑模式下账号不可修改</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      密码 {editingUserId ? '' : <span className="text-rose-500">*</span>}
                    </label>
                    <input 
                      required={!editingUserId}
                      type="password" 
                      placeholder={editingUserId ? "留空则不修改密码" : "8-20位, 含大小写+数字"}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Group: Personal Info */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  个人信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">真实姓名 <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      type="text" 
                      placeholder="2-10位中文"
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
                      pattern="[0-9]{11}"
                      placeholder="11位手机号"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">邮箱</label>
                    <input 
                      type="email" 
                      placeholder="可选, 邮箱格式"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Group: Org Info */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                  归属信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">所属部门 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                      {MOCK_DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">关联角色 <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
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
            </form>

            {/* Modal Footer */}
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
                className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                {editingUserId ? '保存修改' : '保存员工'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">确认删除员工？</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                你正在尝试删除 <span className="font-bold text-slate-900">{userToDelete?.realName}</span> (@{userToDelete?.username})。<br/>
                该账号将无法再登录系统，其分配的权限将被收回。相关历史业务数据将保留以供审计。
              </p>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  确认删除
                </button>
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                  className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
