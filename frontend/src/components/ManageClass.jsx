import { useCallback, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';
import AddSectionModal from './modals/AddSectionModal';
import AddAssignmentModal from './modals/AddAssignmentModal';

const gradeColor = (grade) => {
    if (grade == null) return 'text-gray-400';
    if (grade >= 90) return 'text-green-500';
    if (grade >= 80) return 'text-blue-400';
    if (grade >= 70) return 'text-yellow-400';
    if (grade >= 60) return 'text-orange-400';
    return 'text-red-500';
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

    const handleSectionEdit = async (sectionId, updatedData) => {
        try {
            await axiosInstance.put(`/section/${sectionId}/edit`, updatedData);
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

    const handleAssignmentEdit = async (assignmentId, updatedData) => {
        try {
            await axiosInstance.put(`/assignment/${assignmentId}/edit`, updatedData);
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
                <div className="min-h-screen bg-primary text-secondary flex items-center justify-center">
                    <p className="text-accent text-lg">Loading...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-primary text-secondary px-4 py-10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                        <div>
                            <h1 className="text-3xl font-bold">{classInfo.class_name}</h1>
                            {classInfo.class_code && (
                                <p className="text-accent text-sm mt-1">{classInfo.class_code}</p>
                            )}
                        </div>
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 text-sm bg-accent text-secondary rounded hover:bg-gray-600 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>

                    <p className={`text-2xl font-bold mb-8 ${gradeColor(classInfo.class_grade)}`}>
                        Overall: {classInfo.class_grade != null ? `${classInfo.class_grade.toFixed(1)}%` : 'N/A'}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded text-sm">
                            {error}
                            <button
                                className="ml-4 underline"
                                onClick={() => setError('')}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <button
                        className="mb-6 px-4 py-2 bg-secondary text-primary font-semibold rounded hover:bg-gray-200 transition-colors"
                        onClick={() => setShowAddSectionModal(true)}
                    >
                        + Add Section
                    </button>

                    {sections.length === 0 ? (
                        <div className="text-center py-20 text-accent">
                            <p className="text-xl mb-2">No sections yet.</p>
                            <p className="text-sm">Add a section (e.g. "Homework", "Midterm") to start tracking grades.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {sections.map((section) => (
                                <EditableSection
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


const EditableSection = ({ section, onEdit, onDelete, onAddAssignment, onEditAssignment, onDeleteAssignment }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(section.section_name);
    const [weight, setWeight] = useState(section.section_weight);

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

    return (
        <div className="p-5 bg-secondary text-primary rounded-lg shadow flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-2">
                    {isEditing ? (
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-xl font-bold bg-transparent border-b-2 border-gray-400 focus:outline-none focus:border-gray-700"
                        />
                    ) : (
                        <h2 className="text-xl font-bold truncate">{name}</h2>
                    )}
                </div>
                <button
                    onClick={() => onDelete(section.id)}
                    className="text-red-400 hover:text-red-600 transition-colors text-sm flex-shrink-0"
                    title="Delete section"
                >
                    Remove
                </button>
            </div>

            <div className="text-sm mb-1">
                <span className="text-gray-500">Weight: </span>
                {isEditing ? (
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-transparent border-b border-gray-400 focus:outline-none w-16 text-sm"
                        min="0"
                        max="100"
                        step="0.1"
                    />
                ) : (
                    <span className="font-medium">{weight}%</span>
                )}
            </div>

            <p className={`text-sm mb-3 font-semibold ${section.section_grade != null
                ? (section.section_grade >= 90 ? 'text-green-600'
                    : section.section_grade >= 80 ? 'text-blue-600'
                    : section.section_grade >= 70 ? 'text-yellow-600'
                    : section.section_grade >= 60 ? 'text-orange-600'
                    : 'text-red-600')
                : 'text-gray-400'}`}>
                Grade: {section.section_grade != null ? `${section.section_grade.toFixed(1)}%` : 'N/A'}
            </p>

            {isEditing ? (
                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={saveChanges}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mb-4 px-3 py-1 bg-accent text-secondary rounded hover:bg-gray-600 transition-colors text-sm self-start"
                >
                    Edit Section
                </button>
            )}

            <div className="flex-1">
                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">Assignments</h3>
                {section.assignments && section.assignments.length > 0 ? (
                    <ul className="space-y-2">
                        {section.assignments.map((assignment) => (
                            <EditableAssignment
                                key={assignment.id}
                                assignment={assignment}
                                onEdit={onEditAssignment}
                                onDelete={onDeleteAssignment}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400 mb-2">No assignments yet.</p>
                )}

                <button
                    className="mt-3 px-3 py-1.5 bg-primary text-secondary rounded hover:bg-gray-800 transition-colors text-sm w-full"
                    onClick={onAddAssignment}
                >
                    + Add Assignment
                </button>
            </div>
        </div>
    );
};


const EditableAssignment = ({ assignment, onEdit, onDelete }) => {
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

    if (isEditing) {
        return (
            <li className="p-2 border border-gray-300 rounded text-sm space-y-1">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-gray-300 focus:outline-none bg-transparent font-medium"
                    placeholder="Assignment name"
                />
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        value={received}
                        onChange={(e) => setReceived(e.target.value)}
                        className="w-16 border-b border-gray-300 focus:outline-none bg-transparent text-center"
                        min="0"
                        step="0.5"
                    />
                    <span className="text-gray-400">/</span>
                    <input
                        type="number"
                        value={possible}
                        onChange={(e) => setPossible(e.target.value)}
                        className="w-16 border-b border-gray-300 focus:outline-none bg-transparent text-center"
                        min="0.1"
                        step="0.5"
                    />
                    <span className="text-gray-400 ml-1">pts</span>
                </div>
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={saveChanges}
                        className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEditing}
                        className="px-2 py-0.5 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
                    >
                        Cancel
                    </button>
                </div>
            </li>
        );
    }

    const pct = ((assignment.points_received / assignment.points_possible) * 100).toFixed(1);

    return (
        <li className="p-2 border border-gray-200 rounded text-sm flex justify-between items-start gap-2">
            <div className="min-w-0">
                <p className="font-medium truncate">{assignment.assignment_name}</p>
                <p className="text-gray-500">
                    {assignment.points_received} / {assignment.points_possible} pts
                    <span className="ml-1 text-gray-400">({pct}%)</span>
                </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit"
                >
                    Edit
                </button>
                <span className="text-gray-300">|</span>
                <button
                    onClick={() => onDelete(assignment.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    title="Delete"
                >
                    Del
                </button>
            </div>
        </li>
    );
};

export default ManageClass;
