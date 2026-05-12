import { useState, useEffect, useCallback } from "react";
import { fetchScans, deleteScan } from "../firebase";

/**
 * useHistory — loads and manages scan history from Firestore.
 *
 * @param {object|null} user  - logged-in user (needs uid)
 * Returns: { scans, loading, reload, remove }
 */
export function useHistory(user) {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async() => {
        if (!user ? .uid) return;
        setLoading(true);
        try {
            const data = await fetchScans(user.uid, 30);
            setScans(data);
        } catch (err) {
            console.error("Failed to load scan history:", err);
        }
        setLoading(false);
    }, [user ? .uid]);

    // Auto-load when user changes
    useEffect(() => {
        load();
    }, [load]);

    const remove = useCallback(async(scanId) => {
        try {
            await deleteScan(scanId);
            setScans((prev) => prev.filter((s) => s.id !== scanId));
        } catch (err) {
            console.error("Failed to delete scan:", err);
        }
    }, []);

    return { scans, loading, reload: load, remove };
}