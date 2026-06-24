import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

export const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Left Hand Sidebar Navigation */}
            <Sidebar />

            <div className="flex-1 flex flex-col pl-64">
                {/* Top Action Navbar */}
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-1 p-8 mt-20 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
export default DashboardLayout;
