import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Loader2, Mail, ArrowLeft, ShieldCheck, Briefcase, MapPin, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import emailjs from '@emailjs/browser';

const PoliticianAuth = ({ onBack }) => {
    const { login, register, isLoading } = useAuth();
    const [authMode, setAuthMode] = useState('choice'); // 'choice', 'login', 'signup', 'otp'
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        officialEmail: '',
        password: '',
        serviceSector: '',
        otherServiceSector: '',
        position: '',
        district: '',
        role: 'politician',
    });
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // EmailJS Credentials
    const SERVICE_ID = 'service_h1wgn9o';
    const PUBLIC_KEY = 'Uo59woSedRXhXTqGV';
    const TEMPLATE_ID = 'template_pjtu9ze';

    const serviceSectors = [
        'Healthcare',
        'Education',
        'Public Infrastructure',
        'Social Welfare',
        'Environment & Sustainability',
        'Public Safety & Security',
        'Economy & Finance',
        'Agriculture & Rural Development',
        'Technology & Innovation',
        'Others'
    ];

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
                email: formData.officialEmail,
                password: newOtp, // Usually used as OTP in these templates
            };

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
            setAuthMode('otp');
            setSuccessMsg('OTP sent to your official email!');
        } catch (err) {
            console.error('EmailJS Error:', err);
            setError('Failed to send OTP. Please check your internet connection.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.officialEmail || !formData.password || !formData.serviceSector || !formData.position || !formData.district) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.serviceSector === 'Others' && !formData.otherServiceSector) {
            setError('Please specify your service sector');
            return;
        }

        await generateAndSendOtp();
    };

    const verifyOtp = async () => {
        if (otp === generatedOtp) {
            // Use officialEmail as the primary email for registration
            const registrationData = {
                ...formData,
                email: formData.officialEmail
            };
            const success = await register(registrationData);
            if (success) {
                await saveAuthEventToDb({ ...registrationData, action: 'register' });
                setSuccessMsg('Registration successful! Please login.');
                setAuthMode('login');
                // Clear password for login mode
                setFormData(prev => ({ ...prev, password: '' }));
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
        // Login using officialEmail and password
        const success = await login(formData.officialEmail, formData.password, 'politician');
        if (success) {
            await saveAuthEventToDb({ email: formData.officialEmail, password: formData.password, role: 'politician', action: 'login' });
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Politician Portal</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setAuthMode('login')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-xl flex items-center justify-center transition-colors"
                            >
                                <LogIn className="mr-2" size={22} /> Politician Sign In
                            </button>
                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium uppercase tracking-wider">or</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                            <button
                                onClick={() => setAuthMode('signup')}
                                className="w-full bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center"
                            >
                                <UserPlus className="mr-2" size={22} /> Create Official Account
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
                        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="text-green-600 h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Internal Verification</h2>
                        <p className="text-gray-600 mb-8">Verification code sent to {formData.officialEmail}</p>
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full text-center text-3xl font-bold tracking-[1em] py-4 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:ring-0 transition-all mb-6"
                            placeholder="000000"
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button onClick={verifyOtp} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold">
                            Verify Credentials
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8">
                <button onClick={() => setAuthMode('choice')} className="flex items-center text-gray-600 hover:text-primary-600 mb-4 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {authMode === 'signup' ? 'Politician Registration' : 'Official Login'}
                        </h2>
                    </div>

                    <form className="space-y-5" onSubmit={authMode === 'signup' ? handleSignup : handleLogin}>
                        {authMode === 'signup' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field"
                                            placeholder="Hon. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Position / Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="input-field"
                                            placeholder="e.g. Member of Parliament"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Sector</label>
                                    <select
                                        required
                                        value={formData.serviceSector}
                                        onChange={(e) => setFormData({ ...formData, serviceSector: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Sector</option>
                                        {serviceSectors.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {formData.serviceSector === 'Others' && (
                                    <div className="animate-slide-up">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Please specify sector</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.otherServiceSector}
                                            onChange={(e) => setFormData({ ...formData, otherServiceSector: e.target.value })}
                                            className="input-field"
                                            placeholder="Internal Affairs, etc."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        className="input-field"
                                        placeholder="Your Constituency"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Official Gmail / Email</label>
                            <input
                                type="email"
                                required
                                value={formData.officialEmail}
                                onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                                className="input-field"
                                placeholder="name@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 text-lg font-semibold flex items-center justify-center rounded-xl text-white transition-all ${authMode === 'login' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : authMode === 'signup' ? 'Verify Official Email' : 'Sign In'}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                    setError('');
                                    setSuccessMsg('');
                                }}
                                className="text-sm font-medium text-green-600 hover:text-green-800"
                            >
                                {authMode === 'login' ? "New Representative? Apply here" : "Already registered? Sign in"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PoliticianAuth;
