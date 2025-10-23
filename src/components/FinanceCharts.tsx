import React from 'react';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import useIsMobile from '../hooks/useIsMobile';
import { formatCurrencyWithSeparators, formatDate } from '../utils/formatUtils';

interface FinanceRecord {
  id: number | string;
  date: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  classification: string;
  comment: string;
}

interface FinanceChartsProps {
  records: FinanceRecord[];
}

// Интерфейсы для данных диаграмм
interface ClassificationData {
  name: string;
  total: number;
  count: number;
}

interface DateData {
  date: string;
  total: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

const FinanceCharts: React.FC<FinanceChartsProps> = ({ records }) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Подготовка данных для диаграммы по классификациям
  const classificationData = Object.values(
    records.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.classification]) {
        acc[record.classification] = {
          name: record.classification,
          total: 0,
          count: 0
        };
      }
      acc[record.classification].total += record.total;
      acc[record.classification].count += 1;
      return acc;
    }, {})
  );

  // Подготовка данных для временной диаграммы
  const dateData = Object.values(
    records.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.date]) {
        acc[record.date] = {
          date: record.date,
          total: 0
        };
      }
      acc[record.date].total += record.total;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.date.localeCompare(b.date))
  .map(item => ({
    ...item,
    date: formatDate(item.date) // Форматируем дату для отображения
  }));

  return (
    <div className="mt-6 space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Структура расходов по классификациям</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={isMobile ? false : true}
                  outerRadius={isMobile ? 50 : 80}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="name"
                  label={(entry: any) => isMobile ? '' : `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  onMouseEnter={(data, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {classificationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke={activeIndex === index ? "#000" : "none"}
                      strokeWidth={activeIndex === index ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${formatCurrencyWithSeparators(value)} ₽`]} />
                <Legend 
                  onMouseEnter={(payload) => {
                    const index = classificationData.findIndex(item => item.name === payload.value);
                    if (index !== -1) {
                      setActiveIndex(index);
                    }
                  }}
                  onMouseLeave={() => {
                    setActiveIndex(null);
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Динамика расходов по датам</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dateData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrencyWithSeparators(value)} ₽`, 'Сумма']}
                  labelFormatter={(value: string) => `Дата: ${formatDate(value)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Общая сумма" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Распределение по классификациям</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={classificationData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${formatCurrencyWithSeparators(value)} ₽`]}
                labelFormatter={(value: string) => `${value}`}
              />
              <Legend />
              <Bar dataKey="total" name="Общая сумма" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
};

export default FinanceCharts;