import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
// Fix: Added .ts extension to the import path.
import type { Order, Driver, CoPilotMessage } from '../types.ts';
import { OrderStatus } from '../types.ts';


// Per instructions, API key MUST come from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface Assignment {
    orderId: string;
    driverId: string;
    reason: string;
}

const assignmentSchema = {
    type: Type.OBJECT,
    properties: {
        assignments: {
            type: Type.ARRAY,
            description: "List of optimal assignments of orders to drivers.",
            items: {
                type: Type.OBJECT,
                properties: {
                    orderId: {
                        type: Type.STRING,
                        description: "The unique ID of the order to be assigned."
                    },
                    driverId: {
                        type: Type.STRING,
                        description: "The unique ID of the driver to whom the order is assigned."
                    },
                    reason: {
                        type: Type.STRING,
                        description: "A brief explanation for why this assignment is optimal."
                    }
                },
                required: ["orderId", "driverId", "reason"]
            }
        }
    },
    required: ["assignments"]
};


export const getSmartAssignments = async (
    pendingOrders: Order[], 
    onlineDrivers: Driver[]
): Promise<Assignment[]> => {
    if (pendingOrders.length === 0 || onlineDrivers.length === 0) {
        return [];
    }

    const prompt = `
        You are an expert logistics dispatcher for a delivery service in a dense urban environment. Your goal is to assign pending orders to available online drivers in the most efficient way possible.

        Consider the following factors for optimal assignment:
        1.  **Proximity:** Assign orders to the nearest available driver.
        2.  **Existing Load:** Prioritize drivers with fewer or no current orders. A driver can handle multiple orders if they are along a similar route.
        3.  **Efficiency:** Create assignments that minimize total travel time and distance for all drivers.
        4.  **Constraints:** A driver can only be assigned orders they can realistically deliver. Do not assign an order to a driver who is already overloaded or too far away.

        **Current System State:**

        **Available Online Drivers:**
        ${onlineDrivers.map(d => `- Driver ID: ${d.id}, Current Location: {lat: ${d.location.lat}, lng: ${d.location.lng}}, Vehicle: ${d.vehicle}`).join('\n')}

        **Pending Orders:**
        ${pendingOrders.map(o => `- Order ID: ${o.id}, Pickup: ${o.pickupAddress} {lat: ${o.pickupLocation.lat}, lng: ${o.pickupLocation.lng}}, Delivery: ${o.deliveryAddress} {lat: ${o.deliveryLocation.lat}, lng: ${o.deliveryLocation.lng}}`).join('\n')}

        **Task:**
        Based on the data above, provide a list of optimal order-to-driver assignments. Only include assignments that you are confident are efficient. If no optimal assignments can be made, return an empty list.
        Provide your response as a JSON object matching the required schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Basic text task
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: assignmentSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (result && result.assignments && Array.isArray(result.assignments)) {
            return result.assignments as Assignment[];
        }
        return [];
    } catch (error) {
        console.error("Error calling Gemini API for smart assignments:", error);
        throw new Error("Failed to get smart assignments from AI. Please check the API key and network connection.");
    }
};

const coPilotFunctionDeclarations: FunctionDeclaration[] = [
    {
        name: 'getNextStop',
        description: 'Obtiene la dirección de la siguiente parada de entrega para el conductor.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'optimizeMyRoute',
        description: 'Optimiza la ruta de entrega actual para encontrar el camino más eficiente basado en las ubicaciones de las paradas restantes.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'readCustomerInstructions',
        description: 'Lee en voz alta las instrucciones especiales de entrega del cliente para el pedido actual o el siguiente.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'markOrderAsDelivered',
        description: 'Marca el pedido actual como entregado e inicia el proceso de prueba de entrega.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'sendMessageToDispatch',
        description: 'Envía un mensaje de texto al centro de despacho.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                message: {
                    type: Type.STRING,
                    description: 'El contenido del mensaje para enviar al despacho.'
                }
            },
            required: ['message']
        }
    }
];

export const getCoPilotResponse = async (
    history: CoPilotMessage[],
    driver: Driver,
    orders: Order[]
): Promise<GenerateContentResponse> => {
    
    const inProgressOrders = orders.filter(o => o.status === OrderStatus.InProgress);

    const systemInstruction = `
        Eres un Co-Piloto de IA para un conductor de reparto llamado ${driver.name}.
        Tu objetivo es ayudar al conductor a completar sus tareas de forma segura y eficiente.
        Puedes responder preguntas sobre su ruta actual y realizar acciones en su nombre.
        Sé conciso y claro en tus respuestas. El conductor probablemente esté conduciendo.
        Habla en español.

        Estado actual del conductor: ${driver.status}
        Ubicación actual del conductor: {lat: ${driver.location.lat}, lng: ${driver.location.lng}}

        Pedidos asignados al conductor (en orden optimizado):
        ${inProgressOrders.length > 0 ? inProgressOrders.map((o, i) => `- Pedido #${i + 1} (ID: ${o.id}): Entregar a ${o.deliveryAddress}. Estado: ${o.status}. Instrucciones: ${o.customerInstructions || 'Ninguna'}`).join('\n') : 'No hay pedidos en curso.'}
    `;

    // Fix: Map the chat history to the Content[] format expected by the Gemini API.
    // This ensures the entire conversation context is sent to the model for better responses.
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: coPilotFunctionDeclarations }],
            }
        });
        return response;
    } catch (error) {
        console.error("Error calling Gemini API for co-pilot:", error);
        throw new Error("Failed to get response from AI Co-Pilot.");
    }
};