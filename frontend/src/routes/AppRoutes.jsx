import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// Pages
import Login from "../pages/auth/login/Login.jsx";
import Register from "../pages/auth/register/Register.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import QueueDashboard from "../pages/queue/QueueDashboard.jsx";
import ReceptionistDashboard from "../pages/receptionist/ReceptionistDashboard.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import HospitalDashboard from "../pages/hospital/HospitalDashboard.jsx";
import AnalyticsDashboard from "../pages/analytics/AnalyticsDashboard.jsx";
import EmergencyDashboard from "../pages/emergency/EmergencyDashboard.jsx";
import Settings from "../pages/settings/Settings.jsx";
import Profile from "../pages/profile/Profile.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";

// Navigation Context
const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const navigate = (path) => {
        window.history.pushState(null, "", path);
        setCurrentPath(path);
    };

    return (
        <NavigationContext.Provider value={{ currentPath, navigate }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigate = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error("useNavigate must be used within a NavigationProvider");
    }
    return context;
};

export const AppRoutes = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const { currentPath, navigate } = useNavigate();

    // Loader while checking session
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium">Authenticating session...</p>
            </div>
        );
    }

    // Role-based dashboard selector
    const renderRoleDashboard = () => {
        if (!user) return <Login />;
        switch (user.role) {
            case "ADMIN":
                return <AdminDashboard />;
            case "DOCTOR":
                return <DoctorDashboard />;
            case "RECEPTIONIST":
                return <ReceptionistDashboard />;
            case "PATIENT":
                return <PatientDashboard />;
            default:
                return <Dashboard />;
        }
    };

    // Public / Kiosk queue screen is always accessible
    if (currentPath === "/queue") {
        return <QueueDashboard />;
    }

    // Auth routes (redirect to dashboard if already authenticated)
    if (currentPath === "/login") {
        if (isAuthenticated) {
            navigate("/dashboard");
            return null;
        }
        return <Login />;
    }

    if (currentPath === "/register") {
        if (isAuthenticated) {
            navigate("/dashboard");
            return null;
        }
        return <Register />;
    }

    // Guard all other routes
    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    // Authenticated Routing Table
    switch (currentPath) {
        case "/dashboard":
            return renderRoleDashboard();
        case "/analytics":
            // Admins & Doctors can access Analytics
            if (user.role !== "ADMIN" && user.role !== "DOCTOR") {
                navigate("/dashboard");
                return null;
            }
            return <AnalyticsDashboard />;
        case "/hospital":
            return <HospitalDashboard />;
        case "/emergency":
            // Receptionists, Doctors, and Admins can access Emergency Dashboard
            if (user.role === "PATIENT") {
                navigate("/dashboard");
                return null;
            }
            return <EmergencyDashboard />;
        case "/settings":
            return <Settings />;
        case "/profile":
            return <Profile />;
        default:
            // Fallback redirect
            navigate("/dashboard");
            return null;
    }
};
export default AppRoutes;
