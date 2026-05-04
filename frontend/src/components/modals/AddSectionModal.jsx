import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AddSectionModal = ({ classId, onClose, onSectionAdded }) => {
    const [sectionName, setSectionName] = useState('');
    const [sectionWeight, setSectionWeight] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const weight = parseFloat(sectionWeight);

        if (!sectionName.trim()) {
            setError('Section name is required');
            return;
        }
        if (isNaN(weight) || weight <= 0 || weight > 100) {
            setError('Weight must be a number between 0 and 100');
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.post(`/section/create_section/${classId}`, {
                section_name: sectionName.trim(),
                section_weight: weight,
            });
            onSectionAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create section');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-secondary text-primary p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add Section</h2>
                <p className="text-sm text-gray-500 mb-4">
                    A section represents a grading category (e.g. "Homework" with 30% weight).
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Section Name (e.g. Homework, Midterm)"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        required
                    />
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Weight (%)</label>
                        <input
                            type="number"
                            placeholder="e.g. 30"
                            value={sectionWeight}
                            onChange={(e) => setSectionWeight(e.target.value)}
                            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                            min="0.1"
                            max="100"
                            step="0.1"
                            required
                        />
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

export default AddSectionModal;
