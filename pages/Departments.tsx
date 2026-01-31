
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Building,
  Info
} from 'lucide-react';
import { MOCK_DEPARTMENTS } from '../constants';
import { Department } from '../types';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-indigo-800">
          部门管理仅限<span className="font-bold">管理员</span>操作。您可以对组织架构进行精细化管理，该数据将关联员工的归属信息。
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索部门名称、编码..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          新增部门
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">部门名称</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">部门编码</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">描述</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">创建时间</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">操作人</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-indigo-600">{dept.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{dept.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{dept.createTime.split(' ')[0]}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{dept.creator}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDepts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    未找到匹配的部门数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Departments;
