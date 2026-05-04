import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const EditClassModal = ({ classData, onClose, onUpdated }) => {
    const [className, setClassName] = useState(classData.class_name);
    const [classCode, setClassCode] = useState(classData.class_code || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!className.trim()) {
            setError('Class name is required');
            return;
        }
        setSaving(true);
        try {
            await axiosInstance.put(`/dashboard/${classData.id}/edit_class`, {
                class_name: className.trim(),
                class_code: classCode.trim(),
            });
            onUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update class');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-secondary text-primary p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit Class</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Class Name"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Class Code (optional)"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
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
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClassModal;
