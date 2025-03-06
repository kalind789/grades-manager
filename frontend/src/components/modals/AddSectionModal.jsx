import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AddSectionModal = ({ classId, onClose, onSectionAdded }) => {
    const [sectionName, setSectionName] = useState('');
    const [sectionWeight, setSectionWeight] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/section/create_section/${classId}`, {
                section_name: sectionName,
                section_weight: sectionWeight,
            });
            onSectionAdded(); // Refresh section list
            onClose(); // Close modal
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create section');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-secondary text-primary p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Section</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Section Name"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        className="w-full p-2 border rounded text-primary"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Section Weight (%)"
                        value={sectionWeight}
                        onChange={(e) => setSectionWeight(e.target.value)}
                        className="w-full p-2 border rounded text-primary"
                        required
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

export default AddSectionModal;