import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import CategoryModal from './categoryModal';
import { useAuth } from '../../../contexts/AuthContext';

interface CategoriesManagerProps {
  onAddCategoryClick?: () => void;
}

const CategoryManager: React.FC<CategoriesManagerProps> = ({ onAddCategoryClick }) => {
  const categories = useStore((state) => state.categories);
  const syncCategories = useStore((state) => state.syncCategories);
  const deleteCategory = useStore((state) => state.deleteCategory);
  const isCategoriesLoading = useStore((state) => state.isCategoriesLoading);
  const categoriesError = useStore((state) => state.categoriesError);

  const { isAdmin } = useAuth();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);
  const [filterType] = useState<'all' | 'expense' | 'income'>('all');

  // Helper function to check if category matches filter
  const matchesFilter = (categoryType: 'expense' | 'income') => {
    return filterType === 'all' || categoryType === filterType;
  };

  useEffect(() => {
    // Load categories from Firebase when component mounts
    syncCategories().catch(error => {
      console.error('Error loading categories:', error);
    });
  }, [syncCategories]);

  const openFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedCategoryId(id);
    } else {
      setSelectedCategoryId(null);
    }
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedCategoryId(null);
  };

  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteCategory(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden">

      {/* Error message */}
      {categoriesError && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded m-4">
          {categoriesError}
        </div>
      )}
      
      <div className="overflow-x-auto">
        {/* Desktop View - Table with grouped sections when showing all categories */}
        {filterType === 'all' ? (
          <div className="hidden md:flex md:gap-5">
            {/* Expenses Section */}
            <div className="mb-8 w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded mr-2">Расходы</span>
                <span className="text-gray-600 dark:text-gray-300 text-sm">({categories.filter(c => c.type === 'expense').length} {categories.filter(c => c.type === 'expense').length === 1 ? 'категория' : categories.filter(c => c.type === 'expense').length < 5 ? 'категории' : 'категорий'})</span>
              </h3>
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Описание</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.filter(category => category.type === 'expense').length > 0 ? (
                    categories
                      .filter(category => category.type === 'expense')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td
                          className="p-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {category.name}
                        </td>
                        <td
                          className="p-4 text-sm text-gray-500 dark:text-gray-400"
                        >
                          {category.description || '-'}
                        </td>
                        {isAdmin && (
                          <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openFormModal(category.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Редактировать категорию"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(category.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Удалить категорию"
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
                      <td colSpan={isAdmin ? 3 : 2} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Нет категорий расходов.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Income Section */}
            <div className="mb-8 w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded mr-2">Доходы</span>
                <span className="text-gray-600 dark:text-gray-300 text-sm">({categories.filter(c => c.type === 'income').length} {categories.filter(c => c.type === 'income').length === 1 ? 'категория' : categories.filter(c => c.type === 'income').length < 5 ? 'категории' : 'категорий'})</span>
              </h3>
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Описание</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.filter(category => category.type === 'income').length > 0 ? (
                    categories
                      .filter(category => category.type === 'income')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td
                          className="p-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {category.name}
                        </td>
                        <td
                          className="p-4 text-sm text-gray-500 dark:text-gray-400"
                        >
                          {category.description || '-'}
                        </td>
                        {isAdmin && (
                          <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openFormModal(category.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Редактировать категорию"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(category.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Удалить категорию"
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
                      <td colSpan={isAdmin ? 3 : 2} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Нет категорий доходов.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Desktop View - Table with filtered categories
          <table className="hidden md:table w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Описание</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.filter(category => matchesFilter(category.type)).length > 0 ? (
                categories
                  .filter(category => matchesFilter(category.type))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td
                      className="p-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {category.name}
                    </td>
                    <td
                      className="p-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.type === 'expense'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {category.type === 'expense' ? 'Расход' : 'Доход'}
                      </span>
                    </td>
                    <td
                      className="p-4 text-sm text-gray-500 dark:text-gray-400"
                    >
                      {category.description || '-'}
                    </td>
                    {isAdmin && (
                      <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openFormModal(category.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Редактировать категорию"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(category.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Удалить категорию"
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
                  <td colSpan={isAdmin ? 4 : 3} className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Нет категорий. {isCategoriesLoading ? 'Загрузка...' : 'Добавьте первую категорию.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        {/* Mobile View - Card Layout for grouped sections when showing all categories */}
        <div className="block md:hidden divide-y divide-gray-200">
          {filterType === 'all' ? (
            <div>
              {/* Expenses Section */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded mr-2">Расходы</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">({categories.filter(c => c.type === 'expense').length} {categories.filter(c => c.type === 'expense').length === 1 ? 'категория' : categories.filter(c => c.type === 'expense').length < 5 ? 'категории' : 'категорий'})</span>
                </h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.filter(category => category.type === 'expense').length > 0 ? (
                    categories
                      .filter(category => category.type === 'expense')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                      <div key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {category.description || <span className="italic dark:text-gray-500">Без описания</span>}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="ml-4 flex-shrink-0">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openFormModal(category.id)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Редактировать категорию"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => confirmDelete(category.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Удалить категорию"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Нет категорий расходов.
                    </div>
                  )}
                </div>
              </div>

              {/* Income Section */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded mr-2">Доходы</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">({categories.filter(c => c.type === 'income').length} {categories.filter(c => c.type === 'income').length === 1 ? 'категория' : categories.filter(c => c.type === 'income').length < 5 ? 'категории' : 'категорий'})</span>
                </h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.filter(category => category.type === 'income').length > 0 ? (
                    categories
                      .filter(category => category.type === 'income')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                      <div key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {category.description || <span className="italic dark:text-gray-500">Без описания</span>}
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="ml-4 flex-shrink-0">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openFormModal(category.id)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Редактировать категорию"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => confirmDelete(category.id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Удалить категорию"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Нет категорий доходов.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Mobile View - Card Layout with filtered categories
            categories
              .filter(category => matchesFilter(category.type))
              .length > 0 ? (
              categories
                .filter(category => matchesFilter(category.type))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                <div key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.type === 'expense'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {category.type === 'expense' ? 'Расход' : 'Доход'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {category.description || <span className="italic dark:text-gray-500">Без описания</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openFormModal(category.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Редактировать категорию"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmDelete(category.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Удалить категорию"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Нет категорий. {isCategoriesLoading ? 'Загрузка...' : 'Добавьте первую категорию.'}
              </div>
            )
          )}
        </div>
      </div>
      
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isAdmin && (
        <CategoryModal 
          isOpen={isFormModalOpen} 
          onClose={closeFormModal} 
          recordId={selectedCategoryId} 
          onAdd={(newCategory) => {
            // Это будет реализовано через вызов store функции из родительского компонента
          }}
          onUpdate={(id, updatedFields) => {
            // Это будет реализовано через вызов store функции из родительского компонента
          }}
        />
      )}
    </div>
  );
};

export default CategoryManager;