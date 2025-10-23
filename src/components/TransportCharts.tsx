import React, { useState } from 'react';
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
  PieLabelRenderProps
} from 'recharts';
import useIsMobile from '../hooks/useIsMobile';

// Define a type that extends PieLabelRenderProps with the percent property
type ExtendedPieLabelRenderProps = PieLabelRenderProps & {
  percent?: number;
};

interface MaintenanceRecord {
  id: number | string;
  vehicleId: string;
  date: string;
  workType: string;
  cost: number;
  comment: string;
  frequency: string;
  mileage?: number;
}

interface TransportChartsProps {
  records: MaintenanceRecord[];
}

// Цветовая палитра для диаграмм
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

const TransportCharts: React.FC<TransportChartsProps> = ({ records }) => {
  const [activeWorkTypeIndex, setActiveWorkTypeIndex] = useState<number | null>(null);
  const [activeFrequencyIndex, setActiveFrequencyIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Подготовка данных для диаграммы по видам работ (workType)
  const workTypeData = Object.values(
    records.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.workType]) {
        acc[record.workType] = {
          name: record.workType,
          total: 0,
          count: 0
        };
      }
      acc[record.workType].total += record.cost;
      acc[record.workType].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  // Подготовка данных для диаграммы по автомобилям (vehicleId)
  const vehicleData = Object.values(
    records.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.vehicleId]) {
        acc[record.vehicleId] = {
          name: record.vehicleId,
          total: 0,
          count: 0
        };
      }
      acc[record.vehicleId].total += record.cost;
      acc[record.vehicleId].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  // Подготовка данных для диаграммы по частоте (frequency)
  const frequencyData = Object.values(
    records.reduce((acc: Record<string, any>, record) => {
      if (!acc[record.frequency]) {
        acc[record.frequency] = {
          name: record.frequency,
          total: 0,
          count: 0
        };
      }
      acc[record.frequency].total += record.cost;
      acc[record.frequency].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  // Если нет данных, отобразить сообщение
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Нет данных для отображения диаграмм</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Диаграмма по видам работ */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Расходы по видам работ</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={workTypeData}
              cx="50%"
              cy="50%"
              labelLine={isMobile ? false : true}
              label={(props: ExtendedPieLabelRenderProps) => {
                const { name, percent } = props;
                const percentValue = percent ? (percent * 100).toFixed(0) : '0';
                return isMobile ? '' : `${name}: ${percentValue}%`;
              }}
              outerRadius={isMobile ? 50 : 80}
              fill="#8884d8"
              dataKey="total"
              onMouseEnter={(data, index) => setActiveWorkTypeIndex(index)}
              onMouseLeave={() => setActiveWorkTypeIndex(null)}
            >
              {workTypeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={activeWorkTypeIndex === index ? "#000" : "none"}
                  strokeWidth={activeWorkTypeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} ₽`, 'Сумма']} />
            <Legend 
              onMouseEnter={(payload) => {
                const index = workTypeData.findIndex(item => item.name === payload.value);
                if (index !== -1) {
                  setActiveWorkTypeIndex(index);
                }
              }}
              onMouseLeave={() => {
                setActiveWorkTypeIndex(null);
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Общая сумма: {workTypeData.reduce((sum, item) => sum + item.total, 0).toLocaleString('ru-RU')} ₽
        </div>
      </div>

      {/* Диаграмма по автомобилям */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Расходы по автомобилям</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={vehicleData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} ₽`, 'Сумма']} />
            <Legend />
            <Bar dataKey="total" name="Сумма" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Общая сумма: {vehicleData.reduce((sum, item) => sum + item.total, 0).toLocaleString('ru-RU')} ₽
        </div>
      </div>

      {/* Диаграмма по частоте */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Расходы по частоте обслуживания</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={frequencyData}
              cx="50%"
              cy="50%"
              labelLine={isMobile ? false : true}
              label={(props: ExtendedPieLabelRenderProps) => {
                const { name, percent } = props;
                const percentValue = percent ? (percent * 100).toFixed(0) : '0';
                return isMobile ? '' : `${name}: ${percentValue}%`;
              }}
              outerRadius={isMobile ? 50 : 80}
              fill="#8884d8"
              dataKey="total"
              onMouseEnter={(data, index) => setActiveFrequencyIndex(index)}
              onMouseLeave={() => setActiveFrequencyIndex(null)}
            >
              {frequencyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={activeFrequencyIndex === index ? "#000" : "none"}
                  strokeWidth={activeFrequencyIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} ₽`, 'Сумма']} />
            <Legend 
              onMouseEnter={(payload) => {
                const index = frequencyData.findIndex(item => item.name === payload.value);
                if (index !== -1) {
                  setActiveFrequencyIndex(index);
                }
              }}
              onMouseLeave={() => {
                setActiveFrequencyIndex(null);
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Общая сумма: {frequencyData.reduce((sum, item) => sum + item.total, 0).toLocaleString('ru-RU')} ₽
        </div>
      </div>
    </div>
  );
};

export default TransportCharts;