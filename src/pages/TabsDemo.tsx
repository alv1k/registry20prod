import React from 'react';
import Tabs from '../components/Tabs';

const TabsDemo: React.FC = () => {
  const tabs = [
    {
      id: 'tab1',
      title: 'Финансы',
      content: (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Финансовый журнал</h3>
          <p>Здесь будет отображаться информация о финансовых операциях.</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Доходы и расходы
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Категории расходов
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Отчеты
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'tab2',
      title: 'Транспорт',
      content: (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Транспортный журнал</h3>
          <p>Здесь будет отображаться информация об автомобилях и ТО.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-3 rounded">
              <h4 className="font-medium">МАЗ-12345</h4>
              <p className="text-sm text-gray-600">След. ТО: 15.11.2023</p>
            </div>
            <div className="border p-3 rounded">
              <h4 className="font-medium">КАМАЗ-67890</h4>
              <p className="text-sm text-gray-600">След. ТО: 22.11.2023</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tab3',
      title: 'Корреспонденты',
      content: (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Корреспондентский журнал</h3>
          <p>Здесь будет отображаться информация о корреспондентах.</p>
          <table className="min-w-full mt-3">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">От кого</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Тема</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2">15.10.2023</td>
                <td className="px-4 py-2">ООО Ромашка</td>
                <td className="px-4 py-2">Договор поставки</td>
              </tr>
              <tr>
                <td className="px-4 py-2">14.10.2023</td>
                <td className="px-4 py-2">АО Ландыш</td>
                <td className="px-4 py-2">Счет №123</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 'tab4',
      title: 'Отключенная',
      disabled: true,
      content: (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Эта вкладка отключена</h3>
          <p>Это содержимое не будет доступно, так как вкладка отключена.</p>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Демонстрация вкладок</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Горизонтальные вкладки (вариант по умолчанию)</h2>
        <Tabs tabs={tabs} />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Вертикальные вкладки</h2>
        <Tabs 
          tabs={tabs.slice(0, 3)} // First 3 tabs only
          orientation="vertical" 
        />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Вкладки с подчеркиванием</h2>
        <Tabs 
          tabs={tabs.slice(0, 3)} // First 3 tabs only
          variant="underline" 
        />
      </div>
    </div>
  );
};

export default TabsDemo;