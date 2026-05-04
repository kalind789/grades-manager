import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            {/* Background glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="flex flex-col items-center"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="inline-block mb-6 text-sm font-medium text-indigo-400 bg-indigo-400/10 px-4 py-1.5 rounded-full border border-indigo-400/20"
                    >
                        Student Grade Tracker
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4"
                    >
                        Manage your grades
                        <br />
                        <span className="text-indigo-400">effortlessly.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="text-lg text-slate-400 mb-10 max-w-md"
                    >
                        Track assignments, sections, and weighted grades across
                        all your classes — in one place.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="flex gap-4"
                    >
                        <Link
                            to="/signup"
                            className="px-7 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="px-7 py-3 bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
                        >
                            Log In
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Bottom stats / features */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-12 flex gap-10 text-slate-500 text-sm"
                >
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-semibold text-base">Weighted</span>
                        <span>Grade Calculation</span>
                    </div>
                    <div className="w-px bg-slate-800" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-semibold text-base">Real-time</span>
                        <span>Score Updates</span>
                    </div>
                    <div className="w-px bg-slate-800" />
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white font-semibold text-base">Multi-class</span>
                        <span>Management</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
