import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        studentname: '',
        password1: '',
        password2: '',
        first_name: '',
        last_name: '',
        email: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('/auth/register', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
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
                    <h2 className="text-2xl font-bold text-center">Create Account</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="first_name"
                            placeholder="First Name"
                            onChange={handleChange}
                            required
                            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                        <input
                            name="last_name"
                            placeholder="Last Name"
                            onChange={handleChange}
                            required
                            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                        name="studentname"
                        placeholder="Username"
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                        name="password1"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <input
                        name="password2"
                        type="password"
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-600 text-sm text-center">{success}</p>}

                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-secondary rounded hover:bg-gray-800 transition-colors font-semibold"
                    >
                        Sign Up
                    </button>

                    <p className="text-center text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log In
                        </Link>
                    </p>
                </form>
            </div>
        </>
    );
};

export default SignupForm;
