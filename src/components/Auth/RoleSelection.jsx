import React from 'react';
import { Users, UserCog, ShieldCheck } from 'lucide-react';

const RoleSelection = ({ onSelectRole }) => {
    const roles = [
        {
            id: 'citizen',
            title: 'Citizen',
            description: 'Access community issues, polls, and connect with representatives.',
            icon: Users,
            color: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700',
            borderColor: 'border-blue-100',
        },
        {
            id: 'politician',
            title: 'Politician',
            description: 'Engage with constituents, address issues, and share updates.',
            icon: UserCog,
            color: 'bg-green-600',
            hoverColor: 'hover:bg-green-700',
            borderColor: 'border-green-100',
        },
        {
            id: 'admin',
            title: 'Admin',
            description: 'Manage platform users, moderate content, and view analytics.',
            icon: ShieldCheck,
            color: 'bg-purple-600',
            hoverColor: 'hover:bg-purple-700',
            borderColor: 'border-purple-100',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="mx-auto h-20 w-20 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-200">
                        <span className="text-3xl font-bold text-white">CC</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Welcome to CiviConnect
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose your role to continue. We help build a more transparent and responsive democracy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roles.map((role, index) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.id}
                                onClick={() => onSelectRole(role.id)}
                                className={`group relative bg-white p-8 rounded-2xl border ${role.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-left animate-slide-up`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`h-14 w-14 ${role.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-inner`}>
                                    <Icon className="text-white h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {role.description}
                                </p>
                                <div className="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                    Select Role <span className="ml-2">→</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-16 text-center text-gray-500 text-sm animate-fade-in">
                    <p>© 2026 CiviConnect • Empowering Citizens through Digital Democracy</p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
