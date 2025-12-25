import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { AppGroceryEntry, AppGroceryItem } from '../../../store/useStore';
import useIsMobile from '../../../hooks/useIsMobile';

const PlusIcon = FiPlus as React.FC<React.SVGProps<SVGSVGElement>>;
const Trash2Icon = FiTrash2 as React.FC<React.SVGProps<SVGSVGElement>>;
const Edit2Icon = FiEdit2 as React.FC<React.SVGProps<SVGSVGElement>>;

interface SingleGroceryFormValues {
  name: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  actualExpense?: number | null;
}

interface MultipleGroceryFormValues {
  items: { name: string; category: string; quantity: number; price: number; unit: string; actualExpense?: number | null }[];
  comment?: string;
}

interface GroceriesManagerProps {
  onAddGroceryClick?: () => void;
  onRegisterOpenForm?: (func: () => void) => void; // Function to register the open form function
}

const GroceryListManager: React.FC<GroceriesManagerProps> = ({ onAddGroceryClick, onRegisterOpenForm }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [groceryEntries, setGroceryEntries] = useState<AppGroceryEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGroceryEntry, setCurrentGroceryEntry] = useState<AppGroceryEntry | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  // Get grocery data from store (create this store functionality if it doesn't exist)
  const storedGroceryEntries = useStore(state => state.groceryEntries) || [];
  const addGroceryEntry = useStore(state => state.addGroceryEntry);
  const updateGroceryEntry = useStore(state => state.updateGroceryEntry);
  const deleteGroceryEntry = useStore(state => state.deleteGroceryEntry);
  const syncGroceryEntries = useStore(state => state.syncGroceryEntries);
  const categories = useStore(state => state.categories) || [];
  const syncCategories = useStore(state => state.syncCategories);
  
  const isMobile = useIsMobile();

  // Load categories and grocery entries on component mount
  useEffect(() => {
    syncCategories().catch(error => {
      console.error('Error loading categories:', error);
    });

    syncGroceryEntries().catch(error => {
      console.error('Error loading grocery entries:', error);
    });
  }, [syncCategories, syncGroceryEntries]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(idTokenResult.claims.admin === true || user.uid === 'Rz9j7obzy7SBydiuF3VdRSuE1Ge2');
        } catch (error) {
          console.error('Error checking admin status:', error);
          // As a fallback, check if it's the specific UID
          setIsAdmin(user.uid === 'Rz9j7obzy7SBydiuF3VdRSuE1Ge2');
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    // Set initial grocery entries from store
    setGroceryEntries(storedGroceryEntries);
  }, [storedGroceryEntries]);

  const handleAddGrocery = (values: SingleGroceryFormValues) => {
    const newItem: AppGroceryItem = {
      id: Date.now().toString(),
      name: values.name,
      category: values.category,
      quantity: values.quantity || 1,
      price: values.price || 0,
      unit: values.unit || 'шт',
      purchased: false,
      createdAt: new Date().toISOString(),
      actualExpense: values.actualExpense !== undefined && values.actualExpense !== null ? values.actualExpense : null
    };

    // Create a grocery entry with a single item
    const newEntry: AppGroceryEntry = {
      id: Date.now(),
      items: [newItem],
      dateAdded: new Date().toISOString(),
      purchased: false,
      comment: `Single item: ${newItem.name}`
    };

    addGroceryEntry(newEntry);
    setIsModalOpen(false);
    setCurrentGroceryEntry(null);
  };

  const handleAddMultipleGroceries = (values: MultipleGroceryFormValues) => {
    const items: AppGroceryItem[] = [];
    values.items.forEach((item, index) => {
      if (item.name.trim()) {
        const newItem: AppGroceryItem = {
          id: `${Date.now()}-${index}`, // Ensure unique ID
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1, // Use provided quantity or default to 1
          price: item.price || 0, // Use provided price or default to 0
          unit: item.unit || 'шт', // Use provided unit or default to 'шт'
          purchased: false,
          createdAt: new Date().toISOString(),
          actualExpense: item.actualExpense !== undefined && item.actualExpense !== null ? item.actualExpense : null
        };
        items.push(newItem);
      }
    });

    // Create a single grocery entry with all the items
    const newEntry: AppGroceryEntry = {
      id: Date.now(),
      items: items,
      dateAdded: new Date().toISOString(),
      purchased: false,
      comment: values.comment || `Added ${items.length} item(s)`
    };

    addGroceryEntry(newEntry);
    setIsModalOpen(false);
    setCurrentGroceryEntry(null);
  };

  const handleUpdateGroceryEntry = (values: MultipleGroceryFormValues) => {
    if (!currentGroceryEntry) return;

    const updatedItems: AppGroceryItem[] = values.items.map((item, index) => {
      const existingItem = currentGroceryEntry.items[index];
      return {
        id: existingItem?.id || `${Date.now()}-${index}`,
        name: item.name,
        category: item.category,
        quantity: item.quantity || 1,
        price: item.price || 0,
        unit: item.unit || 'шт',
        purchased: existingItem?.purchased || false,
        createdAt: existingItem?.createdAt || new Date().toISOString(),
        actualExpense: item.actualExpense !== undefined && item.actualExpense !== null ? item.actualExpense : null
      };
    });

    const updatedEntry: AppGroceryEntry = {
      ...currentGroceryEntry,
      items: updatedItems,
      comment: values.comment || `Updated entry with ${updatedItems.length} item(s)`
    };

    updateGroceryEntry(currentGroceryEntry.id, updatedEntry);
    setIsModalOpen(false);
    setCurrentGroceryEntry(null);
  };

  const handleFormSubmit = (values: SingleGroceryFormValues | MultipleGroceryFormValues) => {
    if (currentGroceryEntry) {
      // Editing an existing entry - it should be a multiple values form
      handleUpdateGroceryEntry(values as MultipleGroceryFormValues);
    } else {
      // Adding a new entry - check if it's single or multiple
      if ('name' in values) {
        // This is a single grocery form
        handleAddGrocery(values as SingleGroceryFormValues);
      } else {
        // This is a multiple grocery form
        handleAddMultipleGroceries(values as MultipleGroceryFormValues);
      }
    }
  };

  const handleEdit = (entry: AppGroceryEntry) => {
    setCurrentGroceryEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number | string) => {
    deleteGroceryEntry(id);
    setDeleteConfirmationId(null);
  };

  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  const togglePurchaseStatus = (id: number | string) => {
    const entry = groceryEntries.find(entry => entry.id === id);
    if (entry) {
      const updatedEntry: AppGroceryEntry = {
        ...entry,
        purchased: !entry.purchased,
        items: entry.items.map(item => ({
          ...item,
          purchased: !entry.purchased
        }))
      };
      updateGroceryEntry(id, updatedEntry);
    }
  };

  const toggleItemPurchaseStatus = (entryId: number | string, itemId: string | number) => {
    const entry = groceryEntries.find(entry => entry.id === entryId);
    if (entry) {
      const updatedEntry: AppGroceryEntry = {
        ...entry,
        items: entry.items.map(item =>
          item.id === itemId ? { ...item, purchased: !item.purchased } : item
        ),
        purchased: entry.items.every(item => item.purchased) // Update entry's purchased status if all items are purchased
      };
      updateGroceryEntry(entryId, updatedEntry);
    }
  };

  // Function to open the grocery list form modal
  const openGroceryListFormModal = () => {
    setCurrentGroceryEntry(null);
    setIsModalOpen(true);
  };

  // Register the function with the parent when component mounts
  React.useEffect(() => {
    if (onRegisterOpenForm) {
      onRegisterOpenForm(openGroceryListFormModal);
    }

    // Cleanup function registration on unmount
    return () => {
      if (onRegisterOpenForm) {
        onRegisterOpenForm(() => {}); // Reset to empty function
      }
    };
  }, [onRegisterOpenForm, openGroceryListFormModal]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm">
        {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Button that was moved to Finance index page */}
            </div>
        )}

      <div className="p-6">
        {groceryEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Список покупок пуст
          </div>
        ) : (
          <div className="space-y-3">
            {groceryEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border ${entry.purchased ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={entry.purchased}
                      onChange={() => togglePurchaseStatus(entry.id)}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500 dark:bg-gray-700"
                    />
                    <div className="ml-4">
                      <div className={`font-medium ${entry.purchased ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {
                          !isMobile &&
                          'Запись покупок от '
                        }
                        {new Date(entry.dateAdded).toLocaleDateString('ru-RU')}
                      </div>
                      {entry.comment && !isMobile && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.comment}
                        </div>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Редактировать"
                      >
                        <Edit2Icon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(entry.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Удалить"
                      >
                        <Trash2Icon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Display all items in this entry */}
                {/* Header row with column titles */}
                <div className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded-t-md mb-1">
                  <div className="col-span-3 text-sm font-medium text-gray-700 dark:text-gray-300">Название</div>
                  {
                    !isMobile &&
                    <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Кол-во</div>
                  }
                  {
                    !isMobile &&
                    <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Категория</div>
                  }
                  {
                    !isMobile &&
                    <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">Цена/ед</div>
                  }
                  {
                    !isMobile &&
                    <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Стоимость</div>
                  }
                  {
                    !isMobile &&
                    <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Факт. расход</div>
                  }
                </div>

                <div className={` ${isMobile ? 'ml-2' : 'ml-8'} space-y-1`}>
                  {entry.items.map((item, index) => {
                    const totalPrice = item.quantity * item.price;
                    const actualExpense = item.actualExpense !== undefined ? item.actualExpense : null;
                    return (
                      <div key={item.id || index} className="grid grid-cols-12 gap-2 py-1">
                        <div className={`${isMobile ? 'col-span-12' : 'col-span-3'} gap-2 flex items-center`}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.purchased}
                              onChange={() => toggleItemPurchaseStatus(entry.id, item.id)}
                              className="h-5 w-5 text-green-600 rounded focus:ring-green-500 dark:bg-gray-700 mr-2"
                            />
                            <span className={`font-medium ${item.purchased ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {item.name}
                            </span>
                          </label>
                        </div>
                        {
                          !isMobile &&
                          <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} {item.unit}
                          </div>
                        }
                        {
                          !isMobile &&
                          <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                            {item.category}
                          </div>
                        }
                        {
                          !isMobile &&
                          <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.price.toLocaleString()} ₽/ед
                          </div>
                        }
                        {
                          !isMobile &&
                          <div className="col-span-2 text-sm font-medium text-green-600 dark:text-green-400">
                            {totalPrice.toLocaleString()} ₽
                          </div>
                        }
                        {
                          !isMobile &&
                          <div className="col-span-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                            {item.actualExpense !== null && item.actualExpense !== undefined ? `${item.actualExpense.toLocaleString()} ₽` : '-'}
                          </div>
                        }
                      </div>
                    );
                  })}
                  {/* Total sum for this entry */}
                  {
                    !isMobile &&
                    <div className="grid grid-cols-12 gap-2 py-2 border-t border-gray-200 dark:border-gray-700 mt-1">
                      <div className="col-span-8 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Общая сумма:
                      </div>
                      <div className="col-span-2 text-sm font-bold text-green-700 dark:text-green-400">
                        {entry.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()} ₽
                      </div>
                      <div className="col-span-2 text-sm font-bold text-blue-700 dark:text-blue-400">
                        {entry.items.reduce((sum, item) => sum + ((item.actualExpense !== null && item.actualExpense !== undefined) ? item.actualExpense : 0), 0).toLocaleString()} ₽
                      </div>
                    </div>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <GroceryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentGroceryEntry(null);
          }}
          groceryEntry={currentGroceryEntry}
          onSubmit={handleFormSubmit}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <Modal
          isOpen={!!deleteConfirmationId}
          onClose={cancelDelete}
          title="Подтверждение удаления"
        >
          <div className="p-1">
            <p className="text-gray-600 dark:text-gray-300 mb-6">Вы уверены, что хотите удалить этот элемент списка покупок? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <Button onClick={cancelDelete} variant="secondary">
                Отмена
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirmationId)}
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Grocery Modal Component
interface GroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SingleGroceryFormValues | MultipleGroceryFormValues) => void;
  groceryEntry?: AppGroceryEntry | null;
  isMultipleMode?: boolean;
  categories?: { id: string | number; name: string; type: 'expense' | 'income' }[];
}

