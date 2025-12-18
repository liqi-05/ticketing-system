import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ArchitectChatProps {
    context: string;
}

export const ArchitectChat: React.FC<ArchitectChatProps> = ({ context }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hello! I'm the FairTix Architect AI. I can explain how this specific part of the system works. \n\n**Current Context:** ${context}`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Gemini Client safely handling possible missing env
    // @ts-ignore
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            if (!apiKey) {
                // Mock response if no API key
                setTimeout(() => {
                    const mockResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: "I'm currently in demo mode because no `VITE_GEMINI_API_KEY` was found. In a real deployment, I would explain specific architectural details about: " + context,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, mockResponse]);
                    setIsLoading(false);
                }, 1000);
                return;
            }

            // Real Gemini Call
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const systemPrompt = `You are a Senior Software Architect explaining the FairTix high-concurrency ticketing system to an engineer.
      
      System Architecture:
      - Frontend: React + TypeScript + Tailwind
      - Backend: ASP.NET Core 9 Minimal API
      - Database: PostgreSQL (Storage for Events, Users, Seats, Orders)
      - Queue/Cache: Redis (Waiting Room + Active User Session management)
      - Containerization: Docker + Docker Compose

      Current Logic Context: ${context}

      Explain concepts clearly, mentioning specific technologies when relevant. Keep answers concise.`;

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am ready to answer questions about the FairTix architecture." }],
                    }
                ]
            });

            const result = await chat.sendMessage(newUserMessage.content);
            const response = await result.response;
            const text = response.text();

            const newAssistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAssistantMessage]);
        } catch (err) {
            console.error("Gemini Error:", err);
            setError("Failed to get a response from the Architect AI.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white border-2 border-black shadow-neo rounded-xl overflow-hidden dark:bg-dark-card dark:border-dark-border dark:shadow-none transition-colors mt-6">
            {/* Header */}
            <div className="bg-pastel-yellow p-4 border-b-2 border-black flex items-center gap-3 dark:bg-galaxy-purple/10 dark:border-dark-border">
                <div className="bg-black p-2 rounded-full text-white dark:bg-galaxy-purple dark:text-white">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-serif font-bold text-lg text-black dark:text-white">Architect AI</h3>
                    <p className="text-xs text-gray-700 dark:text-galaxy-dim">Ask about the system design</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bg/50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-black shadow-sm ${msg.role === 'user'
                                ? 'bg-pastel-blue dark:bg-galaxy-pink dark:border-galaxy-pink'
                                : 'bg-pastel-yellow dark:bg-galaxy-purple dark:border-galaxy-purple'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-black dark:text-white" /> : <Bot className="w-4 h-4 text-black dark:text-white" />}
                        </div>

                        <div className={`max-w-[80%] rounded-2xl p-4 border-2 shadow-sm ${msg.role === 'user'
                                ? 'bg-white border-black rounded-tr-none dark:bg-dark-card dark:border-gray-600 dark:text-white'
                                : 'bg-white border-black rounded-tl-none dark:bg-dark-card dark:border-gray-600 dark:text-white'
                            }`}>
                            <div className="text-sm markdown-body font-medium whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-2 text-right">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm ml-12 dark:text-galaxy-dim">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm ml-12 bg-red-50 p-2 rounded border border-red-200 dark:bg-red-900/20 dark:border-red-900">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t-2 border-black dark:bg-dark-card dark:border-dark-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={apiKey ? "Why did we choose Redis for the queue?" : "Add VITE_GEMINI_API_KEY to .env to chat"}
                        disabled={isLoading}
                        className="flex-1 border-2 border-black rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pastel-yellow font-medium dark:bg-dark-bg dark:border-gray-600 dark:text-white dark:focus:ring-galaxy-purple placeholder:text-gray-400"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-black text-white p-3 rounded-full hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 border-2 border-black dark:bg-galaxy-purple dark:border-galaxy-purple"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                {!apiKey && (
                    <p className="text-xs text-center mt-2 text-gray-400 dark:text-gray-600">
                        Demo Mode: Real responses require VITE_GEMINI_API_KEY
                    </p>
                )}
            </div>
        </div>
    );
};
