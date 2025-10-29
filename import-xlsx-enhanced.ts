import * as XLSX from 'xlsx';
import * as fs from 'fs';
import admin from 'firebase-admin';

// Принимаем путь к файлу учетных данных как параметр
const args = process.argv.slice(2);
const serviceAccountPath = args.find(arg => arg.startsWith('--service-account='))?.split('=')[1];

if (!serviceAccountPath) {
  console.error('Не указан путь к файлу учетных данных сервисного аккаунта');
  console.log('Использование: npm run import-enhanced --service-account="путь\\к\\файлу.json" <путь_к_xlsx_файлу> <название_листа> <тип_данных>');
  process.exit(1);
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Файл учетных данных не найден: ${serviceAccountPath}`);
  process.exit(1);
}

// Инициализация Firebase Admin SDK с явным указанием файла учетных данных
try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('Firebase Admin SDK успешно инициализирован с файлом учетных данных:', serviceAccountPath);
} catch (error) {
  console.error('Ошибка инициализации Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();

// Типы данных для различных коллекций
interface FinanceRecord {
  date: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  classification: string;
  comment?: string;
}

interface CorrespondentRecord {
  date: string;
  incomingNumber: string;
  subject: string;
  from: string;
  to: string;
  signedBy?: string;
}

interface TransportRecord {
  shippingDate: string;
  departureDate?: string;
  arrivalDate?: string;
  cargoName: string;
  driver: string;
  carNumber: string;
  driverLicense: string;
  shippingWeight?: number;
  deliveryWeight?: number;
}

interface CategoryRecord {
  name: string;
  description?: string;
  type: 'expense' | 'income';
}

interface HouseholdRecord {
  date: string;
  description: string;
  area: string;
  completed?: boolean;
}

interface VehicleRecord {
  vehicleNumber: string;
  type: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registrationDate: string;
  insuranceExpiry: string;
}

interface MaintenanceRecord {
  vehicleId: string;
  date: string;
  description: string;
  serviceType: string;
  cost: number;
  mileage: number;
  serviceProvider: string;
}

// Функция для импорта финансовых записей
async function importFinanceRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    // Проверим, существует ли файл
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию finance`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      console.log(`Обработка строки ${i + 1}:`, row); // Отладочная информация
      
      try {
        const record: FinanceRecord = {
          date: formatDateString(row.date || row.Date || row['Дата'] || ''),
          name: String(row.name || row.Name || row.description || row.Description || row['Название'] || row['Наименование'] || `Запись ${i + 1}`),
          price: parseNumber(row.price || row.Price || row.cost || row.Cost || row['Цена'] || 0),
          quantity: parseNumber(row.quantity || row.Quantity || row['Количество'] || 1),
          total: parseNumber(row.total || row.Total || row['Сумма'] || 0),
          classification: String(row.classification || row.Classification || row.category || row.Category || row['Классификация'] || row['Категория'] || 'Общее'),
          comment: String(row.comment || row.Comment || row.notes || row.Notes || row['Комментарий'] || ''),
        };

        // Вычисление total, если он не указан (price * quantity)
        if (isNaN(record.total) || record.total === 0) {
          record.total = record.price * record.quantity;
        }

        // Проверка, что все обязательные поля заполнены
        if (!record.date || !record.name) {
          console.warn(`Пропущена запись ${i + 1} из-за отсутствия обязательных полей:`, record);
          continue;
        }

        await db.collection('finance').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.name}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт финансовых записей завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте финансовых записей:', error);
    throw error;
  }
}

