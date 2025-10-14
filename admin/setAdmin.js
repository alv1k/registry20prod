// admin/setAdmin.js
const admin = require('firebase-admin');

// Инициализация Admin SDK с использованием сервисного аккаунта
// ЗАМЕНИТЕ ПУТЬ К ВАШЕМУ ФАЙЛУ serviceAccountKey.json
const serviceAccount = require('./sampleserviceAccountKey.json'); // Поменяйте на ваш реальный файл

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Функция для назначения прав администратора пользователю
 * @param {string} uid - UID пользователя, которому нужно назначить права администратора
 */
async function setCustomUserClaims(uid) {
  try {
    // Назначаем пользовательские атрибуты
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    console.log(`✅ Пользователю ${uid} успешно назначены права администратора`);
    
    // Получаем обновленные данные пользователя для подтверждения
    const userRecord = await admin.auth().getUser(uid);
    console.log(`📋 Информация о пользователе:`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Администратор: ${!!userRecord.customClaims?.admin}`);
  } catch (error) {
    console.error('❌ Ошибка при назначении прав администратора:', error);
  }
}

/**
 * Функция для получения списка всех пользователей с информацией об администраторах
 */
async function listAllUsers() {
  try {
    console.log('📋 Получение списка пользователей...');
    const listUsersResult = await admin.auth().listUsers();
    
    console.log(`Найдено ${listUsersResult.users.length} пользователей:`);
    listUsersResult.users.forEach(userRecord => {
      const isAdmin = !!userRecord.customClaims?.admin;
      console.log(`   UID: ${userRecord.uid}, Email: ${userRecord.email}, Администратор: ${isAdmin ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ Ошибка при получении списка пользователей:', error);
  }
}

/**
 * Функция для проверки, является ли пользователь администратором
 * @param {string} uid - UID пользователя для проверки
 */
async function checkUserAdminStatus(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    const isAdmin = !!userRecord.customClaims?.admin;
    
    console.log(`📋 Статус администратора для пользователя ${uid}: ${isAdmin ? '✅ Да' : '❌ Нет'}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Custom claims:`, userRecord.customClaims || {});
  } catch (error) {
    console.error('❌ Ошибка при проверке статуса администратора:', error);
  }
}

/**
 * Функция для удаления прав администратора у пользователя
 * @param {string} uid - UID пользователя, у которого нужно удалить права администратора
 */
async function removeCustomUserClaims(uid) {
  try {
    // Удалить пользовательские атрибуты, установив их в null
    await admin.auth().setCustomUserClaims(uid, null);
    
    console.log(`✅ У пользователя ${uid} успешно удалены права администратора`);
  } catch (error) {
    console.error('❌ Ошибка при удалении прав администратора:', error);
  }
}

// Экспортируем функции для использования в других местах
module.exports = {
  setCustomUserClaims,
  listAllUsers,
  checkUserAdminStatus,
  removeCustomUserClaims
};

// Пример использования:
// Закомментируйте следующие строки, если не хотите запускать команды при импорте

console.log('🔧 Запуск скрипта управления правами администратора...');

// Замените 'kpXIs5bBpdYsP5NKW7P1ZecgYwr2' на реальный UID пользователя
setCustomUserClaims('kpXIs5bBpdYsP5NKW7P1ZecgYwr2');

// Для проверки статуса администратора
checkUserAdminStatus('kpXIs5bBpdYsP5NKW7P1ZecgYwr2');

// Для получения списка всех пользователей
listAllUsers();
