import React, { useState } from 'react';
import { Share2, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';

interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    name: string;
    description: string;
    params?: string[];
    response?: string;
    tags: string[];
}

export const EndpointViewer: React.FC = () => {
    // Defined from analysis of Program.cs
    const endpoints: Endpoint[] = [
        {
            method: 'GET',
            path: '/api/events',
            name: 'List Events',
            description: 'Fetch all active events with seat availability counts.',
            response: '[{ id, name, totalSeats, availableSeats, isActive, ... }]',
            tags: ['Public', 'Events']
        },
        {
            method: 'GET',
            path: '/api/events/{eventId}/seats',
            name: 'Get Seat Map',
            description: 'Retrieve all seats for a specific event with their current status (Available, Reserved, Sold).',
            params: ['eventId: UUID'],
            response: '[{ id, section, rowNumber, seatNumber, status }]',
            tags: ['Public', 'Events']
        },
        {
            method: 'POST',
            path: '/api/events/{eventId}/queue/join',
            name: 'Join Queue',
            description: 'Add user to the Redis Sorted Set waiting room for an event.',
            params: ['eventId: UUID', 'userId: UUID'],
            response: '{ message: "Joined waiting room", position: int }',
            tags: ['Queue', 'Redis']
        },
        {
            method: 'GET',
            path: '/api/events/{eventId}/queue/position/{userId}',
            name: 'Check Queue Position',
            description: 'Poll for current position in the waiting room.',
            params: ['eventId: UUID', 'userId: UUID'],
            response: '{ position: int }',
            tags: ['Queue', 'Redis']
        },
        {
            method: 'POST',
            path: '/api/reservations/reserve',
            name: 'Reserve Seats',
            description: 'Attempt to reserve specific seats. Requires active queue session. Uses Optimistic Concurrency.',
            params: ['eventId', 'userId', 'seatIds[]'],
            response: '{ message: "Seats reserved successfully" }',
            tags: ['Transactional', 'Postgres']
        },
        {
            method: 'GET',
            path: '/health',
            name: 'System Health Check',
            description: 'Verifies connectivity to Redis and PostgreSQL. Used by Docker container healthchecks.',
            response: '"System Healthy" | 503 Service Unavailable',
            tags: ['System']
        }
    ];

    const [openItems, setOpenItems] = useState<string[]>(endpoints.map(e => e.path));

    const toggleItem = (path: string) => {
        setOpenItems(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
            case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
            case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
            case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border-2 border-black shadow-neo rounded-xl p-6 dark:bg-dark-card dark:border-dark-border dark:shadow-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pastel-lavender p-2 rounded-full border-2 border-black dark:bg-galaxy-pink/20 dark:border-galaxy-pink">
                            <Share2 className="w-6 h-6 text-black dark:text-galaxy-pink" />
                        </div>
                        <h3 className="font-bold text-lg text-black dark:text-white">Minimal API Architecture</h3>
                    </div>
                    <p className="text-gray-700 text-sm dark:text-galaxy-dim">
                        The backend uses ASP.NET Core 9 Minimal APIs defined in <code>Program.cs</code> for low-overhead, high-performance routing.
                        Controllers are avoided to reduce request pipeline latency.
                    </p>
                </div>

                <div className="bg-white border-2 border-black shadow-neo rounded-xl p-6 dark:bg-dark-card dark:border-dark-border dark:shadow-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-pastel-green p-2 rounded-full border-2 border-black dark:bg-green-900/30 dark:border-green-500">
                            <ShieldCheck className="w-6 h-6 text-black dark:text-green-400" />
                        </div>
                        <h3 className="font-bold text-lg text-black dark:text-white">Anti-Bot & Concurrency</h3>
                    </div>
                    <p className="text-gray-700 text-sm dark:text-galaxy-dim">
                        Endpoints like <code>/reserve</code> enforce session validity checks against Redis. Database writes use Optimistic Concurrency to prevent overselling without locking the entire table.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-serif font-bold text-2xl text-black dark:text-white mb-4">Endpoint Definitions</h3>
                {endpoints.map((endpoint) => (
                    <div
                        key={endpoint.path}
                        className="bg-white border-2 border-black rounded-lg overflow-hidden dark:bg-dark-card dark:border-dark-border"
                    >
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                            onClick={() => toggleItem(endpoint.path)}
                        >
                            <div className="flex items-center gap-4">
                                {openItems.includes(endpoint.path) ? <ChevronDown className="w-5 h-5 dark:text-white" /> : <ChevronRight className="w-5 h-5 dark:text-white" />}
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                                    {endpoint.method}
                                </span>
                                <code className="text-sm font-bold text-gray-800 dark:text-gray-200">{endpoint.path}</code>
                            </div>
                            <div className="flex gap-2">
                                {endpoint.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full uppercase tracking-wide dark:bg-gray-800 dark:text-gray-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {openItems.includes(endpoint.path) && (
                            <div className="p-4 border-t-2 border-gray-100 bg-gray-50 dark:bg-black/20 dark:border-gray-800">
                                <p className="text-gray-700 mb-3 text-sm dark:text-galaxy-dim">{endpoint.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {endpoint.params && (
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Parameters</h4>
                                            <ul className="list-disc list-inside text-xs font-mono text-gray-600 dark:text-gray-400">
                                                {endpoint.params.map(p => <li key={p}>{p}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {endpoint.response && (
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Response</h4>
                                            <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto">
                                                {endpoint.response}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
