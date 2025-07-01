import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // 1. Impor signOut

// Membuat Context
const AuthContext = createContext();

// Provider yang akan membungkus komponen
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, []);

    // 2. Definisikan fungsi handleLogout di sini
    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('sanctum_token');
            // Navigasi ke halaman login akan terjadi secara otomatis di komponen halaman
            // karena state `isAuthenticated` akan menjadi false.
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    // 3. Sediakan handleLogout melalui value context
    const value = {
        currentUser,
        loadingAuth,
        isAuthenticated: !!currentUser,
        handleLogout, // Tambahkan fungsi logout ke dalam value
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk mengonsumsi context
export const useAuth = () => {
    return useContext(AuthContext);
};
