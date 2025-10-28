import { utils, writeFile } from 'xlsx';

// Define interfaces for export configuration
export interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any) => string;
}

export interface ExportConfig {
  fileName: string;
  sheetName: string;
  columns: ExportColumn[];
}

/**
 * Generic function to download records as Excel file
 * @param data - Array of objects to be exported
 * @param config - Configuration object with fileName, sheetName and column mappings
 */
export const exportToExcel = (data: any[], config: ExportConfig): void => {
  // Create worksheet data by mapping the input data to the specified columns
  const worksheetData = data.map(item => {
    const row: any = {};
    config.columns.forEach(column => {
      const value = getNestedValue(item, column.key);
      row[column.header] = column.format ? column.format(value) : value;
    });
    return row;
  });

  // Create worksheet with headers
  const worksheet = utils.json_to_sheet(worksheetData);

  // Create workbook and add the worksheet
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, config.sheetName);

  // Generate and download the Excel file
  writeFile(workbook, config.fileName);
};

/**
 * Helper function to get nested object values using dot notation
 * Example: getNestedValue(obj, 'user.name') would return obj.user.name
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
};

/**
 * Default export function that maps common record fields to Excel columns
 * Can be used as a fallback when no specific configuration is provided
 */
export const exportRecordsToExcel = (data: any[], fileName: string = 'records.xlsx', sheetName: string = 'Sheet1'): void => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine the type of data based on the properties of the first record
  const firstRecord = data[0];
  let columns: ExportColumn[];

  if (firstRecord && firstRecord.hasOwnProperty('workType')) {
    // This looks like maintenance records
    columns = [
      { header: 'ID', key: 'id' },
      { header: 'Дата', key: 'date' },
      { header: 'Вид работ', key: 'workType' },
      { header: 'Стоимость', key: 'cost' },
      { header: 'Частота', key: 'frequency' },
      { header: 'Пробег', key: 'mileage' },
      { header: 'Комментарий', key: 'comment' },
      { header: 'ID автомобиля', key: 'vehicleId' },
    ];
  } else {
    // Default columns for finance records and other types
    columns = [
      { header: 'ID', key: 'id' },
      { header: 'Название', key: 'name' },
      { header: 'Дата', key: 'date' },
      { header: 'Цена', key: 'price' },
      { header: 'Количество', key: 'quantity' },
      { header: 'Сумма', key: 'total' },
      { header: 'Классификация', key: 'classification' },
      { header: 'Комментарий', key: 'comment' },
    ];
  }

  exportToExcel(data, {
    fileName,
    sheetName,
    columns
  });
};

/**
 * Specific export function for maintenance records
 */
export const exportMaintenanceRecordsToExcel = (data: any[], fileName: string = 'maintenance_records.xlsx', sheetName: string = 'Maintenance'): void => {
  const columns: ExportColumn[] = [
    { header: 'ID', key: 'id' },
    { header: 'Дата', key: 'date' },
    { header: 'Вид работ', key: 'workType' },
    { header: 'Стоимость', key: 'cost' },
    { header: 'Частота', key: 'frequency' },
    { header: 'Пробег', key: 'mileage' },
    { header: 'Комментарий', key: 'comment' },
    { header: 'ID автомобиля', key: 'vehicleId' },
  ];

  exportToExcel(data, {
    fileName,
    sheetName,
    columns
  });
};