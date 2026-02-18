
import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Cpu, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { api } from '../api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: '累计客户', value: '...', icon: Users2, color: 'bg-blue-500' },
    { label: '活跃需求', value: '...', icon: Cpu, color: 'bg-indigo-500' },
    { label: '员工总数', value: '...', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'GPU型号', value: '...', icon: Clock, color: 'bg-amber-500' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, rental, purchase, project, users, gpus] = await Promise.all([
          api.customers.list(),
          api.demands.list('RENTAL'),
          api.demands.list('PURCHASE'),
          api.demands.list('PROJECT'),
          api.users.list(),
          api.gpuModels.list()
        ]);

        const demandCount = rental.length + purchase.length + project.length;

        setStats([
          { label: '累计客户', value: customers.length.toLocaleString(), icon: Users2, color: 'bg-blue-500' },
          { label: '活跃需求', value: demandCount.toLocaleString(), icon: Cpu, color: 'bg-indigo-500' },
          { label: '员工总数', value: users.length.toLocaleString(), icon: TrendingUp, color: 'bg-emerald-500' },
          { label: 'GPU型号', value: gpus.length.toLocaleString(), icon: Clock, color: 'bg-amber-500' },
        ]);
      } catch (err) {
        console.error('Fetch dashboard stats failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                 <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
            )}
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            系统运行流
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 italic">实时日志模块正在升级中...</p>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-dashed border-slate-100 opacity-50">
                <div className="mt-1">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">
                    业务系统与富脊超算集群 API 通信正常
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Status: OK</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">团队健康度</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">数据更新频率</span>
                <span className="text-slate-900 font-bold">100%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">安全合规</p>
                    <p className="text-xs text-slate-500">所有数据请求均已通过 JWT 鉴权</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-indigo-600 font-medium">
                  查看审计
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
