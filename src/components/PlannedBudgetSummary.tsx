import React from 'react';
import { formatCurrencyWithSeparators } from '../utils/formatUtils';

interface PlannedBudgetSummaryProps {
  totalPlannedAmount: number;
  totalActualAmount: number;
  variance: number;
}

const PlannedBudgetSummary: React.FC<PlannedBudgetSummaryProps> = ({
  totalPlannedAmount,
  totalActualAmount,
  variance
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Total Planned Amount Block */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Запланировано</h3>
        <div className="flex items-center">
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrencyWithSeparators(totalPlannedAmount)} ₽
          </div>
          <div className="ml-4 text-sm text-gray-500">
            по выбранным фильтрам
          </div>
        </div>
      </div>
      
      {/* Total Actual Amount Block */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Потрачено</h3>
        <div className="flex items-center">
          <div className="text-3xl font-bold text-green-600">
            {formatCurrencyWithSeparators(totalActualAmount)} ₽
          </div>
          <div className="ml-4 text-sm text-gray-500">
            по выбранным фильтрам
          </div>
        </div>
      </div>
    
    {/* Variance Block */}
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-80 mb-4">Отклонение</h3>
        <div className="flex items-center">
          <div className={`text-3xl font-bold ${variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrencyWithSeparators(Math.abs(variance))} ₽
          </div>
          <div className="ml-4 text-sm text-gray-500">
            {variance >= 0 ? 'Превышение' : 'Экономия'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannedBudgetSummary;