# Настройка Firebase для приложения

## 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Добавить проект" и следуйте инструкциям
3. После создания проекта перейдите в проект

## 2. Настройка конфигурации Firebase

1. В Firebase Console перейдите в раздел "Настройки проекта" (шестеренка в левом верхнем углу)
2. Выберите "Настройки общего проекта"
3. Прокрутите вниз до "SDK-настройки и конфигурация"
4. Найдите вкладку "Веб-приложение" и нажмите "Конфигурация"
5. Скопируйте значения конфигурации

## 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcde12345
```

Замените значения на реальные из вашего Firebase проекта.

## 4. Настройка правил Firestore Security Rules

Для начала вы можете установить базовые правила, но в продакшене обязательно настройте более строгие правила:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешить всем чтение и запись (НЕ безопасно для продакшена!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 5. Включение Firestore

1. В Firebase Console перейдите в "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите "Тестовый режим" для начала (позже измените на продакшен с правилами безопасности)

## 6. Использование Firebase в приложении

Приложение уже настроено для использования Firebase для хранения:

- Корреспондентских записей (в коллекции `correspondent`)

При запуске приложения оно будет автоматически синхронизировать данные с Firestore.

## 7. Доступные функции

- `syncCorrespondentData()` - загрузить данные из Firebase
- `addCorrespondentRecord()` - добавить новую запись в Firebase
- `updateCorrespondentRecord()` - обновить запись в Firebase
- `deleteCorrespondentRecord()` - удалить запись из Firebase

## 8. Добавление других разделов (Транспорт, Финансы, Быт)

Чтобы добавить Firebase поддержку для других разделов (транспорт, финансы, быт), нужно:

1. Создать сервисы для каждого типа данных, аналогично `correspondentService.ts`
2. Добавить соответствующие функции в store для синхронизации данных
3. Обновить компоненты для использования асинхронных операций