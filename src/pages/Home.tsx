import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Добро пожаловать</h1>
        <p className="text-gray-600 text-lg">
          Выберите раздел для управления различными аспектами вашего учета
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Finance Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Финансы</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Управление доходами, расходами, категориями и бюджетом. Создавайте и отслеживайте финансовые записи.
          </p>
          <Link 
            to="/finance" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Перейти к финансам
          </Link>
        </div>

        {/* Vehicles Maintenance Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Техобслуживание авто</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Управление автомобилями и записями технического обслуживания. Отслеживайте расходы на ТО.
          </p>
          <Link 
            to="/vehicles_maintenance" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Перейти к автосервису
          </Link>
        </div>

        {/* Domestic Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Бытовой каталог</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Планирование домашних дел и задач. Календарь и система отслеживания выполнения задач.
          </p>
          <Link 
            to="/domestic" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Перейти к бытовому
          </Link>
        </div>
      </div>

      <div className="mt-10 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">О системе</h2>
        <p className="text-gray-600 mb-3">
          Эта система предназначена для комплексного учета и управления различными аспектами жизни:
        </p>
        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          <li>Финансовые расходы и доходы</li>
          <li>Обслуживание транспортных средств</li>
          <li>Бытовые задачи и дела</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;