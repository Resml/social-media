import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const FollowerGrowthChart = ({ data }: { data: any[] }) => {
  return (
  <div className="rounded-2xl p-6 h-80"
    style={{
      background: '#fff',
      border: '1px solid #ced0d4',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}
  >
    <div className="font-bold mb-4"
      style={{ fontFamily: 'Outfit, sans-serif', color: '#050505', fontSize: '0.95rem' }}>
      Follower Growth
    </div>
    <ResponsiveContainer width="100%" height="80%">
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
        <Line type="monotone" dataKey="followers" stroke="#1877f2" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#1877f2' }} />
        <CartesianGrid stroke="#f0f2f5" strokeDasharray="0" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#65676B' }} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={{ fontSize: 11, fill: '#65676B' }} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 12px 28px rgba(0,0,0,0.12)', fontFamily: 'Inter, sans-serif' }}
          labelStyle={{ color: '#050505', fontWeight: 700 }}
          itemStyle={{ color: '#1877f2' }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
  );
};

export const EngagementChart = ({ data }: { data: any[] }) => {
  // Facebook-pro style palette
  const colors = ['#1877f2', '#00c3f3', '#2abba7', '#f02849'];
  
  return (
  <div className="rounded-2xl p-6 h-80 flex flex-col"
    style={{
      background: '#fff',
      border: '1px solid #ced0d4',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}
  >
    <div className="font-bold mb-2"
      style={{ fontFamily: 'Outfit, sans-serif', color: '#050505', fontSize: '0.95rem' }}>
      Engagement Breakdown
    </div>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 12px 28px rgba(0,0,0,0.12)', fontFamily: 'Inter, sans-serif' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#65676B', fontFamily: 'Inter, sans-serif' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};
