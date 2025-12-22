import React from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiTruck, FiHome, FiCalendar, FiBook, FiCoffee } from 'react-icons/fi';
import Button from '../components/Button';
import { useAdminAccess } from '../hooks/useAdminAccess';

// Type the icons properly
const DollarSignIcon = FiDollarSign as React.FC<React.SVGProps<SVGSVGElement>>;
const TruckIcon = FiTruck as React.FC<React.SVGProps<SVGSVGElement>>;
const HomeIcon = FiHome as React.FC<React.SVGProps<SVGSVGElement>>;
const CalendarIcon = FiCalendar as React.FC<React.SVGProps<SVGSVGElement>>;
const BookIcon = FiBook as React.FC<React.SVGProps<SVGSVGElement>>;
const CoffeeIcon = FiCoffee as React.FC<React.SVGProps<SVGSVGElement>>;

const Home: React.FC = () => {
  const isAdmin = useAdminAccess();

  const featureCards = [
    {
      title: 'Финансы',
      description: 'Управление доходами, расходами, категориями и бюджетом. Создавайте и отслеживайте финансовые записи.',
      icon: <DollarSignIcon className="h-6 w-6" />,
      path: '/finance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Техобслуживание авто',
      description: 'Управление автомобилями и записями технического обслуживания. Отслеживайте расходы на ТО.',
      icon: <TruckIcon className="h-6 w-6" />,
      path: '/vehicles_maintenance',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Рецепты',
      description: 'Хранение и организация кулинарных рецептов.',
      icon: <BookIcon className="h-6 w-6" />,
      path: '/recipes',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Добро пожаловать в Реестр 2.0</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Комплексная система учета и управления различными аспектами вашей жизни. Выберите раздел для начала работы.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {featureCards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h2>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <Button
                as="a"
                href={card.path}
                variant="primary"
                size="sm"
                className="w-full"
              >
                Перейти
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">О системе</h2>
          <p className="text-gray-700 mb-6 text-lg">
            Эта система предназначена для комплексного учета и управления различными аспектами жизни.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-blue-600 text-2xl font-bold">Финансы</div>
              <div className="text-gray-600 mt-1">Учет доходов и расходов</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-green-600 text-2xl font-bold">Авто</div>
              <div className="text-gray-600 mt-1">Обслуживание транспорта</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-purple-600 text-2xl font-bold">Быт</div>
              <div className="text-gray-600 mt-1">Планирование дел</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;