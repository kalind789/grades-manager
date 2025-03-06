import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';

const LoginForm = () => {
    const [studentname, setStudentname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/auth/login', { studentname, password });
            localStorage.setItem('token', res.data.access_token);
            // Save the username so we can show it in the Navbar
            localStorage.setItem('studentname', studentname);
            setError('');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <>
        <Navbar />
        <div className="min-h-screen bg-primary text-secondary flex items-center justify-center">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-6 bg-secondary text-primary shadow-lg rounded-lg space-y-4">
                <h2 className="text-2xl font-semibold text-center">Log In</h2>
                <input
                    value={studentname}
                    onChange={(e) => setStudentname(e.target.value)}
                    placeholder="Username"
                    className="w-full p-3 bg-secondary text-primary border rounded"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-3 bg-secondary text-primary border rounded"
                />
                <button type="submit" className="w-full p-3 bg-primary text-secondary rounded hover:bg-gray-700">
                    Log In
                </button>
                {error && <div className="text-red-500 text-center">{error}</div>}
                <p className="text-center">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </form>
        </div>
        </>
    );
};

export default LoginForm;