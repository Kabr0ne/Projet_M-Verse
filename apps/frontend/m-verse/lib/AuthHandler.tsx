'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState({ loggedIn: false, username: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const stockedName = localStorage.getItem('username');
        if (token && stockedName) {
            setUser({ loggedIn: true, username: stockedName });
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', response.data.user.username);
        setUser({ loggedIn: true, username: response.data.user.username });
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser({ loggedIn: false, username: '' });
    }
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

