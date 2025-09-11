import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { NewVisitModal } from './NewVisitModal';
import { VisitModal } from './VisitModal';
import { useVisits, Visit } from '../../hooks/useVisits';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Visit;
}

export function CalendarView() {
  const { visits, loading, error, createVisit, updateVisit } = useVisits();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const calendarEvents = visits.map((visit) => {
      const startDate = new Date(visit.scheduled_date);
      const endDate = new Date(startDate.getTime() + visit.duration_minutes * 60000);
      
      return {
        id: visit.id,
        title: visit.title,
        start: startDate,
        end: endDate,
        resource: visit,
      };
    });
    
    setEvents(calendarEvents);
  }, [visits]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setShowNewVisitModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedVisit(event.resource);
  };

  const handleNewVisit = async (newVisitData: Omit<Visit, 'id' | 'created_at' | 'updated_at' | 'institution_id' | 'lead_name' | 'lead_phone' | 'lead_email'>) => {
    try {
      await createVisit(newVisitData);
    } catch (error) {
      console.error('Erro ao criar visita:', error);
      alert('Erro ao agendar visita. Tente novamente.');
    }
  };

  const handleUpdateVisit = async (updatedVisit: Visit) => {
    try {
      await updateVisit(updatedVisit.id, updatedVisit);
    } catch (error) {
      console.error('Erro ao atualizar visita:', error);
      alert('Erro ao atualizar visita. Tente novamente.');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#6366f1';
    let borderColor = '#6366f1';
    
    switch (event.resource.status) {
      case 'completed':
        backgroundColor = '#10b981';
        borderColor = '#10b981';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        borderColor = '#ef4444';
        break;
      case 'no_show':
        backgroundColor = '#f59e0b';
        borderColor = '#f59e0b';
        break;
      default:
        backgroundColor = '#8b5cf6';
        borderColor = '#8b5cf6';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: `2px solid ${borderColor}`,
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
      },
    };
  };

  const getStatusStats = () => {
    const stats = {
      scheduled: visits.filter(v => v.status === 'scheduled').length,
      completed: visits.filter(v => v.status === 'completed').length,
      cancelled: visits.filter(v => v.status === 'cancelled').length,
      no_show: visits.filter(v => v.status === 'no_show').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
          Erro ao carregar visitas: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Calendário de Visitas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie e acompanhe todas as visitas agendadas
            </p>
          </div>
          <button
            onClick={() => setShowNewVisitModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Visita
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Agendadas</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.scheduled}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                <EyeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Concluídas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Canceladas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl">
                <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {visits.length > 0 ? Math.round((stats.completed / visits.length) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              messages={{
                next: 'Próximo',
                previous: 'Anterior',
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Não há eventos neste período',
                showMore: (total) => `+ ${total} mais`,
              }}
              formats={{
                monthHeaderFormat: (date, culture, localizer) =>
                  localizer?.format(date, 'MMMM yyyy', culture) || '',
                dayHeaderFormat: (date, culture, localizer) =>
                  localizer?.format(date, 'EEEE dd/MM', culture) || '',
                dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                  `${localizer?.format(start, 'dd/MM', culture)} - ${localizer?.format(end, 'dd/MM', culture)}`,
              }}
            />
          </div>
        </div>
      </div>

      {showNewVisitModal && (
        <NewVisitModal
          onClose={() => {
            setShowNewVisitModal(false);
            setSelectedSlot(null);
          }}
          onSave={handleNewVisit}
          initialDate={selectedSlot?.start}
        />
      )}

      {selectedVisit && (
        <VisitModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onUpdate={handleUpdateVisit}
        />
      )}
    </>
  );
}
