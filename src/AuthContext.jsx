import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { subscribeUser } from './pushService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            (async () => {
                try {
                    await subscribeUser();
                } catch (_) {}
            })();
        }
    }, [isAuthenticated]);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
            // Backend returns { message, user }
            const authUser = response.data?.user || response.data;
            setUser(authUser || null);
            setIsAuthenticated(Boolean(authUser));
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            await axios.post("http://localhost:5000/api/users/login", {
                email,
                password
            }, { withCredentials: true });
            await checkAuthStatus();
            try {
                await subscribeUser();
            } catch (_) {}
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post("http://localhost:5000/api/users/register", userData, { withCredentials: true });
            await checkAuthStatus();
            try {
                await subscribeUser();
            } catch (_) {}
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post("http://localhost:5000/api/users/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


