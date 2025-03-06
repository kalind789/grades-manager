import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar'; // Your existing Navbar component

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-primary text-secondary">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <motion.div
                className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <motion.h1
                    className="text-6xl font-bold mb-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    Welcome to Grade Manager
                </motion.h1>
                <motion.p
                    className="text-xl mb-8 text-accent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    Manage your grades effortlessly and efficiently.
                </motion.p>
            </motion.div>
        </div>
    );
};

export default LandingPage;