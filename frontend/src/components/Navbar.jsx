import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="w-full bg-primary text-secondary p-4 flex justify-between items-center border-b-2 border-accent">            {/* Link to the root path */}
            <Link to="/">
                <div className="text-3xl font-bold">
                    Grade Manager
                </div>
            </Link>

            {/* Buttons for Log In and Sign Up */}
            <div className="flex space-x-4">
                <Link to="/login">
                    <button className="bg-secondary text-primary px-4 py-2 rounded-lg hover:bg-accent hover:text-secondary transition-colors">
                        Log In
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="bg-secondary text-primary px-4 py-2 rounded-lg hover:bg-accent hover:text-secondary transition-colors">
                        Sign Up
                    </button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;