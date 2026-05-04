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
        <nav className="flex justify-between items-center px-6 py-4 bg-primary text-secondary border-b border-gray-800">
            <Link to="/" className="text-lg font-bold tracking-wide">Grade Manager</Link>
            <div className="flex items-center space-x-4">
                {token ? (
                    <>
                        {studentname && (
                            <span className="text-accent text-sm hidden sm:inline">
                                {studentname}
                            </span>
                        )}
                        <Link
                            to="/dashboard"
                            className="text-sm hover:text-gray-300 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm bg-accent text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm hover:text-gray-300 transition-colors">
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="text-sm bg-accent text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
