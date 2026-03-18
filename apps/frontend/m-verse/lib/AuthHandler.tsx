'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState({ loggedIn: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ loggedIn: true});
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.access_token);
        setUser({ loggedIn: true });
    }

    const logout = () => {
        localStorage.removeItem('token');
        setUser({ loggedIn: false });
    }
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

