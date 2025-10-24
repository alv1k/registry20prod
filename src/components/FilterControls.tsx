import React from 'react';
import { AppCategory } from '../store/useStore';
import AnimatedAccordion from './AnimatedAccordion';
import Button from './Button';

interface PeriodFilter {
  type: 'all' | 'month' | 'quarter' | 'year';
  value: string;
}

interface FilterControlsProps {
  classificationFilter: string;
  periodFilter: PeriodFilter;
  categories: AppCategory[];
  onClassificationChange: (value: string) => void;
  onPeriodTypeChange: (value: 'all' | 'month' | 'quarter' | 'year') => void;
  onPeriodValueChange: (value: string) => void;
  onClearFilters: () => void;
  getCurrentMonth: () => string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  classificationFilter,
  periodFilter,
  categories,
  onClassificationChange,
  onPeriodTypeChange,
  onPeriodValueChange,
  onClearFilters,
  getCurrentMonth
}) => {
 return (
    <AnimatedAccordion title="Фильтры" defaultOpen={true}>
      <div className="flex flex-wrap gap-4">          
        <div className="min-w-[224px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Классификация</label>
          <select
            value={classificationFilter}
            onChange={(e) => onClassificationChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          >
            <option value="">Не выбрано</option>
            {categories
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="min-w-[224px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
          <div className="flex space-x-2">
            <select
              value={periodFilter.type}
              onChange={(e) => onPeriodTypeChange(e.target.value as any)}
              className="w-full p-2 border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="all">Весь</option>
              <option value="month">Месяц</option>
              <option value="quarter">Квартал</option>
              <option value="year">Год</option>
            </select>
            {periodFilter.type !== 'all' && (
              <select
                value={periodFilter.value}
                onChange={(e) => onPeriodValueChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-50"
              >
                {periodFilter.type === 'year' && Array.from({length: 10}, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year.toString()}>{year}</option>;
                })}
                {periodFilter.type === 'month' && Array.from({length: 12}, (_, i) => {
                  const month = i + 1;
                  const year = new Date().getFullYear();
                  const monthStr = month < 10 ? `0${month}` : month;
                  const displayMonth = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][i];
                  return <option key={month} value={`${year}-${monthStr}`}>{displayMonth}</option>;
                })}
                {periodFilter.type === 'quarter' && Array.from({length: 4}, (_, i) => {
                  const quarter = i + 1;
                  const year = new Date().getFullYear();
                  return <option key={quarter} value={`${year}-Q${quarter}`}>Q{quarter}</option>;
                })}
              </select>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-3">
        <Button
          onClick={onClearFilters}
          variant="secondary"
        >
          Очистить фильтры
        </Button>
      </div>
    </AnimatedAccordion>
  );
};

export default FilterControls;