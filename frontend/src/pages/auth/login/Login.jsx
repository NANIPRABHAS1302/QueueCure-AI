import { useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate } from "../../../routes/AppRoutes.jsx";

export const Login = () => {
    const { login } = useAuth();
    const { navigate } = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await login(email, password);
            if (res.success) {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message || "Failed to log in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background glowing blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl -z-10 animate-pulse delay-1000"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-3xl shadow-xl shadow-blue-500/20">
                        Q
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold font-outfit text-white tracking-tight">
                    Sign in to QueueCure-AI
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Or{" "}
                    <button
                        onClick={() => navigate("/register")}
                        className="font-semibold text-blue-500 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                    >
                        create a new account
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card shadow-2xl rounded-3xl p-8 sm:p-10 border border-slate-800">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Email Address
                            </label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="doctor@queuecure.com"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-sm placeholder-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-600 focus:outline-none text-white text-sm placeholder-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 glow-blue cursor-pointer"
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800/80 flex justify-between text-xs text-slate-500">
                        <span>Admin demo: admin@queuecure.com / admin123</span>
                        <button onClick={() => navigate("/queue")} className="text-blue-500 hover:underline">kiosk display</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
