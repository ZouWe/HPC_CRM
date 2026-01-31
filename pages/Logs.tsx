
import React from 'react';
import { History, Download, Trash2, Search, Filter } from 'lucide-react';
import { useAuth } from '../App';
import { RoleType } from '../types';

const Logs: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === RoleType.ADMIN;

  const mockLogs = [
    { id: '1', time: '2026-01-27 14:20:15', username: 'admin', realName: '超级管理员', module: '员工管理', action: 'UPDATE', content: '修改了员工 [lisi] 的所属部门', ip: '192.168.1.100' },
    { id: '2', time: '2026-01-27 13:45:02', username: 'director_wang', realName: '王总监', module: '需求管理', action: 'UPDATE', content: '将需求 [ID:3001] 进度修改为 [开发中]', ip: '192.168.1.105' },
    { id: '3', time: '2026-01-27 11:30:44', username: 'manager_zhang', realName: '张主管', module: '客户管理', action: 'UPDATE', content: '修改了客户 [陈大客户] 的联系电话', ip: '110.242.68.3' },
    { id: '4', time: '2026-01-27 10:00:21', username: 'sales_li', realName: '李销售', module: '租赁需求', action: 'ADD', content: '新增租赁需求 ID:1001', ip: '221.232.1.88' },
    { id: '5', time: '2026-01-27 09:00:00', username: 'sales_li', realName: '李销售', module: '系统', action: 'LOGIN', content: '用户登录系统', ip: '221.232.1.88' },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ADD': return 'text-emerald-600 bg-emerald-50';
      case 'UPDATE': return 'text-amber-600 bg-amber-50';
      case 'DELETE': return 'text-rose-600 bg-rose-50';
      case 'LOGIN': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索操作账号、IP..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
            <Download className="w-4 h-4" />
            导出日志
          </button>
          {isAdmin && (
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors">
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">时间</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">操作账号</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">模块/类型</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">操作内容</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">IP地址</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{log.realName}</p>
                    <p className="text-xs text-slate-500">@{log.username}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-600">{log.module}</span>
                      <span className={`inline-flex self-start px-2 py-0.5 rounded text-[10px] font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                    {log.content}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
