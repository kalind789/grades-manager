import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-primary text-secondary">
            <Navbar />

            <motion.div
                className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center px-4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.h1
                    className="text-5xl sm:text-6xl font-bold mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    Grade Manager
                </motion.h1>

                <motion.p
                    className="text-lg sm:text-xl mb-10 text-accent max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    Track assignments, sections, and weighted grades across all your classes — in one place.
                </motion.p>

                <motion.div
                    className="flex space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                >
                    <Link
                        to="/signup"
                        className="px-6 py-3 bg-secondary text-primary font-semibold rounded hover:bg-gray-200 transition-colors"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-accent text-secondary font-semibold rounded hover:bg-gray-600 transition-colors"
                    >
                        Log In
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
