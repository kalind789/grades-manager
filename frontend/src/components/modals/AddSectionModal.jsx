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
        if (!sectionName.trim()) { setError('Section name is required'); return; }
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

    const inputClass = "w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm";

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 px-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-1">Add Section</h2>
                <p className="text-slate-400 text-sm mb-5">
                    Sections are grading categories like "Homework" (30%) or "Final Exam" (40%).
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Section Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Homework, Midterm, Final"
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Weight (%)</label>
                        <input
                            type="number"
                            placeholder="e.g. 30"
                            value={sectionWeight}
                            onChange={(e) => setSectionWeight(e.target.value)}
                            className={inputClass}
                            min="0.1"
                            max="100"
                            step="0.1"
                            required
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
                            {saving ? 'Adding...' : 'Add Section'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSectionModal;
