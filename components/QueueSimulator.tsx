import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, CheckCircle, Clock, Lock } from 'lucide-react';

export const QueueSimulator: React.FC = () => {
    const [step, setStep] = useState(0);

    // Animation loop
    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const steps = [
        {
            title: "1. Join Request",
            description: "User clicks 'Join Queue'. Backend adds UserID + EventID + Timestamp to Redis Sorted Set.",
            icon: Users,
            color: "bg-blue-500"
        },
        {
            title: "2. The Waiting Room",
            description: "Users are ordered by score (timestamp). Redis ZRASNK is used to determine position.",
            icon: Clock,
            color: "bg-yellow-500"
        },
        {
            title: "3. Admission Worker",
            description: "Background worker runs every 1s. Checks capacity. Moves top N users from 'Waiting' Sorted Set to 'Active' Set.",
            icon: ArrowRight,
            color: "bg-purple-500"
        },
        {
            title: "4. Active Session",
            description: "User endpoint returns 'Active'. Frontend allows access to Reserve API. Session expires in 10 mins.",
            icon: CheckCircle,
            color: "bg-green-500"
        }
    ];

    return (
        <div className="space-y-8">

            {/* Interactive Diagram */}
            <div className="relative bg-white border-2 border-black shadow-neo rounded-xl p-8 min-h-[300px] flex items-center justify-center overflow-hidden dark:bg-dark-card dark:border-dark-border dark:shadow-none">
                {/* Connecting Lines */}
                <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-200 -z-0 dark:bg-gray-700"></div>

                <div className="flex justify-between w-full relative z-10 max-w-4xl">
                    {steps.map((s, index) => (
                        <div key={index} className={`flex flex-col items-center transition-all duration-500 ${index === step ? 'scale-110 opacity-100' : 'opacity-50 scale-95'}`}>
                            <div className={`w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 transition-colors duration-300 ${index <= step ? s.color : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <s.icon className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="font-bold text-center text-sm bg-white px-2 py-1 rounded border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                {s.title}
                            </h4>
                        </div>
                    ))}
                </div>

                {/* Moving User Dot */}
                <div
                    className="absolute top-1/2 w-4 h-4 bg-black rounded-full shadow-lg transition-all duration-[3000ms] ease-linear dark:bg-white"
                    style={{
                        left: `${10 + (step * (80 / 3))}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-black text-white px-2 py-0.5 rounded dark:bg-white dark:text-black">
                        User Request
                    </div>
                </div>
            </div>

            {/* Detailed Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {steps.map((s, index) => (
                    <div
                        key={index}
                        className={`border-2 p-4 rounded-lg transition-all ${index === step
                                ? 'border-black bg-pastel-cream shadow-neo dark:border-white dark:bg-white/10 dark:shadow-none'
                                : 'border-transparent bg-gray-50 dark:bg-white/5 dark:border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${index === step ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <h4 className={`font-bold text-sm ${index === step ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {s.title}
                            </h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-galaxy-dim leading-relaxed">
                            {s.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-pastel-blue/20 border border-blue-200 p-4 rounded-lg flex gap-4 items-start dark:bg-blue-900/20 dark:border-blue-800">
                <Lock className="w-6 h-6 text-blue-600 shrink-0 dark:text-blue-400" />
                <div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">Why Redis?</h4>
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                        Traditional DBs lock up under thousands of concurrent <code>INSERT</code> requests per second.
                        Redis (in-memory) can handle 100k+ ops/sec easily. We use Sorted Sets (<code>ZADD</code>, <code>ZRANGE</code>)
                        because they are O(log(N)) extremely fast even with millions of users.
                    </p>
                </div>
            </div>

        </div>
    );
};
