import React from 'react';
import { Database, Key, Table as TableIcon } from 'lucide-react';

interface Column {
    name: string;
    type: string;
    isPk?: boolean;
    isFk?: boolean;
    unique?: boolean;
    default?: string;
    ref?: string;
    note?: string;
}

interface Table {
    name: string;
    description: string;
    columns: Column[];
}

export const SchemaViewer: React.FC = () => {
    // Defines the schema structure based on database_setup.sql
    const tables: Table[] = [
        {
            name: "Events",
            description: "Stores concert and event metadata",
            columns: [
                { name: "Id", type: "UUID", isPk: true },
                { name: "Name", type: "VARCHAR(255)" },
                { name: "TotalSeats", type: "INTEGER" },
                { name: "SaleStartTime", type: "TIMESTAMPTZ" },
                { name: "IsActive", type: "BOOLEAN", default: "true" }
            ]
        },
        {
            name: "Users",
            description: "Registered users in the system",
            columns: [
                { name: "Id", type: "UUID", isPk: true },
                { name: "Email", type: "VARCHAR(255)", unique: true },
                { name: "PasswordHash", type: "VARCHAR" },
                { name: "CreatedAt", type: "TIMESTAMPTZ" }
            ]
        },
        {
            name: "Seats",
            description: "Individual seat inventory with Optimistic Locking",
            columns: [
                { name: "Id", type: "BIGSERIAL", isPk: true },
                { name: "EventId", type: "UUID", isFk: true, ref: "Events" },
                { name: "Section", type: "VARCHAR(50)" },
                { name: "RowNumber", type: "VARCHAR(10)" },
                { name: "SeatNumber", type: "VARCHAR(10)" },
                { name: "Status", type: "ENUM", default: "'Available'" },
                { name: "UserId", type: "UUID", isFk: true, ref: "Users" },
                { name: "Version", type: "INTEGER", default: "0", note: "Optimistic Concurrency Token" }
            ]
        },
        {
            name: "Orders",
            description: "Completed purchase records",
            columns: [
                { name: "Id", type: "UUID", isPk: true },
                { name: "UserId", type: "UUID", isFk: true, ref: "Users.Id" },
                { name: "TotalAmount", type: "DECIMAL(18,2)" },
                { name: "PaymentStatus", type: "VARCHAR(50)", default: "'Pending'" },
                { name: "CreatedAt", type: "TIMESTAMPTZ" }
            ]
        }
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tables.map((table) => (
                    <div
                        key={table.name}
                        className="bg-white border-2 border-black shadow-neo rounded-xl overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all dark:bg-dark-card dark:border-dark-border dark:shadow-none"
                    >
                        {/* Table Header */}
                        <div className="bg-gray-100 border-b-2 border-black p-4 flex items-center justify-between dark:bg-white/5 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <TableIcon className="w-5 h-5 text-gray-700 dark:text-galaxy-dim" />
                                <h3 className="font-mono font-bold text-lg text-black dark:text-white">{table.name}</h3>
                            </div>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider dark:text-gray-400">Table</span>
                        </div>

                        {/* Table Description */}
                        <div className="px-4 py-2 bg-pastel-cream text-sm text-gray-700 italic border-b-2 border-gray-100 dark:bg-black/20 dark:border-gray-800 dark:text-galaxy-dim">
                            {table.description}
                        </div>

                        {/* Columns List */}
                        <div className="p-4 space-y-2">
                            {table.columns.map((col) => (
                                <div key={col.name} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        {col.isPk && <Key className="w-3 h-3 text-yellow-500 rotate-45" />}
                                        {col.isFk && <Key className="w-3 h-3 text-blue-400 rotate-90" />}
                                        <span className={`font-mono font-semibold ${col.isPk ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {col.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-gray-500 text-xs dark:text-gray-500">{col.type}</span>
                                        {col.note && (
                                            <span className="hidden sm:inline-block bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
                                                {col.note}
                                            </span>
                                        )}
                                        {col.isFk && (
                                            <span className="text-[10px] text-blue-500 font-medium dark:text-blue-400">
                                                → {col.ref}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-pastel-blue/30 border-2 border-blue-200 rounded-xl p-6 dark:bg-blue-900/10 dark:border-blue-800">
                <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2 dark:text-blue-300">
                    <Database className="w-5 h-5" />
                    Optimistic Concurrency Strategy
                </h4>
                <p className="text-sm text-blue-900 leading-relaxed dark:text-blue-200">
                    The <code>Seats</code> table uses a <code>Version</code> column to prevent double-booking.
                    When a user attempts to reserve a seat, the SQL update query checks if the version matches the one read previously.
                    <br /><br />
                    <code>UPDATE Seats SET Status = 'Reserved', Version = Version + 1 <br /> WHERE Id = @Id AND Version = @CurrentVersion</code>
                    <br /><br />
                    If <code>RowsAffected == 0</code>, it means another user modified the seat in the split second between reading and writing, keeping data consistent without explicit locks.
                </p>
            </div>
        </div>
    );
};
