import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';

interface RecipeRecord {
  id: number | string;
  title: string;
  category: string;
  ingredients: string;
  instructions: string;
  cookingTime?: number;
  servings?: number;
  tags?: string[];
  date?: string;
}

interface HolidayMenu {
  id: number | string;
  holidayName: string;
  holidayDate: string;
  recipeIds: (number | string)[];
  dateAdded?: string;
}

interface HolidayMenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidayMenuId?: number | string | null;
  holidayMenu?: HolidayMenu;
  onAdd: (holidayMenu: Omit<HolidayMenu, 'id' | 'dateAdded'>) => void;
  onUpdate: (id: number | string, updatedData: Partial<HolidayMenu>) => void;
  recipes: RecipeRecord[];
}

const HolidayMenuFormModal: React.FC<HolidayMenuFormModalProps> = ({ 
  isOpen, 
  onClose, 
  holidayMenuId, 
  holidayMenu, 
  onAdd, 
  onUpdate, 
  recipes 
}) => {
  const { isAdmin } = useAuth();
  const [holidayName, setHolidayName] = useState(holidayMenu?.holidayName || '');
  const [holidayDate, setHolidayDate] = useState(holidayMenu?.holidayDate || new Date().toISOString().split('T')[0]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<(number | string)[]>(holidayMenu?.recipeIds || []);

  useEffect(() => {
    if (holidayMenu) {
      setHolidayName(holidayMenu.holidayName);
      setHolidayDate(holidayMenu.holidayDate);
      setSelectedRecipeIds(holidayMenu.recipeIds || []);
    } else {
      setHolidayName('');
      setHolidayDate(new Date().toISOString().split('T')[0]); // Default to today's date
      setSelectedRecipeIds([]);
    }
  }, [holidayMenu, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!holidayName || !holidayDate || selectedRecipeIds.length === 0) {
      alert('Пожалуйста, заполните все поля и выберите хотя бы один рецепт');
      return;
    }

    const holidayMenuData = {
      holidayName,
      holidayDate,
      recipeIds: selectedRecipeIds
    };

    if (holidayMenuId) {
      onUpdate(holidayMenuId, holidayMenuData);
    } else {
      onAdd(holidayMenuData);
    }

    onClose();
  };

  const handleRecipeToggle = (recipeId: number | string) => {
    if (selectedRecipeIds.includes(recipeId)) {
      setSelectedRecipeIds(selectedRecipeIds.filter(id => id !== recipeId));
    } else {
      setSelectedRecipeIds([...selectedRecipeIds, recipeId]);
    }
  };

  if (!isAdmin) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={holidayMenuId ? 'Редактировать меню на праздник' : 'Добавить меню на праздник'}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название праздника</label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Введите название праздника"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата праздника</label>
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Выберите рецепты для меню</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-60 overflow-y-auto dark:bg-gray-700">
              {recipes.length > 0 ? (
                [...recipes].sort((a, b) => {
                  const categoryOrder = ['первое', 'второе', 'напитки', 'выпечка', 'молочка', 'хлеб'];
                  const indexA = categoryOrder.indexOf(a.category.toLowerCase());
                  const indexB = categoryOrder.indexOf(b.category.toLowerCase());

                  // If category is not in our predefined order, put it at the end
                  const orderA = indexA === -1 ? Infinity : indexA;
                  const orderB = indexB === -1 ? Infinity : indexB;

                  // If both categories are in our predefined order, sort by that order
                  if (orderA !== Infinity || orderB !== Infinity) {
                    return orderA - orderB;
                  }

                  // If neither is in our predefined order, sort alphabetically
                  return a.category.localeCompare(b.category);
                }).map((recipe) => (
                  <div key={recipe.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`recipe-${recipe.id}`}
                      checked={selectedRecipeIds.includes(recipe.id)}
                      onChange={() => handleRecipeToggle(recipe.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor={`recipe-${recipe.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {recipe.title} ({recipe.category})
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">Нет доступных рецептов</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {holidayMenuId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HolidayMenuFormModal;