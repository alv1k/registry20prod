import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import PeriodModal from './components/PeriodModal';
import { useStore } from '../../store/useStore';

interface PeriodEvent {
  id?: string | number;
  date: string;
  description?: string;
  category?: string;
}

// Define category colors
const CATEGORY_COLORS: { [key: string]: string } = {
  'Менструация': '#ef4444', // red-500
  'Овуляция': '#3b82f6',    // blue-500
  'Предменструальный синдром': '#eab308', // yellow-500
  'Базальная температура': '#22c55e',     // green-500
  'Другое': '#6b7280'      // gray-500
};

// Function to get color for a category
const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || '#6b7280'; // default to gray if category not found
};

const Period = () => {
  const { periodData, syncPeriodData, addPeriodEvent, updatePeriodEvent, deletePeriodEvent, isPeriodDataLoading } = useStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentEvent, setCurrentEvent] = React.useState<PeriodEvent | null>(null);

  useEffect(() => {
    // Load data from Firebase when component mounts
    syncPeriodData();
  }, [syncPeriodData]);


  const handleEventClick = (arg: any) => {
    const eventId = arg.event.id;
    const event = periodData.find(e => e.id.toString() === eventId);
    setCurrentEvent(event || null);
    setIsModalOpen(true);
  };

  const handleDateClick = async () => {    
    setCurrentEvent(null);
    setIsModalOpen(true);
  }

  const handleSaveEvent = async (event: PeriodEvent) => {
    try {
      if (event.id) {
        // Обновляем существующее событие
        await updatePeriodEvent(event.id, event);
      } else {
        // Добавляем новое событие
        await addPeriodEvent({
          date: event.date,
          description: event.description,
          category: event.category
        });
      }
      setIsModalOpen(false);
      setCurrentEvent(null);
    } catch (error) {
      console.error('Error saving period event:', error);
    }
  };

  if (isPeriodDataLoading) {
    return <div>Загрузка событий...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Каталог</h1>
        <button
          onClick={() => {
            setCurrentEvent(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Добавить событие
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow w-1/2 text-xs">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ruLocale}
          events={periodData.map(e => ({
            id: typeof e.id === 'string' ? e.id : e.id.toString(),
            date: e.date,
            description: e.description,
            backgroundColor: getCategoryColor(e.category || 'Другое')
          }))}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          fixedWeekCount={false} // отображать все недели месяца
          showNonCurrentDates={true} // показывать дни из других месяцев
          eventClick={handleEventClick}
          editable={true}
          selectable={true}
        />
      </div>

      <PeriodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={deletePeriodEvent}
        event={currentEvent}
      />
    </div>
  );
}

export default Period;