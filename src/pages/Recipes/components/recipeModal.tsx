import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { RECIPE_CATEGORIES } from '../../../firebase/services/recipeService';

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

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  record?: RecipeRecord | null;
  onAdd: (record: Omit<RecipeRecord, 'id'>) => void;
  onUpdate: (id: number | string, record: Partial<RecipeRecord>) => void;
}

const RecipeModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  onClose,
  recordId,
  record,
  onAdd,
  onUpdate
}) => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [ingredients, setIngredients] = useState<string>('');
  const [ingredientToAdd, setIngredientToAdd] = useState<string>('');
  const [ingredientAmount, setIngredientAmount] = useState<string>('');
  const [ingredientUnit, setIngredientUnit] = useState<string>(''); // единица измерения
  const [ingredientsList, setIngredientsList] = useState<Array<{name: string, amount: string, unit: string}>>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [cookingTime, setCookingTime] = useState<number | undefined>(undefined);
  const [servings, setServings] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Load record data if editing
  useEffect(() => {
    if (recordId && record && isOpen) {
      // Load existing record data for editing
      setTitle(record.title || '');
      setCategory(record.category || '');
      setIngredients(record.ingredients || '');
      setInstructions(record.instructions || '');
      setCookingTime(record.cookingTime || undefined);
      setServings(record.servings || undefined);
      setTags(record.tags ? record.tags.join(', ') : '');

      // Parse ingredients if they exist in the old format
      if (record.ingredients) {
        const parsedIngredients = record.ingredients.split('\n').filter(line => line.trim() !== '');
        const newIngredientsList = parsedIngredients.map(ingredient => {
          // Try to parse amount and unit from ingredient string
          const match = ingredient.match(/^([\d.,\s]+)([a-zA-Zа-яА-ЯёЁ\s]+)$/);
          if (match) {
            return {
              name: match[2].trim(),
              amount: match[1].trim(),
              unit: '' // We'll need to handle units differently
            };
          } else {
            return {
              name: ingredient,
              amount: '',
              unit: ''
            };
          }
        });
        setIngredientsList(newIngredientsList);
      }
    } else if (isOpen) {
      // Reset form for new records
      setTitle('');
      setCategory('');
      setIngredients('');
      setInstructions('');
      setCookingTime(undefined);
      setServings(undefined);
      setTags('');
      setIngredientsList([]);
    }
  }, [recordId, record, isOpen]);

  // Function to add ingredient to the list
  const addIngredientToList = () => {
    if (ingredientToAdd.trim() === '') {
      alert('Пожалуйста, введите название ингредиента');
      return;
    }

    // Validate amount format (number with up to 2 decimal places)
    if (ingredientAmount && isNaN(parseFloat(ingredientAmount))) {
      alert('Количество должно быть числом');
      return;
    }

    // Add to the list
    const newIngredient = {
      name: ingredientToAdd.trim(),
      amount: ingredientAmount,
      unit: ingredientUnit
    };

    setIngredientsList([...ingredientsList, newIngredient]);

    // Clear the input fields
    setIngredientToAdd('');
    setIngredientAmount('');
    setIngredientUnit('');
  };

  // Function to remove ingredient from the list
  const removeIngredient = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine ingredients list into a single string
    const ingredientsString = ingredientsList.map(ing => {
      let result = '';
      if (ing.amount) {
        result += ing.amount;
      }
      if (ing.unit) {
        result += ' ' + ing.unit;
      }
      if (result) {
        result += ' - ';
      }
      result += ing.name;
      return result;
    }).join('\n');

    // Validate required fields
    if (!title || !category || !ingredientsString || !instructions) {
      alert('Пожалуйста, заполните все обязательные поля: название, категория, ингредиенты, способ приготовления');
      return;
    }

    // Process tags
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const recordData: Omit<RecipeRecord, 'id'> = {
      title,
      category,
      ingredients: ingredientsString,
      instructions,
      cookingTime,
      servings,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      date: new Date().toISOString().split('T')[0] // Current date
    };

    if (recordId) {
      onUpdate(recordId, recordData);
    } else {
      onAdd(recordData);
    }

    // Reset form
    setTitle('');
    setCategory('');
    setIngredients('');
    setInstructions('');
    setCookingTime(undefined);
    setServings(undefined);
    setTags('');
    setIngredientsList([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordId ? "Редактировать рецепт" : "Добавить рецепт"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название рецепта *</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: Борщ украинский"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              <option value="">Выберите категорию</option>
              {RECIPE_CATEGORIES.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Время приготовления (минуты)</label>
            <input
              type="number"
              name="cookingTime"
              value={cookingTime || ''}
              onChange={(e) => setCookingTime(e.target.value ? Number(e.target.value) : undefined)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Время в минутах"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество порций/штук</label>
            <input
              type="number"
              name="servings"
              value={servings || ''}
              onChange={(e) => setServings(e.target.value ? Number(e.target.value) : undefined)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Количество порций/штук"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ингредиенты *</label>
            <div className="mb-2">
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="text"
                  value={ingredientToAdd}
                  onChange={(e) => setIngredientToAdd(e.target.value)}
                  className="col-span-5 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Название ингредиента"
                />
                <input
                  type="number"
                  step="0.01"
                  value={ingredientAmount}
                  onChange={(e) => setIngredientAmount(e.target.value)}
                  className="col-span-3 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Количество"
                />
                <input
                  type="text"
                  value={ingredientUnit}
                  onChange={(e) => setIngredientUnit(e.target.value)}
                  className="col-span-3 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Ед. изм."
                />
                <button
                  type="button"
                  onClick={addIngredientToList}
                  className="col-span-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  +
                </button>
              </div>

              {/* List of added ingredients */}
              {ingredientsList.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto">
                  {ingredientsList.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center p-1 hover:bg-gray-50">
                      <span>
                        {ingredient.amount && <>{ingredient.amount} {ingredient.unit && ingredient.unit + ' - '}</>}
                        {ingredient.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Способ приготовления *</label>
            <textarea
              name="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Опишите шаги приготовления"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Теги</label>
            <input
              type="text"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Теги через запятую (например: быстрый, праздничный, вегетарианский)"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {recordId ? 'Сохранить изменения' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RecipeModal;