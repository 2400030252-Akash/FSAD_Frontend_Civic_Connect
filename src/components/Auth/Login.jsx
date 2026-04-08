import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, register, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    district: '',
    number: '',
    location: '',
    pincode: '',
  });
  const [error, setError] = useState('');

  // 👉 helper to save login/register event to your Node + MongoDB backend
  const saveAuthEventToDb = async (payload) => {
    try {
      console.log("📤 Saving auth event:", payload);
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log("✅ Auth event saved successfully");
      } else {
        const errData = await response.json();
        console.error("❌ Auth event save failed:", errData);
      }
    } catch (err) {
      console.error('Failed to save to MongoDB:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      // REGISTER FLOW - Only require basic info for registration completion
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in Name, Gmail and Password');
        return;
      }

      const success = await register({
        ...formData
      });

      if (!success) {
        setError('Registration failed. Please try again.');
      } else {
        // ✅ log registration event to MongoDB
        saveAuthEventToDb({
          ...formData,
          action: 'register',
        });
      }
    } else {
      // LOGIN FLOW
      const success = await login(formData.email, formData.password);

      if (!success) {
        setError('Invalid Gmail or password. Try demo accounts with password "demo"');
      } else {
        // ✅ log login event to MongoDB
        saveAuthEventToDb({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          district: formData.district || undefined,
          action: 'login',
        });
      }
    }
  };

  const demoCredentials = [
    { email: 'admin@civiconnect.gov', role: 'Admin', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { email: 'john@email.com', role: 'Citizen', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { email: 'sarah.johnson@parliament.gov', role: 'Politician', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
    { email: 'moderator@civiconnect.gov', role: 'Moderator', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">CC</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CiviConnect</h1>
          <h2 className="text-xl font-semibold text-gray-600">
            {isRegisterMode ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Connecting citizens with their representatives
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Registration Fields */}
            {isRegisterMode && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="politician">Politician</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                    District (Optional)
                  </label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="input-field"
                    placeholder="Enter your district"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="number"
                      name="number"
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="input-field"
                      placeholder="Phone"
                    />
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="input-field"
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Address / Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slide-up">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : isRegisterMode ? (
                <UserPlus size={20} className="mr-2" />
              ) : (
                <LogIn size={20} className="mr-2" />
              )}
              {isLoading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In'}
            </button>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                  setFormData({ name: '', email: '', password: '', role: 'citizen', district: '' });
                }}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
              >
                {isRegisterMode
                  ? 'Already have an account? Sign in'
                  : 'Need an account? Register here'
                }
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          {!isRegisterMode && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      email: cred.email,
                      password: 'demo',
                      role: cred.role.toLowerCase()
                    })}
                    className={`w-full text-left px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${cred.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">{cred.role}</span>
                        <div className="text-gray-600 text-xs mt-1">{cred.email}</div>
                      </div>
                      <div className="text-xs text-gray-500">Click to use</div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="mt-4 text-xs text-center text-gray-500">
                All demo accounts use password: <span className="font-mono bg-gray-100 px-1 rounded">demo</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 CiviConnect. Empowering democratic participation.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
