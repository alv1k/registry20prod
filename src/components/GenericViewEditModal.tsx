import { useState, useEffect, ReactNode } from 'react';

interface GenericViewEditModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | string | null;
  records: T[];
  onUpdate: (id: number | string, updatedRecord: Partial<T>) => void | Promise<void>;
  renderViewMode: (record: T) => ReactNode;
  renderEditMode: (record: T, formData: any, handleChange: (field: keyof T, value: any) => void) => ReactNode;
  title?: string;
  preProcessFormData?: (record: T | null, formData: Partial<T>) => Partial<T>;
}

const GenericViewEditModal = <T extends { id: number | string }>({
  isOpen,
  onClose,
  recordId,
  records,
  onUpdate,
  renderViewMode,
  renderEditMode,
  title = "Детали записи",
  preProcessFormData
}: GenericViewEditModalProps<T>) => {
  const [record, setRecord] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load record data when recordId changes
  useEffect(() => {
    if (recordId !== null) {
      const foundRecord = records.find(r => r.id === recordId);
      if (foundRecord) {
        setRecord(foundRecord);
        setFormData(foundRecord);
      }
    } else {
      setRecord(null);
      let initialFormData = {};
      if (preProcessFormData) {
        initialFormData = preProcessFormData(null, {});
      }
      setFormData(initialFormData);
      // When creating a new record (recordId is null), start in edit mode
      setIsEditing(true);
    }
  }, [recordId, records, preProcessFormData]);

  if (!isOpen) return null;

  // For new records (recordId is null), we show the edit form directly
  if (recordId === null) {
    const handleSave = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = onUpdate(-1, formData); // Use -1 as a placeholder for new records
        if (result instanceof Promise) {
          await result;
        }
        setFormData({}); // Reset form data after saving
        setIsEditing(false);
        onClose();
      } catch (err) {
        setError((err as Error).message || 'Ошибка при сохранении');
      } finally {
        setLoading(false);
      }
    };

    const handleChange = (field: keyof T, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      } as Partial<T>));
    };

    const handleCancelEdit = () => {
      setFormData({});
      setIsEditing(false);
      onClose();
    };

    // For new records, we'll use an empty/initial record for the renderEditMode function
    // Since we're in edit mode, we'll always render the edit form
    const emptyRecord = {} as T;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {title}
            </h2>
            <button 
              onClick={handleCancelEdit}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {renderEditMode(emptyRecord, formData, handleChange)}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // For existing records
  if (record === null) {
    // Record with specific ID not found
    return null;
  }

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      if (recordId && record) {
        const result = onUpdate(recordId, formData);
        if (result instanceof Promise) {
          await result;
        }
        setIsEditing(false);
      }
    } catch (err) {
      setError((err as Error).message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    } as Partial<T>));
  };

  const handleCancelEdit = () => {
    if (record) {
      setFormData(record);
    }
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
          <button 
            onClick={() => {
              if (isEditing) {
                if (record) {
                  setFormData(record);
                }
                setIsEditing(false);
              }
              onClose();
            }}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {isEditing ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {renderEditMode(record, formData, handleChange)}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {renderViewMode(record)}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Редактировать
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericViewEditModal;