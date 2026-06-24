import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "../../routes/AppRoutes.jsx";

export const Dashboard = () => {
    const { user } = useAuth();
    const { navigate } = useNavigate();

    return (
        <DashboardLayout>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full">
                        System Online
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white tracking-tight leading-tight">
                        QueueCure Hospital Management System
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Access AI symptom guidance, book check-ins, or manage queues from your specific control panel. Use the sidebar navigation to navigate sections.
                    </p>
                    <div className="pt-4 flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate("/profile")}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 cursor-pointer"
                        >
                            View Account Profile
                        </button>
                        <button
                            onClick={() => navigate("/settings")}
                            className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
                        >
                            Configure Preferences
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
export default Dashboard;
