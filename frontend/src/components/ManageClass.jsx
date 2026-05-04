import { useCallback, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';
import AddSectionModal from './modals/AddSectionModal';
import AddAssignmentModal from './modals/AddAssignmentModal';

const gradeStyle = (grade) => {
    if (grade == null) return { text: 'text-slate-500', badge: 'text-slate-400 bg-slate-700/50 border-slate-600' };
    if (grade >= 90) return { text: 'text-emerald-400', badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    if (grade >= 80) return { text: 'text-blue-400', badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
    if (grade >= 70) return { text: 'text-yellow-400', badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    if (grade >= 60) return { text: 'text-orange-400', badge: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
    return { text: 'text-red-400', badge: 'text-red-400 bg-red-400/10 border-red-400/20' };
};

const GradeBadge = ({ grade, large = false }) => {
    const style = gradeStyle(grade);
    return (
        <span className={`font-bold rounded-xl border ${style.badge} ${large ? 'text-2xl px-4 py-1.5' : 'text-sm px-2.5 py-1'}`}>
            {grade != null ? `${grade.toFixed(1)}%` : 'N/A'}
        </span>
    );
};

const ManageClass = () => {
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState({});
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(null);

    const fetchClassData = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/manage_classes/manage_class/${classId}`);
            setClassInfo(res.data.class);
            setSections(res.data.sections);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load class data');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchClassData();
    }, [fetchClassData]);

    const handleSectionEdit = async (sectionId, data) => {
        try {
            await axiosInstance.put(`/section/${sectionId}/edit`, data);
            fetchClassData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update section');
        }
    };

    const handleSectionDelete = async (sectionId) => {
        if (!window.confirm('Delete this section and all its assignments?')) return;
        try {
            await axiosInstance.delete(`/section/${sectionId}/delete`);
            fetchClassData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete section');
        }
    };

    const handleAssignmentEdit = async (assignmentId, data) => {
        try {
            await axiosInstance.put(`/assignment/${assignmentId}/edit`, data);
            fetchClassData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update assignment');
        }
    };

    const handleAssignmentDelete = async (assignmentId) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await axiosInstance.delete(`/assignment/${assignmentId}/delete`);
            fetchClassData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete assignment');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm">Loading...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* Class header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-3"
                        >
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white">{classInfo.class_name}</h1>
                        {classInfo.class_code && (
                            <p className="text-slate-500 text-sm font-medium tracking-wide uppercase mt-1">
                                {classInfo.class_code}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Overall Grade</span>
                        <GradeBadge grade={classInfo.class_grade} large />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ml-4 text-red-300 hover:text-white">✕</button>
                    </div>
                )}

                {/* Section controls */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">
                        Sections
                        <span className="ml-2 text-sm font-normal text-slate-500">
                            ({sections.length})
                        </span>
                    </h2>
                    <button
                        onClick={() => setShowAddSectionModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-colors text-sm"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add Section
                    </button>
                </div>

                {sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                            📋
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No sections yet</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs">
                            Add sections like "Homework" (30%) or "Midterm" (20%) to set up weighted grading.
                        </p>
                        <button
                            onClick={() => setShowAddSectionModal(true)}
                            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-colors text-sm"
                        >
                            Add First Section
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sections.map((section) => (
                            <SectionCard
                                key={section.id}
                                section={section}
                                onEdit={handleSectionEdit}
                                onDelete={handleSectionDelete}
                                onAddAssignment={() => setShowAddAssignmentModal(section.id)}
                                onEditAssignment={handleAssignmentEdit}
                                onDeleteAssignment={handleAssignmentDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showAddSectionModal && (
                <AddSectionModal
                    classId={classId}
                    onClose={() => setShowAddSectionModal(false)}
                    onSectionAdded={fetchClassData}
                />
            )}
            {showAddAssignmentModal && (
                <AddAssignmentModal
                    sectionId={showAddAssignmentModal}
                    onClose={() => setShowAddAssignmentModal(null)}
                    onAssignmentAdded={fetchClassData}
                />
            )}
        </>
    );
};


const SectionCard = ({ section, onEdit, onDelete, onAddAssignment, onEditAssignment, onDeleteAssignment }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(section.section_name);
    const [weight, setWeight] = useState(section.section_weight);
    const style = gradeStyle(section.section_grade);

    const cancelEditing = () => {
        setIsEditing(false);
        setName(section.section_name);
        setWeight(section.section_weight);
    };

    const saveChanges = () => {
        const w = parseFloat(weight);
        if (name.trim() && !isNaN(w) && w > 0) {
            onEdit(section.id, { section_name: name.trim(), section_weight: w });
        }
        setIsEditing(false);
    };

    const inputClass = "bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 px-2 py-1 text-sm";

    return (
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 flex flex-col hover:border-slate-600 transition-colors">
            {/* Card header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-2">
                    {isEditing ? (
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`${inputClass} w-full text-base font-bold`}
                        />
                    ) : (
                        <h3 className="text-base font-bold text-white truncate">{name}</h3>
                    )}

                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-slate-500">Weight:</span>
                        {isEditing ? (
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className={`${inputClass} w-16`}
                                min="0.1"
                                max="100"
                                step="0.1"
                            />
                        ) : (
                            <span className="text-xs font-semibold text-slate-300">{weight}%</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${style.badge}`}>
                        {section.section_grade != null ? `${section.section_grade.toFixed(1)}%` : 'N/A'}
                    </span>
                    <button
                        onClick={() => onDelete(section.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
                        title="Delete section"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Edit actions */}
            {isEditing ? (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={saveChanges}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-xs font-medium"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEditing}
                        className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-xs font-medium"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mb-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors self-start"
                >
                    Edit section
                </button>
            )}

            {/* Divider */}
            <div className="border-t border-slate-800 mb-4" />

            {/* Assignments */}
            <div className="flex-1 flex flex-col">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
                    Assignments ({section.assignments?.length || 0})
                </p>

                {section.assignments && section.assignments.length > 0 ? (
                    <ul className="space-y-1 flex-1">
                        {section.assignments.map((a) => (
                            <AssignmentRow
                                key={a.id}
                                assignment={a}
                                onEdit={onEditAssignment}
                                onDelete={onDeleteAssignment}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-600 flex-1 mb-2">No assignments yet.</p>
                )}

                <button
                    onClick={onAddAssignment}
                    className="mt-4 w-full py-2 text-sm text-indigo-400 border border-dashed border-indigo-400/30 rounded-xl hover:bg-indigo-400/5 hover:border-indigo-400/50 transition-colors font-medium"
                >
                    + Add Assignment
                </button>
            </div>
        </div>
    );
};


const AssignmentRow = ({ assignment, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(assignment.assignment_name);
    const [received, setReceived] = useState(assignment.points_received);
    const [possible, setPossible] = useState(assignment.points_possible);

    const cancelEditing = () => {
        setIsEditing(false);
        setName(assignment.assignment_name);
        setReceived(assignment.points_received);
        setPossible(assignment.points_possible);
    };

    const saveChanges = () => {
        const r = parseFloat(received);
        const p = parseFloat(possible);
        if (name.trim() && !isNaN(r) && !isNaN(p) && p > 0 && r >= 0) {
            onEdit(assignment.id, {
                assignment_name: name.trim(),
                points_received: r,
                points_possible: p,
            });
        }
        setIsEditing(false);
    };

    const inputClass = "bg-slate-950 border border-slate-700 rounded text-white text-xs focus:outline-none focus:border-indigo-500 px-2 py-1";
    const pct = ((assignment.points_received / assignment.points_possible) * 100).toFixed(0);

    if (isEditing) {
        return (
            <li className="p-3 bg-slate-800 rounded-xl space-y-2 border border-slate-700">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} w-full`}
                    placeholder="Assignment name"
                />
                <div className="flex items-center gap-1.5">
                    <input
                        type="number"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                        className={`${inputClass} w-16 text-center`}
                        min="0"
                        step="0.5"
                    />
                    <span className="text-slate-600 text-xs">/</span>
                    <input
                        type="number"
                        value={possible}
                        onChange={(e) => setPossible(e.target.value)}
                        className={`${inputClass} w-16 text-center`}
                        min="0.1"
                        step="0.5"
                    />
                    <span className="text-slate-500 text-xs">pts</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={saveChanges}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-500 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-slate-700 text-slate-200 rounded-lg text-xs hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </li>
        );
    }

    return (
        <li className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{assignment.assignment_name}</p>
                <p className="text-xs text-slate-500">
                    {assignment.points_received}/{assignment.points_possible} pts
                    <span className="ml-1 text-slate-600">({pct}%)</span>
                </p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(assignment.id)}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                    Del
                </button>
            </div>
        </li>
    );
};

export default ManageClass;
