import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api/apiService.js";
import { connectSocket, disconnectSocket } from "../services/socket/socketService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("queuecure_token");
        const storedUser = localStorage.getItem("queuecure_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Establish websocket session
                connectSocket();
            } catch (e) {
                console.error("Failed to parse user data", e);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await api.post("/auth/login", { email, password });
            if (data.success) {
                localStorage.setItem("queuecure_token", data.token);
                localStorage.setItem("queuecure_user", JSON.stringify(data.user));
                setToken(data.token);
                setUser(data.user);
                // Connect websocket session
                connectSocket();
            }
            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await api.post("/auth/register", userData);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("queuecure_token");
        localStorage.removeItem("queuecure_user");
        setToken(null);
        setUser(null);
        // Tear down socket session
        disconnectSocket();
    };

    const updateProfile = async (updatedData) => {
        // Assume user endpoint for profile updates (can fallback locally)
        try {
            const storedUser = JSON.parse(localStorage.getItem("queuecure_user") || "{}");
            const mergedUser = { ...storedUser, ...updatedData };
            localStorage.setItem("queuecure_user", JSON.stringify(mergedUser));
            setUser(mergedUser);
            return { success: true, user: mergedUser };
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
export default AuthContext;
