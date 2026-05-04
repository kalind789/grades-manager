import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const studentname = localStorage.getItem('studentname');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('studentname');
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
                <Link
                    to="/"
                    className="text-lg font-bold text-white hover:text-indigo-400 transition-colors tracking-tight"
                >
                    Grade Manager
                </Link>

                <div className="flex items-center gap-3">
                    {token ? (
                        <>
                            {studentname && (
                                <span className="hidden sm:block text-sm text-slate-400 font-medium">
                                    {studentname}
                                </span>
                            )}
                            <Link
                                to="/dashboard"
                                className="text-sm text-slate-300 hover:text-white transition-colors"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm bg-slate-800 text-slate-200 px-4 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm text-slate-300 hover:text-white transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-500 transition-colors font-medium"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
