import { useCallback, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AddSectionModal from './modals/AddSectionModal';
import AddAssignmentModal from './modals/AddAssignmentModal';

const ManageClass = () => {
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState({});
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(null);

    // Fetch class and sections data
    const fetchClassData = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/manage_classes/manage_class/${classId}`);
            setClassInfo(res.data.class);
            setSections(res.data.sections);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching class data:', error);
        }
    }, [classId]);

    useEffect(() => {
        fetchClassData();
    }, [fetchClassData]);

    // Update section name or weight
    const handleSectionEdit = async (sectionId, updatedData) => {
        try {
            await axiosInstance.put(`/section/${sectionId}/edit`, updatedData);
            fetchClassData();
        } catch (error) {
            console.error('Error updating section:', error);
        }
    };

    // Delete section
    const handleSectionDelete = async (sectionId) => {
        if (!window.confirm("Are you sure you want to delete this section?")) return;
        try {
            await axiosInstance.delete(`/section/${sectionId}/delete`);
            fetchClassData();
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    };

    if (loading) return <div className="min-h-screen bg-primary text-secondary flex justify-center items-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-primary text-secondary p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">{classInfo.class_name}</h1>
                <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                >
                    Back to Dashboard
                </Link>
            </div>
            <h2 className="text-2xl mb-6">Total Grade: {classInfo.class_grade !== null ? `${classInfo.class_grade.toFixed(2)}%` : 'N/A'}</h2>

            <button
                className="mb-6 px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                onClick={() => setShowAddSectionModal(true)}
            >
                Add Section
            </button>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section) => (
                    <EditableSection
                        key={section.id}
                        section={section}
                        onEdit={handleSectionEdit}
                        onDelete={handleSectionDelete}
                        onAddAssignment={() => setShowAddAssignmentModal(section.id)}
                    />
                ))}
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
        </div>
    );
};

const EditableSection = ({ section, onEdit, onDelete, onAddAssignment }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(section.section_name);
    const [weight, setWeight] = useState(section.section_weight);

    const startEditing = () => setIsEditing(true);

    const cancelEditing = () => {
        setIsEditing(false);
        setName(section.section_name);
        setWeight(section.section_weight);
    };

    const saveChanges = () => {
        if (name.trim() !== "" && !isNaN(weight) && weight > 0) {
            onEdit(section.id, { section_name: name, section_weight: weight });
        }
        setIsEditing(false);
    };

    return (
        <div className="p-4 bg-secondary text-primary rounded shadow w-full">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold">{isEditing ? (
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent border-b border-accent focus:outline-none"
                    />
                ) : name}</h2>

                <button
                    onClick={() => onDelete(section.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                >
                    ❌
                </button>
            </div>

            <div className="mb-2">
                <p>
                    Weight: {isEditing ? (
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="bg-transparent border-b border-accent focus:outline-none w-16"
                        />
                    ) : `${weight}%`}
                </p>
            </div>

            <p>Grade: {section.section_grade !== null ? `${section.section_grade.toFixed(2)}%` : 'N/A'}</p>

            {isEditing ? (
                <div className="flex space-x-2 mt-4">
                    <button
                        onClick={saveChanges}
                        className="px-3 py-1 bg-green-600 text-secondary rounded hover:bg-green-700"
                    >
                        Save
                    </button>
                    <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-600 text-secondary rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={startEditing}
                    className="mt-4 px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                >
                    Edit Section
                </button>
            )}

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Assignments</h3>
                {section.assignments && section.assignments.length > 0 ? (
                    section.assignments.map((assignment) => (
                        <div key={assignment.id} className="p-2 border-b">
                            <p><strong>{assignment.assignment_name}</strong></p>
                            <p>{assignment.points_received} / {assignment.points_possible} points</p>
                        </div>
                    ))
                ) : (
                    <p className="text-accent">No assignments yet.</p>
                )}

                <button
                    className="mt-4 px-4 py-2 bg-accent text-secondary rounded hover:bg-gray-700"
                    onClick={onAddAssignment}
                >
                    Add Assignment
                </button>
            </div>
        </div>
    );
};

export default ManageClass;