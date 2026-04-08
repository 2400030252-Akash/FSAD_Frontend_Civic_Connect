import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Loader2, Phone, MapPin, Hash, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import emailjs from '@emailjs/browser';

const CitizenAuth = ({ onBack }) => {
    const { login, register, isLoading } = useAuth();
    const [authMode, setAuthMode] = useState('choice'); // 'choice', 'login', 'signup', 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        number: '',
        location: '',
        pincode: '',
        role: 'citizen',
    });
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // EmailJS Credentials
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

    const handleNumericInput = (e, field) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, [field]: value });
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
            setSuccessMsg('OTP sent to your email!');
        } catch (err) {
            console.error('EmailJS Error:', err);
            setError('Failed to send OTP. Please try again.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password || !formData.number || !formData.location || !formData.pincode) {
            setError('Please fill in all fields');
            return;
        }

        // Instead of registering immediately, we send OTP first
        await generateAndSendOtp();
    };

    const verifyOtp = async () => {
        if (otp === generatedOtp) {
            // Complete registration
            const success = await register(formData);
            if (success) {
                await saveAuthEventToDb({ ...formData, action: 'register' });
                setSuccessMsg('Registration successful! Please login.');
                setAuthMode('login');
                setFormData({ ...formData, password: '' }); // Clear password for login
            } else {
                setError('Registration failed. Please try again.');
            }
        } else {
            setError('Invalid OTP. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(formData.email, formData.password, 'citizen');
        if (success) {
            await saveAuthEventToDb({ email: formData.email, password: formData.password, role: 'citizen', action: 'login' });
        } else {
            setError('Invalid Gmail or password');
        }
    };

    if (authMode === 'choice') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <button onClick={onBack} className="flex items-center text-gray-600 hover:text-primary-600 mb-8 transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back to Role Selection
                    </button>
                    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Citizen Access</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setAuthMode('login')}
                                className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center"
                            >
                                <LogIn className="mr-2" size={22} /> Sign In
                            </button>
                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">or</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                            <button
                                onClick={() => setAuthMode('signup')}
                                className="w-full bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center"
                            >
                                <UserPlus className="mr-2" size={22} /> Create New Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (authMode === 'otp') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
                        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="text-blue-600 h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your Email</h2>
                        <p className="text-gray-600 mb-8">We've sent a 6-digit code to {formData.email}</p>

                        <div className="space-y-6">
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full text-center text-3xl font-bold tracking-[1em] py-4 border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-0 transition-all"
                                placeholder="000000"
                            />

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

                            <button
                                onClick={verifyOtp}
                                className="w-full btn-primary py-4 text-lg font-semibold"
                            >
                                Verify & Register
                            </button>

                            <button
                                onClick={generateAndSendOtp}
                                className="text-primary-600 font-medium hover:text-primary-800"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <button onClick={() => setAuthMode('choice')} className="flex items-center text-gray-600 hover:text-primary-600 mb-4 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {authMode === 'signup' ? 'Join CiviConnect' : 'Welcome Back'}
                        </h2>
                        <p className="mt-2 text-gray-600">
                            {authMode === 'signup' ? 'Participate in your community' : 'Sign in as a Citizen'}
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={authMode === 'signup' ? handleSignup : handleLogin}>
                        {authMode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <UserPlus size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <Phone size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={formData.number}
                                            onChange={(e) => handleNumericInput(e, 'number')}
                                            className="input-field pl-10"
                                            placeholder="10 digit number"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                                <MapPin size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="City"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                                <Hash size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                value={formData.pincode}
                                                onChange={(e) => handleNumericInput(e, 'pincode')}
                                                className="input-field pl-10"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="name@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
                        {successMsg && <p className="text-green-500 text-sm bg-green-50 p-2 rounded">{successMsg}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : authMode === 'signup' ? (
                                'Generate OTP'
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                    setError('');
                                }}
                                className="text-sm font-medium text-primary-600 hover:text-primary-800"
                            >
                                {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CitizenAuth;
