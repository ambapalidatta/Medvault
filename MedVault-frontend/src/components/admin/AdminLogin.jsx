import { useState } from "react";
import Icon from "./Icon.jsx";
import { API_BASE_URL } from "../../services/adminApi.js";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Call backend to authenticate admin
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const userData = await response.json();
                // Check if user is admin
                if (userData.role && userData.role.toUpperCase() === 'ADMIN') {
                    if (!userData.token) {
                        setError('Login failed: token missing from server response.');
                        return;
                    }

                    sessionStorage.setItem('adminAuthToken', userData.token);
                    localStorage.setItem('adminEmail', userData.email || email);
                    onLogin('admin', userData.email || email);
                } else {
                    setError('Access denied. Only administrators can login here.');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Invalid email or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 login-page-bg">
            <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
                    {/* Left Side - Gradient with branding */}
                    <div className="md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #10b981 50%, #fbbf24 100%)' }}>
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
                        <div className="relative z-10">
                            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-12">
                                <Icon name="ArrowLeft" size={18} /> Back to Home
                            </button>
                            
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6">
                                <Icon name="ShieldCheck" size={40} className="text-white" />
                            </div>
                            <h2 className="text-4xl font-bold mb-3">Admin Portal</h2>
                            <p className="text-white/90 text-lg">Welcome back, Administrator.<br/>Please sign in to continue.</p>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="md:w-7/12 p-12 bg-white flex flex-col justify-center">
                        <h3 className="text-3xl font-bold text-slate-900 mb-3">Sign In</h3>
                        <p className="text-sm text-slate-500 mb-8">Use admin@medvault.com / admin123</p>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                <Icon name="AlertCircle" size={16} className="inline mr-2" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Icon name="Mail" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                        placeholder="admin@medvault.com"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <Icon name="Lock" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="LogIn" size={20} />
                                        Access Dashboard
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
    );
}
