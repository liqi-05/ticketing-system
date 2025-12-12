import React, { useState, useEffect } from 'react';
import { TableSchema } from '../types';
import { Database, Key, GitCommit, Link, Armchair } from 'lucide-react';

const tables: TableSchema[] = [
  {
    name: "Events",
    description: "Stores concert details. High read volume, low write.",
    columns: [
      { name: "Id", type: "UUID", isKey: true },
      { name: "Name", type: "VARCHAR(255)" },
      { name: "TotalSeats", type: "INT" },
      { name: "SaleStartTime", type: "TIMESTAMPTZ" },
      { name: "IsActive", type: "BOOLEAN" }
    ]
  },
  {
    name: "Seats",
    description: "The hottest table. Uses Optimistic Concurrency.",
    columns: [
      { name: "Id", type: "BIGINT", isKey: true },
      { name: "EventId", type: "UUID", isFk: true },
      { name: "Section", type: "VARCHAR(50)" },
      { name: "RowNumber", type: "VARCHAR(10)" },
      { name: "SeatNumber", type: "VARCHAR(10)" },
      { name: "Status", type: "ENUM('Available', 'Reserved', 'Sold')" },
      { name: "UserId", type: "UUID", isFk: true, notes: "Null if available" },
      { name: "Version", type: "XMIN / ROWVERSION", isConcurrency: true, notes: "Vital for preventing double booking" }
    ]
  },
  {
    name: "Users",
    description: "Registered accounts.",
    columns: [
      { name: "Id", type: "UUID", isKey: true },
      { name: "Email", type: "VARCHAR(255)" },
      { name: "PasswordHash", type: "VARCHAR" },
      { name: "CreatedAt", type: "TIMESTAMPTZ" }
    ]
  },
  {
    name: "Orders",
    description: "Finalized transactions.",
    columns: [
      { name: "Id", type: "UUID", isKey: true },
      { name: "UserId", type: "UUID", isFk: true },
      { name: "TotalAmount", type: "DECIMAL" },
      { name: "PaymentStatus", type: "VARCHAR(50)" },
      { name: "CreatedAt", type: "TIMESTAMPTZ" }
    ]
  }
];

