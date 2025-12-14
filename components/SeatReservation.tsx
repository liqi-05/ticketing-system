import React, { useState } from 'react';
import { Ticket, ShoppingCart } from 'lucide-react';

interface SeatReservationProps {
  eventId: string;
  userId: string;
  isActive: boolean;
}

export const SeatReservation: React.FC<SeatReservationProps> = ({ eventId, userId, isActive }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [reserving, setReserving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Sample seat grid (in real app, fetch from API)
  const sections = ['A', 'B', 'C'];
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  const seatsPerRow = 20;

  const toggleSeat = (seatId: number) => {
    if (!isActive) {
      setMessage('You must be in the active session to select seats');
      return;
    }
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
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
        setMessage('Seats reserved successfully!');
        setSelectedSeats([]);
      } else {
        setMessage(data.detail || 'Failed to reserve seats');
      }
    } catch (error) {
      setMessage('Error reserving seats. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  if (!isActive) {
    return (
      <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none">
        <p className="text-gray-700 dark:text-galaxy-dim">
          Join the waiting room and wait for your turn to reserve seats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none">
        <h3 className="text-2xl font-serif font-bold text-black dark:text-white mb-4 flex items-center gap-2">
          <Ticket className="w-6 h-6" />
          Select Seats
        </h3>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {sections.map(section => (
            <div key={section}>
              <h4 className="font-bold text-lg mb-3 text-black dark:text-white">Section {section}</h4>
              <div className="space-y-2">
                {rows.map(row => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-12 text-sm font-bold text-gray-600 dark:text-galaxy-dim">Row {row}</span>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: seatsPerRow }, (_, i) => {
                        const seatId = parseInt(`${section}${row}${i + 1}`);
                        const isSelected = selectedSeats.includes(seatId);
                        return (
                          <button
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            className={`w-8 h-8 text-xs font-bold border-2 transition-all ${
                              isSelected
                                ? 'bg-galaxy-pink border-galaxy-pink text-white'
                                : 'bg-gray-200 border-gray-400 hover:bg-gray-300 dark:bg-dark-card dark:border-dark-border dark:hover:bg-dark-card/80'
                            }`}
                          >
                            {i + 1}
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
          <div className="mt-6 pt-6 border-t-2 border-black dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-black dark:text-white">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-600 dark:text-galaxy-dim">
                  Total: ${selectedSeats.length * 50}.00
                </p>
              </div>
              <button
                onClick={reserveSeats}
                disabled={reserving}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold border-2 border-black shadow-neo hover:translate-y-1 hover:shadow-none transition-all dark:bg-galaxy-pink dark:border-none dark:shadow-[0_0_20px_rgba(255,126,182,0.4)] disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {reserving ? 'Reserving...' : 'Reserve Seats'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




