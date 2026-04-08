import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Loader2, Mail, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import emailjs from '@emailjs/browser';

const AdminAuth = ({ onBack }) => {
    const { login, register, isLoading } = useAuth();
    const [authMode, setAuthMode] = useState('choice'); // 'choice', 'login', 'signup', 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // EmailJS Credentials (Same as Citizen)
    const SERVICE_ID = 'service_h1wgn9o';
    const TEMPLATE_ID = 'template_pjtu9ze';
    const PUBLIC_KEY = 'Uo59woSedRXhXTqGV';

    const saveAuthEventToDb = async (payload) => {
        try {
            await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error('Failed to save to MongoDB:', err);
        }
    };

    const generateAndSendOtp = async () => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);

        try {
            const templateParams = {
                name: formData.name,
                email: formData.email,
                password: newOtp, // The template uses {{password}} for OTP
            };

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            setAuthMode('otp');
            setSuccessMsg('OTP sent to your official admin email!');
        } catch (err) {
            console.error('EmailJS Error:', err);
            setError('Failed to send OTP. Please try again.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        await generateAndSendOtp();
    };

    const verifyOtp = async () => {
        if (otp === generatedOtp) {
            const success = await register(formData);
            if (success) {
                await saveAuthEventToDb({ ...formData, action: 'register' });
                setSuccessMsg('Admin registration successful! Please login.');
                setAuthMode('login');
                setFormData({ ...formData, password: '' });
            } else {
                setError('Registration failed.');
            }
        } else {
            setError('Invalid OTP.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        console.log("🚀 Attempting admin login for:", formData.email);

        const success = await login(formData.email, formData.password, 'admin');
        console.log("📊 Login result success:", success);

        if (success) {
            // Log the event but don't wait for it to move the user forward
            saveAuthEventToDb({ email: formData.email, password: formData.password, role: 'admin', action: 'login' });
        } else {
            setError('Invalid Gmail or password');
        }
    };

    if (authMode === 'choice') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center text-white">
                    <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back to Role Selection
                    </button>
                    <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700">
                        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-8">Admin Control Panel</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setAuthMode('login')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl flex items-center justify-center transition-all shadow-lg"
                            >
                                <LogIn className="mr-2" size={22} /> Admin Sign In
                            </button>
                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-slate-700"></div>
                                <span className="flex-shrink mx-4 text-slate-500 text-sm font-medium uppercase tracking-wider">Internal Use</span>
                                <div className="flex-grow border-t border-slate-700"></div>
                            </div>
                            <button
                                onClick={() => setAuthMode('signup')}
                                className="w-full bg-slate-700 text-blue-400 border border-slate-600 hover:bg-slate-600 py-4 text-lg font-semibold rounded-xl transition-all flex items-center justify-center"
                            >
                                <UserPlus className="mr-2" size={22} /> Register Administrator
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (authMode === 'otp') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center text-white">
                        <div className="mx-auto h-16 w-16 bg-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="text-white h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Security Verification</h2>
                        <p className="text-slate-400 mb-8">Verification code sent to {formData.email}</p>

                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-slate-900 text-center text-3xl font-bold tracking-[1em] py-4 border-2 border-slate-700 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-white mb-6"
                            placeholder="000000"
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button onClick={verifyOtp} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg">
                            Confirm Access
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-white">
                <button onClick={() => setAuthMode('choice')} className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="bg-slate-800 py-10 px-8 shadow-2xl rounded-2xl border border-slate-700">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-white">
                            {authMode === 'signup' ? 'Admin Registration' : 'Secure Login'}
                        </h2>
                    </div>

                    <form className="space-y-5" onSubmit={authMode === 'signup' ? handleSignup : handleLogin}>
                        {authMode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                        <UserCheck size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 transition-all"
                                        placeholder="Administrator Name"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Official Email address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 transition-all"
                                    placeholder="admin@civicconnect.gov"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
                        {successMsg && <p className="text-emerald-400 text-sm bg-emerald-900/20 p-2 rounded border border-emerald-900/50">{successMsg}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold flex items-center justify-center rounded-xl transition-all shadow-lg"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : authMode === 'signup' ? 'Verify Admin Identity' : 'Log Into Dashboard'}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                    setError('');
                                }}
                                className="text-sm font-medium text-blue-400 hover:text-blue-300"
                            >
                                {authMode === 'login' ? "Register New Authority?" : "Access Existing Account?"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
