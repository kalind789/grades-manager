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
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    const inputClass = "w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";
    const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Create account</h1>
                        <p className="text-slate-400 mt-2">Start tracking your grades today</p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 shadow-2xl space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input name="first_name" placeholder="Jane" onChange={handleChange} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input name="last_name" placeholder="Doe" onChange={handleChange} required className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Email</label>
                            <input name="email" type="email" placeholder="jane@example.com" onChange={handleChange} className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Username</label>
                            <input name="studentname" placeholder="your_username" onChange={handleChange} required className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Password</label>
                            <input name="password1" type="password" placeholder="••••••••" onChange={handleChange} required className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <input name="password2" type="password" placeholder="••••••••" onChange={handleChange} required className={inputClass} />
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/10"
                        >
                            Create Account
                        </button>

                        <p className="text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
