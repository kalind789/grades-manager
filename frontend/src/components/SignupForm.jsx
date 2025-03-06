import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        studentname: '',
        password1: '',
        password2: '',
        first_name: '',
        last_name: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/auth/register', formData);
            setSuccess('Registration successful!');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-primary text-secondary flex items-center justify-center">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-6 bg-secondary text-secondary shadow-lg rounded-lg space-y-4">
                <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
                <input name="studentname" placeholder="Username" onChange={handleChange} className="w-full p-3 bg-secondary text-primary border rounded" />
                <input name="password1" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 bg-secondary text-primary border rounded" />
                <input name="password2" type="password" placeholder="Confirm Password" onChange={handleChange} className="w-full p-3 bg-secondary text-primary border rounded" />
                <input name="first_name" placeholder="First Name" onChange={handleChange} className="w-full p-3 bg-secondary text-primary border rounded" />
                <input name="last_name" placeholder="Last Name" onChange={handleChange} className="w-full p-3 bg-secondary text-primary border rounded" />
                <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-3 bg-secondary text-primary border rounded" />
                <button type="submit" className="w-full p-3 bg-accent text-secondary rounded hover:bg-gray-700">
                    Sign Up
                </button>
                {error && <div className="text-red-500 text-center">{error}</div>}
                {success && <div className="text-green-500 text-center">{success}</div>}
            </form>
        </div>
    );
};

export default SignupForm;