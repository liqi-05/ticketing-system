import React, { useState, useEffect } from 'react';
import { Users, Clock, Ticket, ArrowRight } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  totalSeats: number;
  saleStartTime: string;
  isActive: boolean;
}

interface EventsListProps {
  onSelectEvent: (eventId: string) => void;
}

export const EventsList: React.FC<EventsListProps> = ({ onSelectEvent }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.map((e: any) => ({
            id: e.id,
            name: e.name,
            totalSeats: e.totalSeats,
            saleStartTime: e.saleStartTime,
            isActive: e.isActive,
            availableSeats: e.availableSeats
          })));
        } else {
          // Fallback to sample data if API fails
          setEvents([
            {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Summer Concert 2024',
              totalSeats: 1000,
              saleStartTime: new Date().toISOString(),
              isActive: true
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to sample data
        setEvents([
          {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Summer Concert 2024',
            totalSeats: 1000,
            saleStartTime: new Date().toISOString(),
            isActive: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-black dark:text-white mb-6">Available Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border-2 border-black shadow-neo p-6 rounded-xl hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all dark:bg-dark-card dark:border-dark-border dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pastel-yellow p-2 rounded-full dark:bg-galaxy-purple/20">
                <Ticket className="w-6 h-6 text-black dark:text-galaxy-purple" />
              </div>
              <h3 className="text-xl font-serif font-bold text-black dark:text-white">{event.name}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-galaxy-dim">
                <Users className="w-4 h-4" />
                <span>{(event as any).availableSeats ?? event.totalSeats} / {event.totalSeats} seats available</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-galaxy-dim">
                <Clock className="w-4 h-4" />
                <span>Sale starts: {new Date(event.saleStartTime).toLocaleString()}</span>
              </div>
              {event.isActive && (
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold dark:bg-green-900/30 dark:text-green-400">
                  Active
                </div>
              )}
            </div>
            <button
              onClick={() => onSelectEvent(event.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-full font-bold border-2 border-black shadow-neo hover:translate-y-1 hover:shadow-none transition-all dark:bg-galaxy-pink dark:border-none dark:shadow-[0_0_20px_rgba(255,126,182,0.4)]"
            >
              Reserve Tickets
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

