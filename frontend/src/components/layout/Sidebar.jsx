import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "../../routes/AppRoutes.jsx";

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const { currentPath, navigate } = useNavigate();

    if (!user) return null;

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"],
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            )
        },
        {
            name: "Analytics",
            path: "/analytics",
            roles: ["ADMIN", "DOCTOR"],
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            name: "Emergency",
            path: "/emergency",
            roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"],
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            name: "Hospital Lead",
            path: "/hospital",
            roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"],
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            name: "Profile",
            path: "/profile",
            roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"],
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: "Settings",
            path: "/settings",
            roles: ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"],
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ];

    const activeClass = "bg-blue-600 text-white font-semibold glow-blue";
    const inactiveClass = "text-slate-400 hover:bg-slate-800/50 hover:text-white";

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between h-screen fixed top-0 left-0 z-30">
            <div className="p-6">
                {/* Logo / Branding */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
                        Q
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-tight font-outfit">QueueCure AI</h1>
                        <span className="text-xs font-semibold text-blue-500 px-1.5 py-0.5 rounded bg-blue-500/10">Hospital Kiosk</span>
                    </div>
                </div>

                {/* User Card */}
                <div className="mt-8 p-4 rounded-2xl bg-slate-800/40 border border-slate-800/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-blue-400">
                        {user.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-slate-100">{user.fullName}</p>
                        <p className="text-xs text-blue-500 font-medium tracking-wide mt-0.5">{user.role}</p>
                    </div>
                </div>

                {/* Menu items */}
                <nav className="mt-8 space-y-1.5">
                    {navItems
                        .filter((item) => item.roles.includes(user.role))
                        .map((item) => {
                            const isActive = currentPath === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                                        isActive ? activeClass : inactiveClass
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                </nav>
            </div>

            {/* Logout button */}
            <div className="p-6 border-t border-slate-800/60">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-900/30"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};
export default Sidebar;
