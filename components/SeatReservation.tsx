import React, { useState, useEffect } from 'react';
import { Ticket, ShoppingCart } from 'lucide-react';

interface SeatReservationProps {
  eventId: string;
  userId: string;
  isActive: boolean;
}

interface Seat {
  id: number;
  section: string;
  rowNumber: string;
  seatNumber: string;
  status: 'Available' | 'Reserved' | 'Sold';
}

export const SeatReservation: React.FC<SeatReservationProps> = ({ eventId, userId, isActive }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [reserving, setReserving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (eventId && isActive) {
      fetchSeats();
    }
  }, [eventId, isActive]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/seats`);
      if (response.ok) {
        const data: Seat[] = await response.json();
        // Sort seats numerically by Row then Seat Number
        data.sort((a, b) => {
          const rowA = parseInt(a.rowNumber) || 0;
          const rowB = parseInt(b.rowNumber) || 0;
          if (rowA !== rowB) return rowA - rowB;

          const seatA = parseInt(a.seatNumber) || 0;
          const seatB = parseInt(b.seatNumber) || 0;
          return seatA - seatB;
        });
        setSeats(data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'Available') return;

    setSelectedSeats(prev =>
      prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : [...prev, seat.id]
    );
    setMessage(null);
  };

  const reserveSeats = async () => {
    if (selectedSeats.length === 0) {
      setMessage('Please select at least one seat');
      return;
    }

    setReserving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reservations/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventId,
          seatIds: selectedSeats
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Seats reserved successfully! Refreshing view...');
        setSelectedSeats([]);
        await fetchSeats(); // Refresh to show new status
      } else {
        setMessage(data.detail || 'Failed to reserve seats');
      }
    } catch (error) {
      setMessage('Error reserving seats. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  // Group seats by section and row for rendering
  const seatsBySection = seats.reduce((acc, seat) => {
    if (!acc[seat.section]) acc[seat.section] = {};
    if (!acc[seat.section][seat.rowNumber]) acc[seat.section][seat.rowNumber] = [];
    acc[seat.section][seat.rowNumber].push(seat);
    return acc;
  }, {} as Record<string, Record<string, Seat[]>>);

  if (!isActive) {
    return (
      <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none">
        <p className="text-gray-700 dark:text-galaxy-dim">
          Join the waiting room and wait for your turn to reserve seats.
        </p>
      </div>
    );
  }

  if (loading && seats.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading seat map...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-serif font-bold text-black dark:text-white flex items-center gap-2">
            <Ticket className="w-6 h-6" />
            Select Seats
          </h3>
          <div className="flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded"></span> Available</div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 bg-galaxy-pink border-2 border-galaxy-pink rounded"></span> Selected</div>
            <div className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-400 opacity-50 rounded"></span> Taken</div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.includes('success')
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {message}
          </div>
        )}

        <div className="space-y-8 overflow-x-auto pb-4">
          {Object.entries(seatsBySection).map(([section, rows]) => (
            <div key={section} className="min-w-[600px]">
              <h4 className="font-bold text-xl mb-4 bg-gray-100 dark:bg-white/10 p-2 rounded text-black dark:text-white">Section {section}</h4>
              <div className="space-y-2">
                {Object.entries(rows).map(([rowNum, rowSeats]) => (
                  <div key={rowNum} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-bold text-gray-600 dark:text-galaxy-dim shrink-0">Row {rowNum}</span>
                    <div className="flex gap-1 flex-wrap">
                      {rowSeats.map(seat => {
                        const isSelected = selectedSeats.includes(seat.id);
                        const isAvailable = seat.status === 'Available';

                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            disabled={!isAvailable}
                            title={`Seat ${seat.seatNumber} (${seat.status})`}
                            className={`w-8 h-8 text-xs font-bold border-2 transition-all rounded ${!isAvailable
                              ? 'bg-gray-400 border-gray-400 opacity-30 cursor-not-allowed text-white'
                              : isSelected
                                ? 'bg-galaxy-pink border-galaxy-pink text-white scale-110 shadow-sm'
                                : 'bg-white border-gray-300 hover:border-black hover:bg-gray-50 dark:bg-dark-card dark:border-gray-600 dark:hover:border-white'
                              }`}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedSeats.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-black dark:border-dark-border sticky bottom-0 bg-white dark:bg-dark-card p-4 shadow-lg rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-black dark:text-white text-lg">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-gray-600 dark:text-galaxy-dim">
                  Total: ${(selectedSeats.length * 50).toFixed(2)}
                </p>
              </div>
              <button
                onClick={reserveSeats}
                disabled={reserving}
                className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-bold border-2 border-black hover:scale-105 transition-all dark:bg-galaxy-pink dark:border-none shadow-neo dark:shadow-[0_0_20px_rgba(255,126,182,0.4)] disabled:opacity-70 disabled:hover:scale-100"
              >
                <ShoppingCart className="w-5 h-5" />
                {reserving ? 'Processing...' : 'Reserve Selected'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





