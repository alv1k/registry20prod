// src/pages/Recipes/index.tsx
import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import type { AppHolidayMenu as HolidayMenu } from '../../store/useStore';
import AnimatedAccordion from '../../components/AnimatedAccordion';
import RecipeModal from './components/recipeModal';
import HolidayMenuFormModal from './components/holidayMenuFormModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatUtils';
import useIsMobile from '../../hooks/useIsMobile';
import { useModal } from '../../contexts/ModalContext';

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

  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();

  // State for tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'holiday'>('catalog');

  // Data from store for holiday menus
  const holidayMenus: HolidayMenu[] = useStore((state) => state.holidayMenus);
  const syncHolidayMenus = useStore((state) => state.syncHolidayMenus);
  const addHolidayMenuToStore = useStore((state) => state.addHolidayMenu);
  const updateHolidayMenuInStore = useStore((state) => state.updateHolidayMenu);
  const deleteHolidayMenuFromStore = useStore((state) => state.deleteHolidayMenu);
  const isHolidayMenuDataLoading = useStore((state) => state.isHolidayMenuDataLoading);
  const holidayMenuDataError = useStore((state) => state.holidayMenuDataError);

  // Use ModalContext
  const { openModal, closeModal } = useModal();

  // State for holiday menu functionality
  const [, setSelectedHolidayMenuId] = useState<number | string | null>(null);

  // State for modals
  const [, setSelectedRecordId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  // Load data on component mount
  useState(() => {
    syncRecipeData().catch(error => {
      console.error('Error loading recipe data:', error);
    });

    syncHolidayMenus().catch(error => {
      console.error('Error loading holiday menu data:', error);
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

    // Open modal using ModalContext
    openModal({
      id: `recipe-modal-${id || 'new'}`,
      component: RecipeModal,
      props: {
        recordId: id || null,
        record: id ? recipeData.find(r => r.id === id) as any : undefined,
        onAdd: addRecipeRecord,
        onUpdate: updateRecipeRecord,
        onClose: () => closeModal(`recipe-modal-${id || 'new'}`)
      }
    });
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

  // Functions for holiday menu form
  const openHolidayMenuFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedHolidayMenuId(id);
    } else {
      setSelectedHolidayMenuId(null);
    }

    // Open modal using ModalContext
    openModal({
      id: `holiday-menu-modal-${id || 'new'}`,
      component: HolidayMenuFormModal,
      props: {
        holidayMenuId: id || null,
        holidayMenu: id ? holidayMenus.find(hm => hm.id === id) : undefined,
        onAdd: addHolidayMenu,
        onUpdate: updateHolidayMenu,
        recipes: recipeData,
        onClose: () => closeModal(`holiday-menu-modal-${id || 'new'}`)
      }
    });
  };

  // Confirmation functions for deleting holiday menus
  const [deleteHolidayMenuConfirmationId, setDeleteHolidayMenuConfirmationId] = useState<number | string | null>(null);

  const confirmHolidayMenuDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteHolidayMenuConfirmationId(id);
    }
  };

  const handleHolidayMenuDelete = () => {
    if (deleteHolidayMenuConfirmationId !== null) {
      deleteHolidayMenu(deleteHolidayMenuConfirmationId);
      setDeleteHolidayMenuConfirmationId(null);
    }
  };

  const cancelHolidayMenuDelete = () => {
    setDeleteHolidayMenuConfirmationId(null);
  };

  // CRUD functions for holiday menus
  const addHolidayMenu = async (holidayMenu: Omit<HolidayMenu, 'id' | 'dateAdded'>) => {
    try {
      // Add to store first
      await addHolidayMenuToStore(holidayMenu);

      // Get the updated holiday menus from the store to find our new entry
      setTimeout(async () => {
        const currentHolidayMenus = useStore.getState().holidayMenus;

        // Find the most recent holiday menu by dateAdded that matches our criteria
        const sortedMenus = [...currentHolidayMenus].sort((a, b) =>
          (new Date(b.dateAdded || 0).getTime()) - (new Date(a.dateAdded || 0).getTime())
        );
        const newHolidayMenu = sortedMenus[0]; // Most recent should be the one we just added

        if (newHolidayMenu &&
            newHolidayMenu.holidayName === holidayMenu.holidayName &&
            newHolidayMenu.holidayDate === holidayMenu.holidayDate) {
          await createGroceryEntriesFromHolidayMenu(newHolidayMenu);
        }
      }, 300);
    } catch (error) {
      console.error('Error adding holiday menu:', error);
    }
  };

  const updateHolidayMenu = async (id: number | string, updatedData: Partial<HolidayMenu>) => {
    try {
      await updateHolidayMenuInStore(id, updatedData);
    } catch (error) {
      console.error('Error updating holiday menu:', error);
    }
  };

  // Function to create grocery entries from holiday menu recipes
  const createGroceryEntriesFromHolidayMenu = async (holidayMenu: HolidayMenu) => {
    // Find the recipes that are part of this holiday menu
    const selectedRecipes = recipeData.filter(recipe =>
      holidayMenu.recipeIds.includes(recipe.id)
    );

    // Extract all ingredients from the selected recipes and group them
    const ingredientMap: { [key: string]: { quantity: number, unit: string } } = {};

    selectedRecipes.forEach(recipe => {
      // Split ingredients by line and process each ingredient
      const ingredientsList = recipe.ingredients.split('\n');
      ingredientsList.forEach(ingredient => {
        // Clean up extra spaces and only add non-empty ingredients
        const cleanedIngredient = ingredient.trim();
        if (cleanedIngredient) {
          const parsed = parseIngredient(cleanedIngredient);

          // Use the ingredient name as key to group similar ingredients
          if (ingredientMap[parsed.name]) {
            // If ingredient already exists, sum quantities if units match
            if (ingredientMap[parsed.name].unit === parsed.unit) {
              ingredientMap[parsed.name].quantity += parsed.quantity;
            } else {
              // If units don't match, create a new entry with original string
              const combinedKey = `${parsed.name} (${parsed.unit})`;
              if (ingredientMap[combinedKey]) {
                ingredientMap[combinedKey].quantity += parsed.quantity;
              } else {
                ingredientMap[combinedKey] = {
                  quantity: parsed.quantity,
                  unit: parsed.unit
                };
              }
            }
          } else {
            // Add new ingredient to the map
            ingredientMap[parsed.name] = {
              quantity: parsed.quantity,
              unit: parsed.unit
            };
          }
        }
      });
    });

    // Create a new grocery entry with these grouped ingredients
    if (Object.keys(ingredientMap).length > 0) {
      const groceryItems = Object.entries(ingredientMap).map(([name, data]) => {
        return {
          id: Date.now() + Math.random(), // Temporary ID
          name: name,
          category: 'Продукты',
          quantity: data.quantity,
          price: 0, // Default price, can be updated by user
          unit: data.unit,
          purchased: false,
          createdAt: new Date().toISOString().split('T')[0]
        };
      });

      // Add the grocery entry to the store
      const groceryEntry = {
        items: groceryItems,
        dateAdded: new Date().toISOString().split('T')[0],
        purchased: false,
        comment: `Список покупок для праздника: ${holidayMenu.holidayName}`
      };

      // Use the store's function to add the grocery entry
      try {
        await useStore.getState().addGroceryEntry(groceryEntry);
      } catch (error) {
        console.error('Error adding grocery entry:', error);
      }
    }
  };

  // Helper function to parse ingredient into name, quantity, and unit
  const parseIngredient = (ingredient: string) => {
    // Simple regex to extract quantity, unit, and name from ingredient
    // e.g., "2 стакана муки" -> quantity: 2, unit: "стакана", name: "муки"
    const match = ingredient.match(/^([\d.,\s]+)\s*([a-zA-Zа-яА-ЯёЁ\s-]+)\s+(.+)$/);

    if (match) {
      return {
        quantity: parseFloat(match[1].trim().replace(',', '.')) || 1,
        unit: match[2].trim(),
        name: match[3].trim()
      };
    }

    // If we can't parse it, return the full ingredient as name with default values
    return {
      quantity: 1,
      unit: '',
      name: ingredient
    };
  };

  const deleteHolidayMenu = async (id: number | string) => {
    try {
      await deleteHolidayMenuFromStore(id);
    } catch (error) {
      console.error('Error deleting holiday menu:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Рецепты</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'catalog'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('catalog')}
          >
            Каталог рецептов
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'holiday'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('holiday')}
          >
            Меню на праздник
          </button>
        </div>

        <div className="flex justify-between items-start sm:items-center">
          <h2 className="text-base sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
            {activeTab === 'catalog' ? 'Каталог рецептов' : 'Меню на праздник'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {isAdmin && activeTab === 'catalog' ? (
              <Button
                onClick={() => openRecipeFormModal()}
                variant="primary" className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {
                  !isMobile &&
                  'Добавить рецепт'
                }
              </Button>
            ) :
              <Button
                onClick={() => openHolidayMenuFormModal()}
                variant="primary"
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {
                  !isMobile &&
                  'Добавить меню'
                }
              </Button>
            }
          </div>
        </div>
      </div>

      {/* Error messages */}
      {recipeDataError && activeTab === 'catalog' && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {recipeDataError}
        </div>
      )}

      {/* Content for Catalog Tab */}
      {activeTab === 'catalog' && (
        <>
          {/* Filter Controls - Accordion */}
          <AnimatedAccordion title="Фильтры" defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название</label>
                <input
                  type="text"
                  placeholder="Фильтр по названию"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="w-56 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-56 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="" className="dark:bg-gray-700 dark:text-white">Все категории</option>
                  <option value="первое" className="dark:bg-gray-700 dark:text-white">Первое</option>
                  <option value="второе" className="dark:bg-gray-700 dark:text-white">Второе</option>
                  <option value="напитки" className="dark:bg-gray-700 dark:text-white">Напитки</option>
                  <option value="выпечка" className="dark:bg-gray-700 dark:text-white">Выпечка</option>
                  <option value="молочка" className="dark:bg-gray-700 dark:text-white">Молочка</option>
                  <option value="хлеб" className="dark:bg-gray-700 dark:text-white">Хлеб</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Поиск по ингредиентам</label>
                <input
                  type="text"
                  placeholder="Ингредиент"
                  value={ingredientFilter}
                  onChange={(e) => setIngredientFilter(e.target.value)}
                  className="w-56 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
        </>
      )}

      {/* Content for Holiday Menu Tab */}
      {activeTab === 'holiday' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {holidayMenuDataError && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {holidayMenuDataError}
            </div>
          )}

          {/* Holiday Menus List */}
          <div className="space-y-4">
            {isHolidayMenuDataLoading ? (
              <div className="py-12 text-center">
                <LoadingSpinner message="Загрузка меню на праздник..." />
              </div>
            ) : holidayMenus.length > 0 ? (
              holidayMenus.map((menu) => {
                const selectedRecipes = recipeData.filter(recipe =>
                  menu.recipeIds.includes(recipe.id)
                );

                return (
                  <div key={menu.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">{menu.holidayName}</h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{menu.holidayDate ? formatDate(menu.holidayDate) : '***'}</div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Рецепты в меню:</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedRecipes.length > 0 ? (
                              selectedRecipes.map(recipe => (
                                <span
                                  key={recipe.id}
                                  className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                                >
                                  {recipe.title}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">Нет выбранных рецептов</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Добавлено: {menu.dateAdded ? formatDate(menu.dateAdded) : '***'}
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => openHolidayMenuFormModal(menu.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                            title="Редактировать меню"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => confirmHolidayMenuDelete(menu.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs"
                            title="Удалить меню"
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Нет созданных меню для праздников</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Нажмите "Добавить" для создания первого меню</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить.</p>
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

      {/* Recipe List for Catalog Tab */}
      {activeTab === 'catalog' && (
        <AnimatedAccordion title="Рецепты" defaultOpen={true}>
          <div className="overflow-x-auto">
            {isRecipeDataLoading ? (
              <div className="py-12">
                <LoadingSpinner message="Загрузка рецептов..." />
              </div>
            ) : recipeDataError ? (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                {recipeDataError}
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden">
                  {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <div key={record.id} className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{record.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{record.category}</div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <div>Время: {record.cookingTime ? `${record.cookingTime} мин` : 'Не указано'}</div>
                            <div>Порции/штук: {record.servings || 'Не указано'}</div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-h-20 overflow-hidden">
                            <div className="truncate" title={record.ingredients}>
                              <span className="font-medium">Ингредиенты:</span> {record.ingredients.split('\n').slice(0, 3).join(', ')}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-h-10 overflow-hidden">
                            <div className="truncate" title={record.instructions}>
                              <span className="font-medium">Способ приготовления:</span> {record.instructions}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Добавлен: {record.date}
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => openRecipeFormModal(record.id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                              title="Редактировать рецепт"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(record.id);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs"
                              title="Удалить рецепт"
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Нет рецептов, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                    </div>
                  )}
                </div>

                {/* Desktop View - Table */}
                <table className="hidden md:table divide-y divide-gray-200 dark:divide-gray-700 min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Категория</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Время приготовления</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Порции/штук</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата добавления</th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredData.length > 0 ? (
                      filteredData.map((record) => (
                        <tr
                          key={record.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isAdmin ? 'cursor-pointer' : ''}`}
                          onClick={isAdmin ? () => openRecipeFormModal(record.id) : undefined}
                        >
                          <td
                            className="p-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {record.title}
                          </td>
                          <td
                            className="p-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                          >
                            {record.category}
                          </td>
                          <td
                            className="p-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                          >
                            {record.cookingTime ? `${record.cookingTime} мин` : 'Не указано'}
                          </td>
                          <td
                            className="p-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                          >
                            {record.servings || 'Не указано'}
                          </td>
                          <td
                            className="p-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
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
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
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
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
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
                        <td colSpan={isAdmin ? 6 : 5} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
      )}

      {/* Delete Confirmation Modal for Holiday Menus */}
      {isAdmin && deleteHolidayMenuConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Вы уверены, что хотите удалить это меню на праздник? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelHolidayMenuDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={handleHolidayMenuDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Recipes;