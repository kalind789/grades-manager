import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';

const LoginForm = () => {
    const [studentname, setStudentname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axiosInstance.post('/auth/login', { studentname, password });
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('studentname', res.data.studentname);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-primary text-secondary flex items-center justify-center px-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md p-8 bg-secondary text-primary shadow-lg rounded-lg space-y-4"
                >
                    <h2 className="text-2xl font-bold text-center">Log In</h2>

                    <input
                        value={studentname}
                        onChange={(e) => setStudentname(e.target.value)}
                        placeholder="Username"
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 bg-primary text-secondary rounded hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <p className="text-center text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </>
    );
};

export default LoginForm;
