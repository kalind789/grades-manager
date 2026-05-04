import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AddAssignmentModal = ({ sectionId, onClose, onAssignmentAdded }) => {
    const [assignmentName, setAssignmentName] = useState('');
    const [pointsReceived, setPointsReceived] = useState('');
    const [pointsPossible, setPointsPossible] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const received = parseFloat(pointsReceived);
        const possible = parseFloat(pointsPossible);

        if (!assignmentName.trim()) {
            setError('Assignment name is required');
            return;
        }
        if (isNaN(received) || isNaN(possible)) {
            setError('Points must be valid numbers');
            return;
        }
        if (possible <= 0) {
            setError('Points possible must be greater than 0');
            return;
        }
        if (received < 0) {
            setError('Points received cannot be negative');
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.post(`/assignment/create/${sectionId}`, {
                assignment_name: assignmentName.trim(),
                points_received: received,
                points_possible: possible,
            });
            onAssignmentAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create assignment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-secondary text-primary p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Assignment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Assignment Name"
                        value={assignmentName}
                        onChange={(e) => setAssignmentName(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Points Received</label>
                            <input
                                type="number"
                                placeholder="e.g. 85"
                                value={pointsReceived}
                                onChange={(e) => setPointsReceived(e.target.value)}
                                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                                min="0"
                                step="0.5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Points Possible</label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                value={pointsPossible}
                                onChange={(e) => setPointsPossible(e.target.value)}
                                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                                min="0.1"
                                step="0.5"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-primary text-secondary rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssignmentModal;
