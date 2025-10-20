import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Driver, Order, CoPilotMessage } from '../types.ts';
import { getCoPilotResponse } from '../services/geminiService.ts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { Mic, Send, Bot, Loader, BrainCircuit, AlertCircle } from 'lucide-react';
import type { GenerateContentResponse, FunctionCall } from '@google/genai';


interface AIAssistantProps {
  driver: Driver;
  orders: Order[];
  onFunctionCall: (call: FunctionCall) => string;
}

// Fix: Add type declarations for the non-standard Web Speech API.
// This resolves errors about missing properties on `window` and
// allows using `SpeechRecognition` as a type for the ref.
interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: () => void;
    onend: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    stop: () => void;
    start: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

// Check for SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

export const AIAssistant: React.FC<AIAssistantProps> = ({ driver, orders, onFunctionCall }) => {
    const [messages, setMessages] = useState<CoPilotMessage[]>([
        // Fix: Use 'model' role instead of 'assistant' to align with Gemini API.
        { role: 'model', text: `Hola ${driver.name}, soy tu co-piloto. ¿Cómo puedo ayudarte?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const processAIResponse = useCallback((response: GenerateContentResponse) => {
        if (response.functionCalls && response.functionCalls.length > 0) {
            const funcCall = response.functionCalls[0];
            const functionResponseText = onFunctionCall(funcCall);
            
            setMessages(prev => [
                ...prev,
                // Fix: Use 'model' role instead of 'assistant' to align with Gemini API.
                { role: 'model', text: `Ejecutando: ${funcCall.name}...`, isFunctionCall: true },
                // Fix: Use 'model' role instead of 'assistant' to align with Gemini API.
                { role: 'model', text: functionResponseText }
            ]);
        } else {
            // Fix: Use 'model' role instead of 'assistant' to align with Gemini API.
            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        }
    }, [onFunctionCall]);

    const handleSend = useCallback(async (messageText: string) => {
        if (messageText.trim() === '') return;

        const newUserMessage: CoPilotMessage = { role: 'user', text: messageText };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            // Pass the most up-to-date message history to the API
            const response = await getCoPilotResponse([...messages, newUserMessage], driver, orders);
            processAIResponse(response);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
            setError(errorMessage);
            // Fix: Use 'model' role instead of 'assistant' to align with Gemini API.
            setMessages(prev => [...prev, { role: 'model', text: `Lo siento, hubo un error. ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, driver, orders, processAIResponse]);

    const toggleListening = () => {
        if (!isSpeechSupported) {
            alert("Tu navegador no soporta el reconocimiento de voz.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'es-ES';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setError(`Error de reconocimiento: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                // Update the input field for user feedback
                setInput(transcript);
                // Directly call handleSend with the transcript to avoid stale state
                handleSend(transcript);
            };
            
            recognitionRef.current.start();
        }
    };

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BrainCircuit size={20} className="mr-2 text-[var(--color-primary)]"/>
                    Co-Piloto IA
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden h-96">
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {/* Fix: Use 'model' role instead of 'assistant' to align with Gemini API. */}
                            {msg.role === 'model' && <Bot className="h-6 w-6 text-[var(--color-primary)] flex-shrink-0" />}
                            <div className={`max-w-md px-3 py-2 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-[var(--color-surface)] shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)] text-[var(--color-text-strong)]' : msg.isFunctionCall ? 'bg-indigo-100 text-indigo-800 italic' : 'bg-[var(--color-bg)] text-[var(--color-text-main)]'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 justify-start">
                            <Bot className="h-6 w-6 text-[var(--color-primary)] flex-shrink-0" />
                            <div className="px-3 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-main)]">
                                <Loader className="animate-spin h-5 w-5" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {error && <p className="text-xs text-red-500 mb-2 flex items-center"><AlertCircle size={14} className="mr-1"/>{error}</p>}
                <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isListening ? 'Escuchando...' : 'Pregúntame algo...'}
                        className="flex-grow px-4 py-2 bg-[var(--color-surface)] rounded-lg shadow-[inset_2px_2px_4px_var(--color-shadow-dark),inset_-2px_-2px_4px_var(--color-shadow-light)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition"
                        disabled={isLoading}
                    />
                    {isSpeechSupported && (
                        <button type="button" onClick={toggleListening} disabled={isLoading} className={`p-2.5 text-white font-semibold rounded-lg ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[var(--color-primary)]'} shadow-[3px_3px_6px_var(--color-shadow-dark),_-3px_-3px_6px_var(--color-shadow-light)] hover:opacity-90 active:shadow-[inset_1px_1px_3px_var(--color-shadow-dark),_-inset_-1px_-1px_3px_var(--color-shadow-light)] transition-all`}>
                            <Mic size={18} />
                        </button>
                    )}
                    <button id="ai-send-button" type="submit" disabled={isLoading} className="p-2.5 text-white font-semibold rounded-lg bg-[var(--color-primary)] shadow-[3px_3px_6px_var(--color-shadow-dark),_-3px_-3px_6px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_1px_1px_3px_var(--color-shadow-dark),_-inset_-1px_-1px_3px_var(--color-shadow-light)] transition-all disabled:opacity-60">
                        <Send size={18} />
                    </button>
                </form>
            </CardContent>
        </Card>
    );
};