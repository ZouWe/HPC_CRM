
import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Plus, Settings2, Trash2 } from 'lucide-react';
import { RoleType } from '../types';

const Roles: React.FC = () => {
  const roles = [
    { id: '1', name: '系统管理员', code: 'ADMIN', description: '拥有系统所有权限，管理员工、权限及审计日志', type: RoleType.ADMIN },
    { id: '2', name: '销售总监', code: 'DIRECTOR', description: '查看全公司数据，管理需求进度，查看操作日志', type: RoleType.SALES_DIRECTOR },
    { id: '3', name: '销售主管', code: 'MANAGER', description: '管理本团队销售，查看本团队所有数据，不可修改需求状态', type: RoleType.SALES_MANAGER },
    { id: '4', name: '普通销售', code: 'SALES', description: '仅限查看/操作自己创建的数据，隐藏关键业务字段', type: RoleType.SALES },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">基于「角色-权限-数据」三层架构实现精细化访问控制</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          新增角色
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                {role.type === RoleType.ADMIN ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Settings2 className="w-4 h-4" />
                </button>
                {role.type !== RoleType.ADMIN && (
                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{role.name}</h3>
            <p className="text-xs font-mono text-indigo-500 font-bold mb-3 uppercase tracking-wider">{role.code}</p>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{role.description}</p>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">创建日期: 2024-01-01</span>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                配置功能权限
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">核心交互规则:</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>销售对租赁/采购需求表的「需求类型」字段不可修改，其余字段可改。</li>
            <li>销售看不到「需求分类」「需求状态」字段。</li>
            <li>销售主管可查看本团队全量数据，但隐藏「需求状态」修改权限。</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Roles;
