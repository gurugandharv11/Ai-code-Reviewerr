import { useState, useCallback } from "react";

/**
 * useToast — minimal toast notification system.
 * Returns: { toasts, toast(message, type) }
 * Types: "success" | "error" | "warning" | "info"
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        // Auto-dismiss after 3.5 s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, toast, dismiss };
}