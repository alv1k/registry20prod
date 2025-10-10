import { useState, useEffect, ReactNode } from 'react';

interface GenericViewEditModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
  records: T[];
  onUpdate: (id: number, updatedRecord: Partial<T>) => void;
  renderViewMode: (record: T) => ReactNode;
  renderEditMode: (record: T, formData: any, handleChange: (field: keyof T, value: any) => void) => ReactNode;
  title?: string;
}

const GenericViewEditModal = <T extends { id: number }>({
  isOpen,
  onClose,
  recordId,
  records,
  onUpdate,
  renderViewMode,
  renderEditMode,
  title = "Детали записи"
}: GenericViewEditModalProps<T>) => {
  const [record, setRecord] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>({});

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
      setFormData({});
    }
  }, [recordId, records]);

  if (!isOpen || recordId === null || record === null) return null;

  const handleSave = () => {
    if (recordId && record) {
      onUpdate(recordId, formData);
      setIsEditing(false);
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
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Сохранить
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