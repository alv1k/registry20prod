export interface PlannedBudgetRecord {
  id: string | number;
  plannedAmount: number;  // Запланированная сумма
  actualAmount?: number;  // Фактическая сумма (при наличии связанной траты)
  classification: string; // Классификация (категория)
  plannedDate: string;    // Планируемая дата покупки
  comment?: string;       // Комментарий
  createdAt: string;      // Дата создания записи
  updatedAt: string;      // Дата последнего обновления
}