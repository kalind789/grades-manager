import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';
import AddClassModal from './modals/AddClassModal';
import EditClassModal from './modals/EditClassModal';

const gradeStyle = (grade) => {
    if (grade == null) return { text: 'text-slate-500', badge: 'text-slate-400 bg-slate-700/50 border-slate-600' };
    if (grade >= 90) return { text: 'text-emerald-400', badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    if (grade >= 80) return { text: 'text-blue-400', badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    if (grade >= 70) return { text: 'text-yellow-400', badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    if (grade >= 60) return { text: 'text-orange-400', badge: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
    return { text: 'text-red-400', badge: 'text-red-400 bg-red-400/10 border-red-400/20' };
};

const GradeBadge = ({ grade }) => {
    const style = gradeStyle(grade);
    return (
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${style.badge}`}>
            {grade != null ? `${grade.toFixed(1)}%` : 'No grades'}
        </span>
    );
};

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const studentname = localStorage.getItem('studentname');

    const fetchClasses = async () => {
        try {
            const res = await axiosInstance.get('/dashboard/');
            setClasses(res.data.classes);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleDelete = async (classId) => {
        if (!window.confirm('Delete this class and all its grades?')) return;
        try {
            await axiosInstance.delete(`/dashboard/${classId}/delete_class`);
            fetchClasses();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete class');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm">Loading your classes...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {studentname ? `Hey, ${studentname}` : 'Your Classes'}
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm">
                            {classes.length} {classes.length === 1 ? 'class' : 'classes'} tracked
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 text-sm"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add Class
                    </button>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                            📚
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">No classes yet</h2>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs">
                            Add your first class to start tracking grades and assignments.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors text-sm"
                        >
                            Add Your First Class
                        </button>
                    </div>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {classes.map((c) => (
                            <li
                                key={c.id}
                                className="group bg-slate-900 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="min-w-0 flex-1 pr-3">
                                        <h2 className="text-lg font-bold text-white truncate leading-snug">
                                            {c.class_name}
                                        </h2>
                                        {c.class_code && (
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium tracking-wide uppercase">
                                                {c.class_code}
                                            </p>
                                        )}
                                    </div>
                                    <GradeBadge grade={c.class_grade} />
                                </div>

                                <div className="flex-1" />

                                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800">
                                    <Link
                                        to={`/manage-class/${c.id}`}
                                        className="flex-1 text-center py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
                                    >
                                        Manage
                                    </Link>
                                    <button
                                        onClick={() => setEditingClass(c)}
                                        className="px-4 py-2 text-sm bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="px-4 py-2 text-sm text-red-400 rounded-lg border border-red-400/20 hover:bg-red-500/10 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showAddModal && (
                <AddClassModal onClose={() => setShowAddModal(false)} onClassAdded={fetchClasses} />
            )}
            {editingClass && (
                <EditClassModal
                    classData={editingClass}
                    onClose={() => setEditingClass(null)}
                    onUpdated={fetchClasses}
                />
            )}
        </>
    );
};

export default Dashboard;
