import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axiosInstance.get('/dashboard/');
                setClasses(res.data.classes);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load classes');
            }
        };
        fetchClasses();
    }, []);

    return (
        <div className="min-h-screen bg-primary text-secondary flex items-center justify-center">

            <div className="min-h-screen bg-primary text-secondary p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Classes</h1>
                {error && <div className="text-red-500 text-center">{error}</div>}
                <ul className="max-w-md mx-auto space-y-4">
                    {classes.map((c) => (
                        <li key={c.id} className="p-4 bg-secondary text-primary shadow rounded-lg">
                            <h2 className="text-xl font-semibold">{c.class_name}</h2>
                            <p className="text-accent">{c.class_code}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;