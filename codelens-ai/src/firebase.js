import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    deleteDoc,
    doc,
    where,
    serverTimestamp,
} from "firebase/firestore";

// ─── Firebase config ──────────────────────────────────────────────────────────
// Replace with your own Firebase project config if needed
const firebaseConfig = {
    apiKey: "AIzaSyCulPnzUg86Szlcb85HIJUnkOX0Q3N1-zw",
    authDomain: "guruai-reviewer.firebaseapp.com",
    projectId: "guruai-reviewer",
    storageBucket: "guruai-reviewer.firebasestorage.app",
    messagingSenderId: "709695803360",
    appId: "1:709695803360:web:7e48d87dc0797dd37ba585",
    measurementId: "G-WQN485M803",
};

// ─── Init ─────────────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    return {
        uid: u.uid,
        name: u.displayName || "User",
        email: u.email || "",
        photo: u.photoURL || null,
        plan: "free",
    };
}

export async function logout() {
    await signOut(auth);
}

// ─── Scan History (Firestore) ─────────────────────────────────────────────────
const SCANS_COLLECTION = "scans";

/**
 * Save a scan result to Firestore.
 * @param {string} uid   - Firebase user UID
 * @param {object} data  - { code, language, results }
 */
export async function saveScan(uid, { code, language, results }) {
    await addDoc(collection(db, SCANS_COLLECTION), {
        uid,
        language,
        code: code.slice(0, 5000), // cap at 5 KB per doc
        lines: results.lines ? ? code.split("\n").length,
        critical: results.critical ? ? 0,
        warnings: results.warnings ? ? 0,
        scores: results.scores ? ? {},
        summary: results.summary ? ? "",
        createdAt: serverTimestamp(),
    });
}

/**
 * Fetch last N scans for a user, newest first.
 */
export async function fetchScans(uid, maxCount = 20) {
    const q = query(
        collection(db, SCANS_COLLECTION),
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(maxCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete a scan by its Firestore document ID.
 */
export async function deleteScan(scanId) {
    await deleteDoc(doc(db, SCANS_COLLECTION, scanId));
}