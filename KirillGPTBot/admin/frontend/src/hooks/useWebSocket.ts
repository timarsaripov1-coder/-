import { useEffect, useRef } from 'react';
import { wsManager } from '@/services/websocket';
import { WebSocketMessage } from '@/types/api';

type EventCallback = (data: any) => void;

export const useWebSocket = () => {
  const callbacksRef = useRef<Map<string, EventCallback[]>>(new Map());

  const subscribe = (eventType: string, callback: EventCallback) => {
    // Store callback in ref for cleanup
    if (!callbacksRef.current.has(eventType)) {
      callbacksRef.current.set(eventType, []);
    }
    callbacksRef.current.get(eventType)!.push(callback);

    // Register with WebSocket manager
    wsManager.on(eventType, callback);
  };

  const unsubscribe = (eventType: string, callback?: EventCallback) => {
    if (callback) {
      // Remove specific callback
      wsManager.off(eventType, callback);
      
      const callbacks = callbacksRef.current.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      // Remove all callbacks for event type
      wsManager.off(eventType);
      callbacksRef.current.delete(eventType);
    }
  };

  const send = (message: WebSocketMessage) => {
    wsManager.send(message);
  };

  const isConnected = () => {
    return wsManager.isConnected();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all registered callbacks
      callbacksRef.current.forEach((callbacks, eventType) => {
        callbacks.forEach(callback => {
          wsManager.off(eventType, callback);
        });
      });
      callbacksRef.current.clear();
    };
  }, []);

  return {
    subscribe,
    unsubscribe,
    send,
    isConnected,
  };
};

export default useWebSocket;