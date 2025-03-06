import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AddAssignmentModal = ({ sectionId, onClose, onAssignmentAdded }) => {
    const [assignmentName, setAssignmentName] = useState('');
    const [pointsReceived, setPointsReceived] = useState('');
    const [pointsPossible, setPointsPossible] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/assignment/create/${sectionId}`, {
                assignment_name: assignmentName,
                points_received: pointsReceived,
                points_possible: pointsPossible,
            });
            onAssignmentAdded(); // Refresh class data
            onClose(); // Close the modal
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create assignment');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-secondary text-primary p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Assignment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Assignment Name"
                        value={assignmentName}
                        onChange={(e) => setAssignmentName(e.target.value)}
                        className="w-full p-2 border rounded text-primary"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Points Received"
                        value={pointsReceived}
                        onChange={(e) => setPointsReceived(e.target.value)}
                        className="w-full p-2 border rounded text-primary"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Points Possible"
                        value={pointsPossible}
                        onChange={(e) => setPointsPossible(e.target.value)}
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

export default AddAssignmentModal;