// Функция для импорта корреспондентов
async function importCorrespondentRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию correspondent`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        const record: CorrespondentRecord = {
          date: formatDateString(row.date || row.Date || row['Дата'] || ''),
          incomingNumber: String(row.incomingNumber || row.IncomingNumber || row.number || row.Number || row['Номер'] || `CORR-${i + 1}`),
          subject: String(row.subject || row.Subject || row.description || row.Description || row['Тема'] || row['Описание'] || 'Без темы'),
          from: String(row.from || row.From || row.sender || row.Sender || row['От кого'] || 'Не указан'),
          to: String(row.to || row.To || row.recipient || row.Recipient || row['Кому'] || 'Не указан'),
          signedBy: String(row.signedBy || row.SignedBy || row['Подпись'] || row['Подписано'] || ''),
        };

        await db.collection('correspondent').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.subject}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт корреспондентов завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте корреспондентов:', error);
    throw error;
  }
}

// Функция для импорта транспортных записей
async function importTransportRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию transport`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        const record: TransportRecord = {
          shippingDate: formatDateString(row.shippingDate || row.ShippingDate || row.date || row.Date || row['Дата отправки'] || ''),
          departureDate: formatDateString(row.departureDate || row.DepartureDate || row['Дата выезда'] || ''),
          arrivalDate: formatDateString(row.arrivalDate || row.ArrivalDate || row['Дата прибытия'] || ''),
          cargoName: String(row.cargoName || row.CargoName || row.description || row.Description || row['Наименование груза'] || row['Описание'] || 'Груз'),
          driver: String(row.driver || row.Driver || row.name || row.Name || row['Водитель'] || 'Не указан'),
          carNumber: String(row.carNumber || row.CarNumber || row.vehicle || row.Vehicle || row['Номер машины'] || 'Не указан'),
          driverLicense: String(row.driverLicense || row.DriverLicense || row.license || row.License || row['Номер прав'] || 'Не указан'),
          shippingWeight: parseNumber(row.shippingWeight || row.ShippingWeight || row['Вес отправки'] || 0),
          deliveryWeight: parseNumber(row.deliveryWeight || row.DeliveryWeight || row['Вес доставки'] || 0),
        };

        await db.collection('transport').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.cargoName}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт транспортных записей завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте транспортных записей:', error);
    throw error;
  }
}

// Функция для импорта категорий
async function importCategoryRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию finance_categories`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        const record: CategoryRecord = {
          name: String(row.name || row.Name || row.category || row.Category || row['Название'] || row['Категория'] || 'Без названия'),
          description: String(row.description || row.Description || row['Описание'] || ''),
          type: String(row.type || row.Type || row.categoryType || row['Тип'] || 'expense') as 'expense' | 'income',
        };

        // Убедимся, что тип правильный
        if (record.type !== 'expense' && record.type !== 'income') {
          record.type = 'expense'; // по умолчанию
        }

        await db.collection('finance_categories').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.name}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт категорий завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте категорий:', error);
    throw error;
  }
}

// Функция для импорта бытовых записей
async function importHouseholdRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию household`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        const record: HouseholdRecord = {
          date: formatDateString(row.date || row.Date || row['Дата'] || ''),
          description: String(row.description || row.Description || row.task || row.Task || row['Описание'] || row['Задача'] || 'Без описания'),
          area: String(row.area || row.Area || row.room || row.Room || row['Область'] || row['Комната'] || 'Общее'),
          completed: Boolean(row.completed || row.Completed || row.done || row.Done || row['Выполнено'] || false),
        };

        await db.collection('household').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.description}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт бытовых записей завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте бытовых записей:', error);
    throw error;
  }
}