// Inner component for the seat visualization
const SeatMapSimulation: React.FC = () => {
  const TOTAL_SEATS = 64; // 8x8 Grid
  const [seats, setSeats] = useState(() => 
    Array.from({ length: TOTAL_SEATS }, (_, i) => ({
      id: i,
      status: 'Available' as 'Available' | 'Reserved' | 'Sold'
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSeats(currentSeats => {
        return currentSeats.map(seat => {
          const rand = Math.random();
          if (seat.status === 'Available') {
             if (rand < 0.02) return { ...seat, status: 'Reserved' };
          } else if (seat.status === 'Reserved') {
             if (rand < 0.1) return { ...seat, status: 'Sold' };
             if (rand > 0.9) return { ...seat, status: 'Available' };
          } else if (seat.status === 'Sold') {
             if (rand < 0.01) return { ...seat, status: 'Available' };
          }
          return seat;
        });
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      // Light Mode: Pastel / Dark Mode: Galaxy Neon
      case 'Available': return 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-400 dark:text-emerald-300';
      case 'Reserved': return 'bg-amber-100 border-amber-500 text-amber-700 animate-pulse dark:bg-galaxy-pink/20 dark:border-galaxy-pink dark:text-galaxy-pink';
      case 'Sold': return 'bg-red-100 border-red-500 text-red-700 dark:bg-red-500/20 dark:border-red-500 dark:text-red-400';
      default: return 'bg-gray-100 border-gray-300 dark:bg-dark-bg dark:border-dark-border';
    }
  };

  return (
    <div className="bg-white border-2 border-black shadow-neo rounded-xl p-6 dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-all">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-black dark:text-white flex items-center gap-2">
              <Armchair className="w-6 h-6 text-black dark:text-galaxy-purple" />
              Live Inventory Simulation
          </h3>
          <p className="text-xs text-gray-600 dark:text-galaxy-dim mt-1">
            Visualizing row-level locking. "Reserved" seats are temporarily locked by <code>xmin</code>.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono bg-gray-50 border-2 border-black px-3 py-2 rounded-lg dark:bg-dark-bg dark:border-dark-border transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm dark:bg-emerald-400"></div> 
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-sm dark:bg-galaxy-pink"></div> 
              <span className="text-amber-700 dark:text-galaxy-pink font-bold">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm dark:bg-red-500"></div> 
              <span className="text-red-700 dark:text-red-400 font-bold">Sold</span>
            </div>
        </div>
       </div>
       
       <div className="grid grid-cols-8 sm:grid-cols-16 gap-2">
            {seats.map(seat => (
                <div 
                    key={seat.id} 
                    className={`aspect-square rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300 cursor-help ${getStatusStyles(seat.status)}`}
                    title={`Seat ${seat.id + 1}: ${seat.status}`}
                >
                    {seat.status === 'Sold' ? '✕' : seat.id + 1}
                </div>
            ))}
       </div>
    </div>
  );
};

export const SchemaViewer: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white border-2 border-black shadow-neo p-6 rounded-xl dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-all">
        <h2 className="text-3xl font-serif font-bold text-black dark:text-galaxy-pink mb-2 flex items-center gap-2">
          <Database className="w-8 h-8" /> PostgreSQL Schema Design
        </h2>
        <p className="text-gray-600 dark:text-galaxy-dim mb-6 font-medium">
          The database schema is optimized for consistency over availability (CP in CAP theorem) regarding seat inventory.
          We utilize <strong>Optimistic Concurrency Control</strong> via a version token (<code>xmin</code> in Postgres) to handle the "Double Booking" problem without heavy table locks.
        </p>

        {/* Seat Simulation inserted here */}
        <div className="mb-8">
          <SeatMapSimulation />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tables.map((table) => (
            <div key={table.name} className="bg-pastel-cream border-2 border-black rounded-xl overflow-hidden shadow-neo-sm hover:shadow-neo transition-all dark:bg-dark-bg dark:border-dark-border dark:shadow-none">
              <div className="bg-black px-4 py-3 border-b-2 border-black flex justify-between items-center dark:bg-dark-card dark:border-dark-border">
                <h3 className="font-mono text-lg font-bold text-white dark:text-galaxy-purple">{table.name}</h3>
                <span className="text-xs text-gray-300 dark:text-galaxy-dim">{table.description}</span>
              </div>
              <div className="p-4">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-500 border-b-2 border-black/10 dark:border-dark-border">
                      <th className="pb-2 font-bold text-black dark:text-galaxy-dim">Column</th>
                      <th className="pb-2 font-bold text-black dark:text-galaxy-dim">Type</th>
                      <th className="pb-2 font-bold text-black dark:text-galaxy-dim">Attr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((col) => (
                      <tr key={col.name} className="border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 font-mono font-bold text-indigo-700 dark:text-white">{col.name}</td>
                        <td className="py-2 text-gray-600 dark:text-galaxy-dim font-mono text-xs">{col.type}</td>
                        <td className="py-2">
                          <div className="flex gap-2">
                            {col.isKey && (
                              <div title="Primary Key">
                                <Key className="w-4 h-4 text-amber-600 dark:text-galaxy-pink" />
                              </div>
                            )}
                            {col.isFk && (
                              <div title="Foreign Key">
                                <Link className="w-4 h-4 text-gray-500 dark:text-galaxy-dim" />
                              </div>
                            )}
                            {col.isConcurrency && (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="Concurrency Token">
                                <GitCommit className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Lock</span>
                              </div>
                            )}
                          </div>
                          {col.notes && <div className="text-[10px] text-gray-500 dark:text-galaxy-dim/60 mt-1 italic">{col.notes}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-amber-100 border-2 border-amber-500 p-4 rounded-xl shadow-neo-sm dark:bg-galaxy-pink/10 dark:border-galaxy-pink/50 dark:shadow-none transition-all">
        <h4 className="text-amber-800 font-serif font-bold mb-2 text-lg dark:text-galaxy-pink">Concurrency Strategy</h4>
        <p className="text-sm text-amber-900 font-mono bg-amber-50 p-2 rounded border border-amber-200 dark:bg-dark-bg dark:text-white dark:border-none">
          UPDATE Seats <br/>
          SET Status = 'Reserved', UserId = @UserId, Version = Version + 1 <br/>
          WHERE Id = @SeatId AND Version = @CurrentVersion AND Status = 'Available';
        </p>
        <p className="text-sm text-amber-700 mt-2 font-medium dark:text-galaxy-dim">
          If <code>RowsAffected == 0</code>, the seat was taken by another thread between the read and the write. The transaction aborts, and the user is told the seat is gone.
        </p>
      </div>
    </div>
  );
};