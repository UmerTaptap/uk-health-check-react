import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

type ChartType = 'line' | 'pie';

type SensorChartProps = {
  title: string;
  type: ChartType;
  data: any[];
  timeRange?: string;
  colors?: string[];
  dataKey?: string;
  threshold?: number;
  thresholdLabel?: string;
  nameKey?: string;
  valueKey?: string;
};

const SensorChart: React.FC<SensorChartProps> = ({
  title,
  type,
  data,
  timeRange = '7d',
  colors = ['#10B981', '#F59E0B', '#EF4444'],
  dataKey = 'value',
  threshold,
  thresholdLabel = 'Warning Level',
  nameKey = 'name',
  valueKey = 'value'
}) => {
  const chartTitle = () => (
    <div className="flex justify-between items-center flex-wrap">
      <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
      {timeRange && type === 'line' && (
        <div className="text-xs sm:text-sm text-gray-500">Last {timeRange}</div>
      )}
    </div>
  );
  
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={220} minHeight={180}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 15,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: '0.75rem' }}
          tickMargin={8}
        />
        <YAxis 
          tick={{ fontSize: '0.75rem' }} 
          width={25}
        />
        <Tooltip 
          formatter={(value) => [`${value}`, '']} 
          contentStyle={{ fontSize: '0.75rem' }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={colors[0]} 
          activeDot={{ r: 6 }} 
          strokeWidth={2}
          dot={{ r: 2 }}
        />
        {threshold && (
          <ReferenceLine 
            y={threshold} 
            label={{ 
              value: thresholdLabel, 
              position: 'left',
              fontSize: '0.7rem'
            }} 
            stroke={colors[2]} 
            strokeDasharray="3 3" 
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
  
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={230} minHeight={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          labelLine={false}
          outerRadius={65}
          innerRadius={0}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          label={false}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any, name: any) => {
            // Calculate total safely
            let total = 0;
            if (Array.isArray(data) && data.length > 0 && valueKey) {
              total = data.reduce((acc, item) => {
                const itemValue = item[valueKey as keyof typeof item];
                return acc + (typeof itemValue === 'number' ? itemValue : 0);
              }, 0);
            }
            
            // Calculate percentage safely with fallback to 0
            const numValue = Number(value) || 0;
            const percentage = total > 0 ? Math.round((numValue / total) * 100) : 0;
            
            return [`${value} (${percentage}%)`, name];
          }}
          contentStyle={{ fontSize: '0.75rem', padding: '8px', borderRadius: '4px' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={45}
          iconSize={10}
          iconType="circle"
          layout="horizontal"
          wrapperStyle={{ 
            fontSize: '0.75rem', 
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '5px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
  
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg divide-y divide-gray-100">
      <div className="px-3 py-4 sm:px-5 sm:py-6">
        {chartTitle()}
        <div className="mt-3 sm:mt-4">
          {type === 'line' ? renderLineChart() : renderPieChart()}
        </div>
      </div>
    </div>
  );
};

export default SensorChart;