// Функция для импорта транспортных средств
async function importVehicleRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию vehicles`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        const record: VehicleRecord = {
          vehicleNumber: String(row.vehicleNumber || row.VehicleNumber || row.number || row.Number || row['Номер ТС'] || `VEH-${i + 1}`),
          type: String(row.type || row.Type || row.vehicleType || row['Тип'] || 'Автомобиль'),
          make: String(row.make || row.Make || row.brand || row.Brand || row['Марка'] || 'Не указан'),
          model: String(row.model || row.Model || row['Модель'] || 'Не указана'),
          year: parseInt(row.year || row.Year || row['Год'] || new Date().getFullYear().toString()) || new Date().getFullYear(),
          vin: String(row.vin || row.VIN || row['VIN'] || `DEFAULT_VIN_${i}`),
          registrationDate: formatDateString(row.registrationDate || row.RegistrationDate || row['Дата регистрации'] || ''),
          insuranceExpiry: formatDateString(row.insuranceExpiry || row.InsuranceExpiry || row['Истечение страховки'] || ''),
        };

        await db.collection('vehicles').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.vehicleNumber}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт транспортных средств завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте транспортных средств:', error);
    throw error;
  }
}

// Функция для импорта записей технического обслуживания
async function importMaintenanceRecords(filePath: string, sheetName: string) {
  try {
    console.log(`Попытка открыть файл: ${filePath}`);
    console.log(`Попытка открыть лист: ${sheetName}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Файл успешно прочитан');
    
    if (!workbook.Sheets[sheetName]) {
      console.error('Доступные листы в файле:', Object.keys(workbook.Sheets));
      throw new Error(`Лист "${sheetName}" не найден в файле. Проверьте название листа.`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Найдено ${jsonData.length} записей для импорта в коллекцию maintenance`);
    
    if (jsonData.length === 0) {
      console.warn('Файл пуст или не содержит данных для импорта');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        const record: MaintenanceRecord = {
          vehicleId: String(row.vehicleId || row.VehicleId || row.vehicleNumber || row['ID ТС'] || `VEH-${i}`),
          date: formatDateString(row.date || row.Date || row['Дата'] || ''),
          description: String(row.description || row.Description || row.service || row.Service || row['Описание'] || row['Обслуживание'] || 'Обслуживание'),
          serviceType: String(row.serviceType || row.ServiceType || row.type || row.Type || row['Тип услуги'] || 'Общее'),
          cost: parseNumber(row.cost || row.Cost || row.price || row.Price || row['Стоимость'] || 0),
          mileage: parseNumber(row.mileage || row.Mileage || row['Пробег'] || 0),
          serviceProvider: String(row.serviceProvider || row.ServiceProvider || row.serviceCompany || row['Исполнитель'] || 'Не указан'),
        };

        await db.collection('maintenance').add(record);
        console.log(`Запись ${i + 1} успешно добавлена: ${record.description}`);
        successCount++;
      } catch (innerError) {
        console.error(`Ошибка при обработке записи ${i + 1}:`, innerError);
        console.error('Данные, которые не удалось обработать:', row);
        errorCount++;
      }
    }

    console.log(`Импорт записей технического обслуживания завершен. Успешно импортировано: ${successCount}, ошибок: ${errorCount}`);
  } catch (error) {
    console.error('Ошибка при импорте записей технического обслуживания:', error);
    throw error;
  }
}

// Вспомогательная функция для безопасного парсинга чисел
function parseNumber(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/,/g, '')); // Убираем запятые из чисел
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

// Вспомогательная функция для форматирования даты
function formatDateString(dateValue: any): string {
  if (!dateValue) return '';
  
  let date: Date;
  
  // Если это строка, попробуем распарсить различные форматы
  if (typeof dateValue === 'string') {
    // Проверим, может быть это уже в формате YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    date = new Date(dateValue);
  } else if (typeof dateValue === 'number') {
    // Это может быть число в формате Excel
    date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
  } else {
    date = new Date(dateValue);
  }
  
  // Проверим валидность даты
  if (isNaN(date.getTime())) {
    console.warn(`Неверный формат даты: ${dateValue}`);
    return '';
  }
  
  // Форматируем дату как YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Главная функция запуска импорта
async function startImport() {
  // Извлекаем параметры из командной строки
  const remainingArgs = args.filter(arg => !arg.startsWith('--service-account='));
  
  if (remainingArgs.length < 3) {
    console.log('Использование: npm run import-enhanced --service-account="путь\\к\\файлу.json" <путь_к_файлу> <название_листа> <тип_данных>');
    console.log('Типы данных: finance, correspondent, transport, category, household, vehicle, maintenance');
    return;
  }
  
  const filePath = remainingArgs[0];
  const sheetName = remainingArgs[1];
  const dataType = remainingArgs[2].toLowerCase();
  
  console.log(`Начинаем импорт данных из файла: ${filePath}`);
  console.log(`Лист: ${sheetName}`);
  console.log(`Тип данных: ${dataType}`);
  
  try {
    switch (dataType) {
      case 'finance':
        await importFinanceRecords(filePath, sheetName);
        break;
      case 'correspondent':
        await importCorrespondentRecords(filePath, sheetName);
        break;
      case 'transport':
        await importTransportRecords(filePath, sheetName);
        break;
      case 'category':
        await importCategoryRecords(filePath, sheetName);
        break;
      case 'household':
        await importHouseholdRecords(filePath, sheetName);
        break;
      case 'vehicle':
        await importVehicleRecords(filePath, sheetName);
        break;
      case 'maintenance':
        await importMaintenanceRecords(filePath, sheetName);
        break;
      default:
        console.error(`Неизвестный тип данных: ${dataType}`);
        console.log('Доступные типы: finance, correspondent, transport, category, household, vehicle, maintenance');
        return;
    }
    
    console.log('Импорт завершен успешно!');
  } catch (error) {
    console.error('Ошибка при выполнении импорта:', error);
  }
}

// Запуск импорта
startImport().catch(console.error);