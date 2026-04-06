import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const FollowerGrowthChart = ({ data }: { data: any[] }) => (
  <div className="rounded-2xl p-5 h-80"
    style={{
      background: '#fff',
      border: '1px solid var(--slate-100)',
      boxShadow: '0 1px 4px rgba(2,132,199,0.06)',
    }}
  >
    <div className="font-bold mb-4"
      style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-700)', fontSize: '0.9rem' }}>
      Follower Growth (Last 30 Days)
    </div>
    <ResponsiveContainer width="100%" height="80%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey="followers" stroke="var(--brand-600)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--brand-600)' }} />
        <CartesianGrid stroke="var(--slate-100)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: '1px solid var(--slate-100)', boxShadow: '0 4px 16px rgba(2,132,199,0.12)', fontFamily: 'Inter, sans-serif' }}
          labelStyle={{ color: 'var(--slate-700)', fontWeight: 600 }}
          itemStyle={{ color: 'var(--brand-600)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const EngagementChart = ({ data }: { data: any[] }) => (
  <div className="rounded-2xl p-5 h-80 flex flex-col"
    style={{
      background: '#fff',
      border: '1px solid var(--slate-100)',
      boxShadow: '0 1px 4px rgba(2,132,199,0.06)',
    }}
  >
    <div className="font-bold mb-2"
      style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-700)', fontSize: '0.9rem' }}>
      Engagement Breakdown
    </div>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || 'var(--brand-400)'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid var(--slate-100)', boxShadow: '0 4px 16px rgba(2,132,199,0.12)', fontFamily: 'Inter, sans-serif' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px', fontFamily: 'Inter, sans-serif' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
