import React, { useState, useEffect } from 'react';
import {
    Users,
    UserX,
    AlertTriangle,
    Settings,
    Search,
    Filter,
    MoreVertical,
    UserPlus,
    ShieldAlert,
    Terminal,
    Activity,
    LogOut,
    ChevronRight,
    UserCheck,
    Ban,
    Mail,
    Calendar,
    Shield,
    Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../data/mockData';

const AdminTerminal = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('logins'); // 'logins', 'terminate', 'system'
    const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all', 'citizen', 'politician'
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/users');
            const data = await response.json();

            // Safety check: ensure 'data' is an array before processing
            const dbUsers = Array.isArray(data) ? data : [];

            // Merge mockUsers with dbUsers, avoiding duplicates by email
            const merged = [...dbUsers];
            mockUsers.forEach(mockU => {
                if (!merged.find(u => u.email === mockU.email)) {
                    merged.push({
                        ...mockU,
                        _id: mockU.id || `mock-${mockU.email}`,
                        warningsCount: mockU.warningsCount || 0,
                        isBlocked: mockU.isBlocked || false
                    });
                }
            });

            setUsers(merged);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to just mockUsers if backend fails or returns invalid data
            setUsers(mockUsers.map(u => ({
                ...u,
                _id: u.id || `mock-${u.email}`,
                warningsCount: u.warningsCount || 0,
                isBlocked: u.isBlocked || false
            })));
        } finally {
            setIsLoading(false);
        }
    };

    const handleWarnUser = async (email) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/warn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                alert('Warning issued successfully to ' + email);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error warning user:', error);
        }
    };

    const handleToggleBlock = async (email, currentStatus) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/toggle-block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, status: !currentStatus })
            });
            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
        }
    };

    const filteredUsers = users.filter(u => {
        const userName = u.name || 'Anonymous User';
        const userEmail = u.email || '';
        const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            userEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        citizens: users.filter(u => u.role === 'citizen').length,
        politicians: users.filter(u => u.role === 'politician').length,
        blocked: users.filter(u => u.isBlocked).length
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300 font-mono">
            {/* Header */}
            <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-1.5 rounded-md shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            <Terminal size={20} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">ADMIN_CONTROL_CENTER_v2.0</h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden lg:flex items-center space-x-4 px-4 py-1.5 bg-slate-900/50 rounded-full border border-slate-700/50">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-semibold text-emerald-400">SYS_ONLINE</span>
                            </div>
                            <div className="w-px h-3 bg-slate-700"></div>
                            <span className="text-xs text-slate-400">ACCESS: LEVEL_OVERRIDE</span>
                        </div>
                        <button onClick={logout} className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors">
                            <LogOut size={16} className="mr-2" /> EXIT_SESSION
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Nav */}
                <aside className="lg:w-64 space-y-2 shrink-0">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">Command Menu</div>
                    <button
                        onClick={() => setActiveTab('logins')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'logins' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'hover:bg-slate-800/50 text-slate-400'}`}
                    >
                        <Users size={20} />
                        <span className="font-semibold">User Logins</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('terminate')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'terminate' ? 'bg-red-600/10 text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'hover:bg-slate-800/50 text-slate-400'}`}
                    >
                        <Ban size={20} />
                        <span className="font-semibold">Termination</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'system' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'hover:bg-slate-800/50 text-slate-400'}`}
                    >
                        <Activity size={20} />
                        <span className="font-semibold">System Health</span>
                    </button>

                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Quick Stats</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 text-xs">TOTAL:</span>
                                    <span className="text-white font-bold">{stats.total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 text-xs">BLOCKED:</span>
                                    <span className="text-red-400 font-bold">{stats.blocked}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 space-y-6">
                    {activeTab === 'logins' || activeTab === 'terminate' ? (
                        <>
                            {/* Content Header & Filters */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setUserRoleFilter('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${userRoleFilter === 'all' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        ALL_USERS
                                    </button>
                                    <button
                                        onClick={() => setUserRoleFilter('citizen')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${userRoleFilter === 'citizen' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        CITIZENS
                                    </button>
                                    <button
                                        onClick={() => setUserRoleFilter('politician')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${userRoleFilter === 'politician' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        POLITICIANS
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search query [NAME or EMAIL]..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm w-full md:w-64 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-800/40 border-b border-slate-800">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User / Access Ident</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Auth Role</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status / Health</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                                                    {activeTab === 'logins' ? 'PROFILE_DATA' : 'OPERATIONS'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                        NO RECORDS FOUND IN CURRENT ARCHIVE
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((u) => (
                                                    <tr key={u._id} className="hover:bg-slate-800/20 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${u.role === 'politician' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                                                    {u.name ? u.name.charAt(0) : '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-bold text-sm tracking-tight">{u.name || 'Anonymous User'}</div>
                                                                    <div className="text-xs text-slate-500 flex items-center mt-0.5">
                                                                        <Mail size={12} className="mr-1.5" /> {u.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'politician' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            {u.isBlocked ? (
                                                                <div className="flex items-center space-x-2 text-red-500">
                                                                    <Ban size={14} />
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">TERMINATED</span>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center space-x-2 text-emerald-500">
                                                                        <UserCheck size={14} />
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">AUTHORIZED</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1">
                                                                        {[1, 2, 3].map(i => (
                                                                            <div key={i} className={`h-1 w-3 rounded-full ${i <= u.warningsCount ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`}></div>
                                                                        ))}
                                                                        <span className="text-[9px] text-slate-500 ml-1">STRKS: {u.warningsCount}/3</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                {activeTab === 'logins' ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUser(u);
                                                                            setShowModal(true);
                                                                        }}
                                                                        className="px-4 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-600/20 transition-all flex items-center"
                                                                    >
                                                                        <Eye size={14} className="mr-2" /> VIEW_DATA
                                                                    </button>
                                                                ) : (
                                                                    u.isBlocked ? (
                                                                        <button
                                                                            onClick={() => handleToggleBlock(u.email, true)}
                                                                            className="px-3 py-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-600/20 transition-all"
                                                                        >
                                                                            RESTORE_ACCESS
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleWarnUser(u.email)}
                                                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                                                title="Issue Warning"
                                                                            >
                                                                                <ShieldAlert size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleToggleBlock(u.email, false)}
                                                                                className="p-2 text-slate-400 hover:bg-red-600/10 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                                                title="Terminate Immediate"
                                                                            >
                                                                                <Ban size={18} />
                                                                            </button>
                                                                        </>
                                                                    )
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* System Health Placeholders */}
                            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white font-bold text-sm tracking-widest uppercase">Database Latency</h3>
                                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><Activity size={20} /></div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">12ms</div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[15%]"></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Protocol: MONGO_LOCAL</p>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white font-bold text-sm tracking-widest uppercase">Server Load</h3>
                                    <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg"><Activity size={20} /></div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">4.2%</div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[12%]"></div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Status: NOMINAL</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-white font-bold tracking-tight uppercase">USER_DATA_ARCHIVE :: {selectedUser.name}</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Full Identity</label>
                                    <p className="text-white font-bold">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Access Email</label>
                                    <p className="text-blue-400">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Interaction Role</label>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">{selectedUser.role}</span>
                                </div>
                                {selectedUser.joinedAt && (
                                    <div>
                                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Protocol Initialization</label>
                                        <p className="text-slate-400 text-sm whitespace-pre-wrap flex items-center">
                                            <Calendar size={14} className="mr-2" /> {new Date(selectedUser.joinedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4 border-l border-slate-800 pl-6">
                                {selectedUser.role === 'citizen' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Contact Metadata</label>
                                            <p className="text-slate-300 text-sm">{selectedUser.number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Geolocation</label>
                                            <p className="text-slate-300 text-sm">{selectedUser.location || 'N/A'} (PIN: {selectedUser.pincode || 'N/A'})</p>
                                        </div>
                                    </>
                                )}
                                {selectedUser.role === 'politician' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Sovereign District</label>
                                            <p className="text-slate-300 text-sm">{selectedUser.district || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Official Position</label>
                                            <p className="text-slate-300 text-sm">{selectedUser.position || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Service Sector</label>
                                            <p className="text-slate-300 text-sm">{selectedUser.serviceSector || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Security Health</label>
                                    <div className="flex items-center space-x-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${selectedUser.isBlocked ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
                                        <span className={`text-[10px] font-bold ${selectedUser.isBlocked ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {selectedUser.isBlocked ? 'TERMINATED' : 'NOMINAL_ACCESS'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">Current Violations: {selectedUser.warningsCount || 0} / 03</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 px-8 py-4 border-t border-slate-800 text-right">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
                            >
                                CLOSE_ARCHIVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTerminal;