const GroceryModal: React.FC<GroceryModalProps> = ({ isOpen, onClose, onSubmit, groceryEntry, isMultipleMode = true, categories = [] }) => {
  const [singleValues, setSingleValues] = useState<SingleGroceryFormValues>({
    name: groceryEntry?.items?.[0]?.name || '',
    category: groceryEntry?.items?.[0]?.category || '',
    quantity: groceryEntry?.items?.[0]?.quantity || 1,
    price: groceryEntry?.items?.[0]?.price || 0,
    unit: groceryEntry?.items?.[0]?.unit || 'шт',
    actualExpense: groceryEntry?.items?.[0]?.actualExpense
  });

  const [multipleValues, setMultipleValues] = useState<MultipleGroceryFormValues>({
    items: groceryEntry?.items?.map(item => ({ name: item.name, category: item.category, quantity: item.quantity, price: item.price, unit: item.unit, actualExpense: item.actualExpense })) || [{ name: '', category: '', quantity: 1, price: 0, unit: 'шт', actualExpense: undefined }],
    comment: groceryEntry?.comment || ''
  });

  const [errors, setErrors] = useState<Record<string, string> | Record<number, Record<string, string>>>({});

  useEffect(() => {
    if (groceryEntry) {
      // Editing an existing entry
      setSingleValues({
        name: groceryEntry.items?.[0]?.name || '',
        category: groceryEntry.items?.[0]?.category || '',
        quantity: groceryEntry.items?.[0]?.quantity || 1,
        price: groceryEntry.items?.[0]?.price || 0,
        unit: groceryEntry.items?.[0]?.unit || 'шт'
      });

      setMultipleValues({
        items: groceryEntry.items.map(item => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          actualExpense: item.actualExpense
        })) || [{ name: '', category: '', quantity: 1, price: 0, unit: 'шт', actualExpense: undefined }],
        comment: groceryEntry.comment || ''
      });
    } else {
      // Adding a new entry
      setSingleValues({
        name: '',
        category: '',
        quantity: 1,
        price: 0,
        unit: 'шт',
        actualExpense: undefined
      });
      setMultipleValues({
        items: [{ name: '', category: '', quantity: 1, price: 0, unit: 'шт', actualExpense: undefined }],
        comment: ''
      });
    }
  }, [groceryEntry, isOpen]);

  const validateSingle = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!singleValues.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (!singleValues.category.trim()) {
      newErrors.category = 'Категория обязательна';
    }

    if (singleValues.quantity <= 0) {
      newErrors.quantity = 'Количество должно быть больше 0';
    }

    if (singleValues.price < 0) {
      newErrors.price = 'Цена не может быть отрицательной';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMultiple = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    multipleValues.items.forEach((item, index) => {
      if (item.name.trim() || item.category.trim()) { // Only validate if there's content
        const itemErrors: Record<string, string> = {};
        if (!item.name.trim()) {
          itemErrors.name = 'Название обязательно';
          isValid = false;
        }
        if (!item.category.trim()) {
          itemErrors.category = 'Категория обязательна';
          isValid = false;
        }
        if (item.quantity <= 0) {
          itemErrors.quantity = 'Количество должно быть больше 0';
          isValid = false;
        }
        if (item.price < 0) {
          itemErrors.price = 'Цена не может быть отрицательной';
          isValid = false;
        }
        if (Object.keys(itemErrors).length > 0) {
          newErrors[index] = itemErrors;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddItemRow = () => {
    setMultipleValues({
      ...multipleValues,
      items: [...multipleValues.items, { name: '', category: '', quantity: 1, price: 0, unit: 'шт', actualExpense: undefined }]
    });
  };

  const handleRemoveItemRow = (index: number) => {
    if (multipleValues.items.length > 1) {
      const newItems = [...multipleValues.items];
      newItems.splice(index, 1);
      setMultipleValues({ items: newItems });
    }
  };

  const handleMultipleChange = (index: number, field: 'name' | 'category' | 'quantity' | 'unit' | 'price' | 'actualExpense', value: string | number | null) => {
    const newItems = [...multipleValues.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setMultipleValues({ ...multipleValues, items: newItems });
  };

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSingleValues(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMultipleValues(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateMultiple()) {
      onSubmit(multipleValues);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={groceryEntry ? 'Редактировать запись покупок' : 'Добавить запись покупок'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Always use multiple items form since we're grouping items into entries */}
        <div>
          {/* Header row with column titles */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-2 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="col-span-3 text-sm font-medium text-gray-700 dark:text-gray-300">Название *</div>
            <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Категория *</div>
            <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">Кол-во *</div>
            <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">Ед.</div>
            <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">Цена за ед./кг</div>
            <div className="col-span-2 text-sm font-medium text-gray-700 dark:text-gray-300">Стоимость</div>
            <div className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">Факт. расход</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-3 mb-4">
            {multipleValues.items.map((item, index) => {
              // Calculate total price based on quantity and price per unit
              const totalPrice = (item.quantity || 0) * (item.price || 0);

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleMultipleChange(index, 'name', e.target.value)}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        (errors as Record<number, Record<string, string>>)[index]?.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Название продукта"
                    />
                    {(errors as Record<number, Record<string, string>>)[index]?.name && (
                      <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {(errors as Record<number, Record<string, string>>)[index]?.name}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <select
                      value={item.category}
                      onChange={(e) => handleMultipleChange(index, 'category', e.target.value)}
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        (errors as Record<number, Record<string, string>>)[index]?.category ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="" className="dark:bg-gray-700 dark:text-white">Выберите категорию</option>
                      {categories
                        .filter(cat => cat.type === 'expense') // Only show expense categories
                        .map(category => (
                          <option key={category.id} value={category.name} className="dark:bg-gray-700 dark:text-white">
                            {category.name}
                          </option>
                        ))}
                    </select>
                    {(errors as Record<number, Record<string, string>>)[index]?.category && (
                      <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {(errors as Record<number, Record<string, string>>)[index]?.category}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleMultipleChange(index, 'quantity', Number(e.target.value))}
                      min="1"
                      className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        (errors as Record<number, Record<string, string>>)[index]?.quantity ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Количество"
                    />
                    {(errors as Record<number, Record<string, string>>)[index]?.quantity && (
                      <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {(errors as Record<number, Record<string, string>>)[index]?.quantity}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1">
                    <select
                      value={item.unit}
                      onChange={(e) => handleMultipleChange(index, 'unit', e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="шт" className="dark:bg-gray-700 dark:text-white">шт</option>
                      <option value="кг" className="dark:bg-gray-700 dark:text-white">кг</option>
                      <option value="г" className="dark:bg-gray-700 dark:text-white">г</option>
                      <option value="л" className="dark:bg-gray-700 dark:text-white">л</option>
                      <option value="мл" className="dark:bg-gray-700 dark:text-white">мл</option>
                      <option value="уп" className="dark:bg-gray-700 dark:text-white">уп</option>
                      <option value="пак" className="dark:bg-gray-700 dark:text-white">пак</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleMultipleChange(index, 'price', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Цена за ед."
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                      {totalPrice.toLocaleString()} ₽
                    </div>
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.actualExpense !== undefined && item.actualExpense !== null ? item.actualExpense : ''}
                      onChange={(e) => handleMultipleChange(index, 'actualExpense', e.target.value ? Number(e.target.value) : null)}
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Факт. расход"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    {multipleValues.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddItemRow}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            + Добавить еще продукт
          </button>

          {/* Comment field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Комментарий
            </label>
            <textarea
              value={multipleValues.comment || ''}
              onChange={handleCommentChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Комментарий к записи покупок"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary">
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {groceryEntry ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroceryListManager;