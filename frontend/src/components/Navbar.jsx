import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-primary text-secondary">
            <Link to="/" className="text-lg font-bold">Grades Manager</Link>
            <div className="space-x-4">
                {token ? (
                    <>
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                        <button
                            onClick={handleLogout}
                            className="bg-accent text-secondary px-3 py-1 rounded hover:bg-gray-700"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:underline">Log In</Link>
                        <Link to="/signup" className="hover:underline">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;