
import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../App';
import { RoleType, OperationLog } from '../types';
import { api } from '../api';

const PAGE_SIZE = 15;

const Logs: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === RoleType.ADMIN;
  
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.logs.list();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.username.toLowerCase().includes(term) || 
      log.realName.toLowerCase().includes(term) ||
      log.operationDesc.toLowerCase().includes(term) ||
      log.ipAddress.includes(term) ||
      log.module.toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getActionColor = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('ADD') || a.includes('INSERT') || a.includes('CREATE')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (a.includes('UPDATE') || a.includes('MODIFY') || a.includes('EDIT')) return 'text-amber-600 bg-amber-50 border-amber-100';
    if (a.includes('DELETE') || a.includes('REMOVE')) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (a.includes('LOGIN')) return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const handleClearLogs = async () => {
    if (!window.confirm('确定要清空所有操作日志吗？此操作不可恢复。')) return;
    setIsLoading(true);
    try {
      await api.logs.clear();
      await fetchLogs();
    } catch (err) {
      console.error('Clear logs failed:', err);
    } finally {
      setIsLoading(false);
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
              placeholder="搜索账号、内容、IP..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all"
          >
            <Filter className="w-4 h-4" />
            刷新
          </button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            导出数据
          </button>
          {isAdmin && (
            <button 
              onClick={handleClearLogs}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              清空日志
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Loading Logs...</p>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">时间 / 性能</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">操作账号</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">模块 / 动作</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">操作描述</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">状态</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">终端/IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-xs font-mono text-slate-500">{log.createTime}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-slate-400">{log.executionTime}ms</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900">{log.realName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">@{log.username}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{log.module}</span>
                      <span className={`inline-flex self-start px-2 py-0.5 rounded text-[10px] font-black border uppercase ${getActionColor(log.operationType)}`}>
                        {log.operationType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium max-w-xs truncate" title={log.operationDesc}>
                    {log.operationDesc}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1">
                      {log.isSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <XCircle className="w-5 h-5 text-rose-500" />
                          {log.errorMessage && (
                            <span className="text-[8px] text-rose-400 font-bold max-w-[80px] truncate" title={log.errorMessage}>
                              Error
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-slate-500">
                        <Globe className="w-3 h-3 text-indigo-400" />
                        {log.ipAddress}
                      </div>
                      <p className="text-[9px] text-slate-300 font-medium max-w-[120px] truncate" title={log.userAgent}>
                        {log.userAgent}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <History className="w-12 h-12 text-slate-100" />
                       <p className="text-sm text-slate-400 italic font-medium">未找到符合搜索条件的日志记录</p>
                    </div>
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
              共 <span className="text-indigo-600 font-black">{filteredLogs.length}</span> 条操作审计
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
    </div>
  );
};

export default Logs;
