// src/pages/Recipes/index.tsx
import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import AnimatedAccordion from '../../components/AnimatedAccordion';
import RecipeModal from './components/recipeModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

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

const Recipes = () => {
  // Data from store
  const recipeData: RecipeRecord[] = useStore((state) => state.recipeData);
  const syncRecipeData = useStore((state) => state.syncRecipeData);
  const addRecipeRecord = useStore((state) => state.addRecipeRecord);
  const updateRecipeRecord = useStore((state) => state.updateRecipeRecord);
  const deleteRecipeRecord = useStore((state) => state.deleteRecipeRecord);
  const isRecipeDataLoading = useStore((state) => state.isRecipeDataLoading);
  const recipeDataError = useStore((state) => state.recipeDataError);

  const { user, isAdmin } = useAuth();

  // State for modals
  const [isRecipeFormModalOpen, setIsRecipeFormModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  // Load data on component mount
  useState(() => {
    syncRecipeData().catch(error => {
      console.error('Error loading recipe data:', error);
    });
  });

  // State for filters
  const [titleFilter, setTitleFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [ingredientFilter, setIngredientFilter] = useState<string>('');

  // Apply filters to the data
  const filteredData = useMemo(() => {
    return recipeData.filter(record => {
      // Title filter (partial match)
      if (titleFilter && !record.title.toLowerCase().includes(titleFilter.toLowerCase())) {
        return false;
      }

      // Category filter (exact match)
      if (categoryFilter && record.category !== categoryFilter) {
        return false;
      }

      // Ingredient filter (search in ingredients, considering newlines)
      if (ingredientFilter && !record.ingredients.toLowerCase().replace(/\n/g, ' ').includes(ingredientFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [
    recipeData,
    titleFilter,
    categoryFilter,
    ingredientFilter
  ]);

  // Functions to handle modals
  const openRecipeFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedRecordId(id);
    } else {
      setSelectedRecordId(null);
    }
    setIsRecipeFormModalOpen(true);
  };

  const closeRecipeFormModal = () => {
    setIsRecipeFormModalOpen(false);
    setSelectedRecordId(null);
  };

  // Confirmation functions for deletion
  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteRecipeRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setTitleFilter('');
    setCategoryFilter('');
    setIngredientFilter('');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Каталог рецептов</h1>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Button
              onClick={() => openRecipeFormModal()}
              variant="primary" className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Добавить рецепт
            </Button>
          )}
        </div>
      </div>

      {/* Error messages */}
      {recipeDataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {recipeDataError}
        </div>
      )}

      {/* Filter Controls - Accordion */}
      <AnimatedAccordion title="Фильтры" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              placeholder="Фильтр по названию"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Все категории</option>
              <option value="первое">Первое</option>
              <option value="второе">Второе</option>
              <option value="напитки">Напитки</option>
              <option value="выпечка">Выпечка</option>
              <option value="молочка">Молочка</option>
              <option value="хлеб">Хлеб</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск по ингредиентам</label>
            <input
              type="text"
              placeholder="Ингредиент"
              value={ingredientFilter}
              onChange={(e) => setIngredientFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <Button
            onClick={clearFilters}
            variant="secondary"
          >
            Очистить фильтры
          </Button>
        </div>
      </AnimatedAccordion>

      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelDelete}
                variant="secondary"
              >
                Отмена
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}

      <AnimatedAccordion title="Рецепты" defaultOpen={false}>
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold mb-2">Список рецептов</h3>
        </div>
        <div className="overflow-x-auto">
          {isRecipeDataLoading ? (
            <div className="py-12">
              <LoadingSpinner message="Загрузка рецептов..." />
            </div>
          ) : recipeDataError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {recipeDataError}
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block md:hidden">
                {filteredData.length > 0 ? (
                  filteredData.map((record) => (
                    <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                      <div className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{record.title}</div>
                          <div className="text-xs text-gray-500">{record.category}</div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <div>Время: {record.cookingTime ? `${record.cookingTime} мин` : 'Не указано'}</div>
                          <div>Порции/штук: {record.servings || 'Не указано'}</div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 max-h-20 overflow-hidden">
                          <div className="truncate" title={record.ingredients}>
                            <span className="font-medium">Ингредиенты:</span> {record.ingredients.split('\n').slice(0, 3).join(', ')}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 max-h-10 overflow-hidden">
                          <div className="truncate" title={record.instructions}>
                            <span className="font-medium">Способ приготовления:</span> {record.instructions}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Добавлен: {record.date}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => openRecipeFormModal(record.id)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                            title="Редактировать рецепт"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(record.id);
                            }}
                            className="text-red-600 hover:text-red-900 text-xs"
                            title="Удалить рецепт"
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Нет рецептов, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <table className="hidden md:table divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время приготовления</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Порции/штук</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата добавления</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <tr
                        key={record.id}
                        className={`hover:bg-gray-50 ${isAdmin ? 'cursor-pointer' : ''}`}
                        onClick={isAdmin ? () => openRecipeFormModal(record.id) : undefined}
                      >
                        <td
                          className="p-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {record.title}
                        </td>
                        <td
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {record.category}
                        </td>
                        <td
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {record.cookingTime ? `${record.cookingTime} мин` : 'Не указано'}
                        </td>
                        <td
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {record.servings || 'Не указано'}
                        </td>
                        <td
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {record.date}
                        </td>
                        {isAdmin && (
                          <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRecipeFormModal(record.id);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Редактировать"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(record.id);
                                }}
                                className="text-red-600 hover:text-red-900 ml-2"
                                title="Удалить"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="p-4 text-center text-sm text-gray-500">
                        Нет рецептов, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </AnimatedAccordion>

      {/* Recipe Form Modal */}
      {isAdmin && (
        <RecipeModal
          isOpen={isRecipeFormModalOpen}
          onClose={closeRecipeFormModal}
          recordId={selectedRecordId}
          record={selectedRecordId ? recipeData.find(r => r.id === selectedRecordId) as any : undefined}
          onAdd={addRecipeRecord}
          onUpdate={updateRecipeRecord}
        />
      )}
    </div>
  );
};

export default Recipes;