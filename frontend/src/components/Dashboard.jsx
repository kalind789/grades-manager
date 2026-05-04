import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';
import AddClassModal from './modals/AddClassModal';
import EditClassModal from './modals/EditClassModal';

const gradeColor = (grade) => {
    if (grade == null) return 'text-gray-400';
    if (grade >= 90) return 'text-green-500';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-yellow-400';
    if (grade >= 60) return 'text-orange-400';
    return 'text-red-500';
};

const gradeLabel = (grade) => {
    if (grade == null) return 'No grades yet';
    return `${grade.toFixed(1)}%`;
};

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);

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
                <div className="min-h-screen bg-primary text-secondary flex items-center justify-center">
                    <p className="text-accent text-lg">Loading your classes...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-primary text-secondary px-4 py-10">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Your Classes</h1>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-secondary text-primary font-semibold rounded hover:bg-gray-200 transition-colors"
                        >
                            + Add Class
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-center mb-6">{error}</p>
                    )}

                    {classes.length === 0 ? (
                        <div className="text-center py-20 text-accent">
                            <p className="text-xl mb-2">No classes yet.</p>
                            <p className="text-sm">Click "Add Class" to get started.</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {classes.map((c) => (
                                <li
                                    key={c.id}
                                    className="p-5 bg-secondary text-primary rounded-lg shadow flex items-center justify-between gap-4"
                                >
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-semibold truncate">{c.class_name}</h2>
                                        {c.class_code && (
                                            <p className="text-sm text-accent">{c.class_code}</p>
                                        )}
                                        <p className={`text-lg font-bold mt-1 ${gradeColor(c.class_grade)}`}>
                                            {gradeLabel(c.class_grade)}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                        <Link
                                            to={`/manage-class/${c.id}`}
                                            className="px-3 py-1.5 text-sm bg-primary text-secondary rounded hover:bg-gray-800 transition-colors text-center"
                                        >
                                            Manage
                                        </Link>
                                        <button
                                            onClick={() => setEditingClass(c)}
                                            className="px-3 py-1.5 text-sm bg-accent text-secondary rounded hover:bg-gray-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddClassModal
                    onClose={() => setShowAddModal(false)}
                    onClassAdded={fetchClasses}
                />
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
