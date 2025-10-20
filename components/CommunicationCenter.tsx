
import React, { useState, useRef, useEffect } from 'react';
// Fix: Added .ts extension to the import path.
import type { Message, User, Driver } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react';

interface CommunicationCenterProps {
  user: User;
  drivers: Driver[];
  messages: Message[];
  sendMessage: (senderId: string, receiverId: string, text: string) => void;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ user, drivers, messages, sendMessage }) => {
    const isAdmin = user.role === 'admin';
    const currentUserId = user.role === 'admin' ? 'admin' : user.id;

    const conversations = isAdmin
        ? drivers.map(d => ({ id: d.id, name: d.name }))
        : [{ id: 'admin', name: 'Centro de Despacho' }];
    
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedConversationId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMessage.trim() && selectedConversationId) {
            const senderId = currentUserId;
            const receiverId = isAdmin ? selectedConversationId : 'admin';
            sendMessage(senderId, receiverId, currentMessage);
            setCurrentMessage('');
        }
    };

    const currentChatMessages = messages.filter(msg => 
        (msg.senderId === currentUserId && msg.receiverId === selectedConversationId) ||
        (msg.senderId === selectedConversationId && msg.receiverId === currentUserId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return (
        <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader>
                <CardTitle>Centro de Comunicaciones</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex overflow-hidden relative">
                {/* Conversation List */}
                <div className={`
                    w-full md:w-1/3 md:static absolute top-0 left-0 h-full
                    pr-4 overflow-y-auto transition-transform duration-300 ease-in-out
                    bg-[var(--color-surface)] z-10
                    ${selectedConversationId ? '-translate-x-full' : 'translate-x-0'}
                    md:translate-x-0
                `}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-strong)] mb-2">Conversaciones</h3>
                    <ul className="space-y-2">
                        {conversations.map(conv => (
                            <li key={conv.id} onClick={() => setSelectedConversationId(conv.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedConversationId === conv.id ? 'shadow-[inset_2px_2px_4px_var(--color-shadow-dark),_-inset_-2px_-2px_4px_var(--color-shadow-light)]' : 'hover:shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)]'}`}>
                                <p className="font-medium text-[var(--color-text-strong)]">{conv.name}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Chat Window */}
                <div className="w-full md:w-2/3 flex flex-col pl-0 md:pl-4 md:border-l md:border-[var(--color-border)]">
                    {selectedConversationId ? (
                        <>
                            <div className="flex items-center pb-2 mb-2 border-b border-[var(--color-border)] md:hidden">
                                <button onClick={() => setSelectedConversationId(null)} className="mr-3 p-1 text-[var(--color-text-main)]">
                                    <ArrowLeft size={20} />
                                </button>
                                <h4 className="font-semibold text-[var(--color-text-strong)]">{conversations.find(c => c.id === selectedConversationId)?.name}</h4>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                               {currentChatMessages.map(msg => (
                                   <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                       {msg.senderId !== currentUserId && <UserIcon className="h-8 w-8 text-[var(--color-text-main)] bg-[var(--color-bg)] rounded-full p-1 self-start shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)]" />}
                                       <div className={`max-w-md p-3 rounded-lg shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] ${msg.senderId === currentUserId ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-strong)]'}`}>
                                           <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 text-right ${msg.senderId === currentUserId ? 'text-white/75' : 'opacity-60'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                       </div>
                                   </div>
                               ))}
                               <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="mt-4 flex">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={e => setCurrentMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-grow p-3 bg-[var(--color-surface)] rounded-l-lg shadow-[inset_5px_5px_10px_var(--color-shadow-dark),inset_-5px_-5px_10px_var(--color-shadow-light)] focus:outline-none"
                                />
                                <button type="submit" className="bg-[var(--color-surface)] text-[var(--color-primary)] p-3 rounded-r-lg shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center justify-center h-full text-[var(--color-text-main)]">
                            <p>Selecciona una conversación para empezar a chatear.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
