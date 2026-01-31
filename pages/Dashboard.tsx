
import React from 'react';
import { 
  Users2, 
  Cpu, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle2,
  // Add ShieldCheck to fix the missing component error on line 85
  ShieldCheck
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: '累计客户', value: '1,284', icon: Users2, color: 'bg-blue-500' },
    { label: '活跃需求', value: '45', icon: Cpu, color: 'bg-indigo-500' },
    { label: '成交总额', value: '¥24.5M', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: '跟进中', value: '12', icon: Clock, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
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
            实时状态流
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold text-indigo-600">张销售</span> 刚才更新了 
                    <span className="font-semibold"> 未来科技租赁需求 </span> 的状态为 
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs ml-1">评估中</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">10分钟前</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">团队任务概览</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">需求成交率</span>
                <span className="text-slate-900 font-bold">78%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">平均响应时间</span>
                <span className="text-slate-900 font-bold">2.4h</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">系统合规审计</p>
                    <p className="text-xs text-slate-500">所有关键操作已记录至审计日志</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-indigo-600 font-medium hover:bg-indigo-100 transition-colors">
                  查看报告
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
