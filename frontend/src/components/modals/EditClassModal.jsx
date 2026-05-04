import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const EditClassModal = ({ classData, onClose, onUpdated }) => {
    const [className, setClassName] = useState(classData.class_name);
    const [classCode, setClassCode] = useState(classData.class_code || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!className.trim()) { setError('Class name is required'); return; }
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

    const inputClass = "w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm";

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 px-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-1">Edit Class</h2>
                <p className="text-slate-400 text-sm mb-5">Update the name or code for this class.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Class Name</label>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Class Code <span className="text-slate-500 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value)}
                            className={inputClass}
                        />
                    </div>

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
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClassModal;
