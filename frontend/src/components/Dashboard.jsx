import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';
import AddClassModal from './modals/AddClassModal';

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState('');
    const [showAddClassModal, setShowAddClassModal] = useState(false);

    const fetchClasses = async () => {
        try {
            const res = await axiosInstance.get('/dashboard/');
            setClasses(res.data.classes);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load classes');
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleDeleteClass = async (classId) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await axiosInstance.delete(`/dashboard/${classId}/delete_class`);
            fetchClasses();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete class');
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-primary text-secondary p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Classes</h1>
                {error && <div className="text-red-500 text-center">{error}</div>}

                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setShowAddClassModal(true)}
                        className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                    >
                        Add Class
                    </button>
                </div>

                <ul className="max-w-md mx-auto space-y-4">
                    {classes.map((c) => (
                        <li key={c.id} className="p-4 bg-secondary text-primary shadow rounded-lg">
                            <h2 className="text-xl font-semibold">{c.class_name}</h2>
                            <p className="text-accent">{c.class_code}</p>
                            <div className="mt-4 flex space-x-2">
                                <Link
                                    to={`/manage-class/${c.id}`}
                                    className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                                >
                                    Manage
                                </Link>
                                <Link
                                    to={`/edit-class/${c.id}`}
                                    className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeleteClass(c.id)}
                                    className="px-4 py-2 bg-red-600 text-secondary rounded hover:bg-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showAddClassModal && (
                <AddClassModal
                    onClose={() => setShowAddClassModal(false)}
                    onClassAdded={fetchClasses}
                />
            )}
        </>
    );
};

export default Dashboard;