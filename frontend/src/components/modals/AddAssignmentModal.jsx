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

        if (!assignmentName.trim()) { setError('Assignment name is required'); return; }
        if (isNaN(received) || isNaN(possible)) { setError('Points must be valid numbers'); return; }
        if (possible <= 0) { setError('Points possible must be greater than 0'); return; }
        if (received < 0) { setError('Points received cannot be negative'); return; }

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

    const inputClass = "w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm";

    const preview = pointsReceived && pointsPossible && parseFloat(pointsPossible) > 0
        ? ((parseFloat(pointsReceived) / parseFloat(pointsPossible)) * 100).toFixed(1)
        : null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 px-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-1">Add Assignment</h2>
                <p className="text-slate-400 text-sm mb-5">Enter the assignment name and your score.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Assignment Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Homework 3, Quiz 1"
                            value={assignmentName}
                            onChange={(e) => setAssignmentName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Points Received</label>
                            <input
                                type="number"
                                placeholder="85"
                                value={pointsReceived}
                                onChange={(e) => setPointsReceived(e.target.value)}
                                className={inputClass}
                                min="0"
                                step="0.5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Points Possible</label>
                            <input
                                type="number"
                                placeholder="100"
                                value={pointsPossible}
                                onChange={(e) => setPointsPossible(e.target.value)}
                                className={inputClass}
                                min="0.1"
                                step="0.5"
                                required
                            />
                        </div>
                    </div>

                    {preview !== null && (
                        <div className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-center">
                            <span className="text-slate-400 text-sm">Score preview: </span>
                            <span className={`font-bold text-sm ${
                                parseFloat(preview) >= 90 ? 'text-emerald-400'
                                : parseFloat(preview) >= 80 ? 'text-blue-400'
                                : parseFloat(preview) >= 70 ? 'text-yellow-400'
                                : parseFloat(preview) >= 60 ? 'text-orange-400'
                                : 'text-red-400'
                            }`}>
                                {preview}%
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-800 text-slate-200 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            {saving ? 'Adding...' : 'Add Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssignmentModal;
