import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AddClassModal = ({ onClose, onClassAdded }) => {
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/dashboard/create_class', {
                class_name: className,
                class_code: classCode,
            });
            onClassAdded(); // Refresh the class list in Dashboard
            onClose();      // Close the modal
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create class');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-secondary text-primary p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Class</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Class Name"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full p-2 border rounded text-primary"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Class Code"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        className="w-full p-2 border rounded text-primary"
                    />
                    {error && <div className="text-red-500">{error}</div>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClassModal;