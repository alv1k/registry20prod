import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { AppPlannedBudgetRecord, AppFinanceRecord } from '../store/useStore';

interface PeriodFilter {
  type: 'all' | 'month' | 'quarter' | 'year';
  value: string;
}

interface UsePlannedBudgetDataProps {
  classificationFilter: string;
  periodFilter: PeriodFilter;
}

export const usePlannedBudgetData = ({ classificationFilter, periodFilter }: UsePlannedBudgetDataProps) => {
  const plannedBudgetData = useStore((state) => state.plannedBudgetData);
  const financeData = useStore((state) => state.financeData);

  // Apply filters to the planned budget data and sort by date (soonest first)
  const filteredData = useMemo(() => {
    return plannedBudgetData
      .filter(record => {
        // Classification filter (exact match)
        if (classificationFilter && record.classification !== classificationFilter) {
          return false;
        }
        
        // Period filter
        if (periodFilter.type !== 'all') {
          const recordDate = new Date(record.plannedDate);
          const recordYear = recordDate.getFullYear().toString();
          const recordMonth = recordDate.getMonth() + 1; // месяцы в JS от 0 до 11
          const recordQuarter = Math.floor(recordDate.getMonth() / 3) + 1;
          
          switch(periodFilter.type) {
            case 'month':
              // periodFilter.value format: 'YYYY-MM'
              if (recordYear !== periodFilter.value.split('-')[0] || 
                  recordMonth !== parseInt(periodFilter.value.split('-')[1])) {
                return false;
              }
              break;
            case 'quarter':
              // periodFilter.value format: 'YYYY-Q' where Q is quarter number
              const [year, quarter] = periodFilter.value.split('-');
              if (recordYear !== year || recordQuarter !== parseInt(quarter.charAt(1))) {
                return false;
              }
              break;
            case 'year':
              // periodFilter.value format: 'YYYY'
              if (recordYear !== periodFilter.value) {
                return false;
              }
              break;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by planned date, soonest first
        const dateA = new Date(a.plannedDate);
        const dateB = new Date(b.plannedDate);
        return dateA.getTime() - dateB.getTime(); // Ascending order (soonest first)
      });
  }, [plannedBudgetData, classificationFilter, periodFilter]);

  // Calculate actual spending by classification based on current filters
  const calculateActualSpendingByClassification = useMemo(() => {
    // First, filter finance data by the same period filter as planned budget
    const filteredFinanceData = financeData.filter(record => {
      // Period filter
      if (periodFilter.type !== 'all') {
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear().toString();
        const recordMonth = recordDate.getMonth() + 1; // месяцы в JS от 0 до 11
        const recordQuarter = Math.floor(recordDate.getMonth() / 3) + 1;
        
        switch(periodFilter.type) {
          case 'month':
            // periodFilter.value format: 'YYYY-MM'
            if (recordYear !== periodFilter.value.split('-')[0] ||
                recordMonth !== parseInt(periodFilter.value.split('-')[1])) {
              return false;
            }
            break;
          case 'quarter':
            // periodFilter.value format: 'YYYY-Q' where Q is quarter number
            const [year, quarter] = periodFilter.value.split('-');
            if (recordYear !== year || recordQuarter !== parseInt(quarter.charAt(1))) {
              return false;
            }
            break;
          case 'year':
            // periodFilter.value format: 'YYYY'
            if (recordYear !== periodFilter.value) {
              return false;
            }
            break;
        }
      }
      
      return true;
    });
    
    // Group finance data by classification and sum the totals
    const spendingByClassification: Record<string, number> = {};
    filteredFinanceData.forEach(record => {
      if (spendingByClassification[record.classification]) {
        spendingByClassification[record.classification] += record.total;
      } else {
        spendingByClassification[record.classification] = record.total;
      }
    });
    
    return spendingByClassification;
  }, [financeData, periodFilter]);

  // Calculate total planned amount for filtered data
  const calculateTotalPlannedAmount = useMemo(() => {
    return filteredData.reduce((sum, record) => sum + record.plannedAmount, 0);
  }, [filteredData]);

  // Calculate total actual amount based on filtered finance data
  const calculateTotalActualAmount = useMemo(() => {
    return Object.values(calculateActualSpendingByClassification).reduce((sum, amount) => sum + amount, 0);
  }, [calculateActualSpendingByClassification]);

  // Calculate variance (planned vs actual)
  const calculateVariance = useMemo(() => {
    return calculateTotalActualAmount - calculateTotalPlannedAmount;
  }, [calculateTotalActualAmount, calculateTotalPlannedAmount]);

  return {
    filteredData,
    calculateActualSpendingByClassification,
    calculateTotalPlannedAmount,
    calculateTotalActualAmount,
    calculateVariance
  };
};