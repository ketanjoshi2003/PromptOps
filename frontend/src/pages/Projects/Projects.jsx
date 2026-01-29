import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Projects.module.css';
import { FiSearch, FiTrash2, FiX, FiCheckSquare, FiSquare, FiList, FiEdit2, FiCopy, FiCheck } from 'react-icons/fi';
import { authService } from '../../services/authService';

const Projects = ({ isVisible }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Selection State
    const [selectedProject, setSelectedProject] = useState(null); // For modal
    const [isEditing, setIsEditing] = useState(false); // Edit mode inside modal
    const [editForm, setEditForm] = useState({ title: '', content: '' });

    const [copiedId, setCopiedId] = useState(null); // For copy feedback
    const [searchQuery, setSearchQuery] = useState('');

    // Bulk Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const fetchProjects = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`);

            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchProjects();
        }
    }, [isVisible]);

    // Project Actions
    const handleProjectClick = (project) => {
        if (isSelectionMode) {
            toggleProjectSelection(null, project.id);
        } else {
            // Open Modal
            setSelectedProject(project);
            setIsEditing(false);
            setEditForm({ title: project.title, content: project.content });
        }
    };

    const deleteProject = async (e, id) => {
        if (e) e.stopPropagation();


        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setProjects(prev => prev.filter(p => p.id !== id));
                // If deleted from modal
                if (selectedProject?.id === id) {
                    closeModal();
                }
            }
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    const handleCopy = (e, content, id) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Edit Logic (Inside Modal)
    const startEdit = () => {
        setEditForm({ title: selectedProject.title, content: selectedProject.content });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditForm({ title: selectedProject.title, content: selectedProject.content });
    };

    const saveEdit = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects/${selectedProject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                // Update local state
                const updatedProject = { ...selectedProject, ...editForm };
                setProjects(prev => prev.map(p =>
                    p.id === selectedProject.id ? updatedProject : p
                ));
                setSelectedProject(updatedProject);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Failed to update project:", error);
        }
    };

    // Modal
    const closeModal = () => {
        setSelectedProject(null);
        setIsEditing(false);
    };

    // Bulk Actions
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds(new Set());
    };

    const toggleProjectSelection = (e, id) => {
        if (e) e.stopPropagation();
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProjects.length && filteredProjects.length > 0) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(filteredProjects.map(p => p.id));
            setSelectedIds(allIds);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} projects?`)) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/projects`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Array.from(selectedIds))
            });

            if (response.ok) {
                setProjects(prev => prev.filter(p => !selectedIds.has(p.id)));
                setSelectedIds(new Set());
                setIsSelectionMode(false);
            }
        } catch (error) {
            console.error("Failed to bulk delete:", error);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && projects.length === 0) {
        return <div className={styles.container}>Loading projects...</div>;
    }

    return (
        <div className={styles.container}>
            {/* Portal Actions to Header */}
            {document.getElementById('header-actions-root') && createPortal(
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left Side: Title or Selection Status + Search */}
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        {isSelectionMode && (
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap', marginRight: '16px' }}>
                                Selected ({selectedIds.size})
                            </div>
                        )}

                        {!isSelectionMode && projects.length > 0 && (
                            <div className={styles.headerSearchContainer}>
                                <div className={styles.searchIcon} style={{ left: '10px' }}>
                                    <FiSearch size={16} />
                                </div>
                                <input
                                    type="text"
                                    className={styles.headerSearchInput}
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Side: Actions */}
                    <div className={styles.actions} style={{ display: 'flex', gap: '8px' }}>
                        {isSelectionMode ? (
                            <>
                                <button
                                    className={`${styles.actionBtn} ${styles.deleteBtn} ${selectedIds.size === 0 ? styles.disabled : ''}`}
                                    onClick={handleBulkDelete}
                                    disabled={selectedIds.size === 0}
                                >
                                    <FiTrash2 /> Delete
                                </button>
                                <button className={styles.actionBtn} onClick={toggleSelectAll}>
                                    {selectedIds.size === filteredProjects.length && filteredProjects.length > 0 ? <FiCheckSquare /> : <FiSquare />} All
                                </button>
                                <button className={styles.actionBtn} onClick={toggleSelectionMode}>
                                    <FiX /> Cancel
                                </button>
                            </>
                        ) : (
                            projects.length > 0 && (
                                <button className={styles.actionBtn} onClick={toggleSelectionMode}>
                                    <FiList /> Select
                                </button>
                            )
                        )}
                    </div>
                </div>,
                document.getElementById('header-actions-root')
            )}

            <div className={styles.projectList}>
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className={`${styles.projectItem} ${selectedIds.has(project.id) ? styles.selected : ''}`}
                        onClick={() => handleProjectClick(project)}
                    >
                        {isSelectionMode && (
                            <div className={styles.checkbox}>
                                {selectedIds.has(project.id) ? <FiCheckSquare /> : <FiSquare />}
                            </div>
                        )}

                        <div className={styles.projectHeader}>
                            <div className={styles.titleWrapper}>
                                <span className={styles.projectTitle}>{project.title}</span>
                            </div>
                            <div className={styles.metaInfo}>
                                <span className={styles.projectDate}>
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                                {/* Small Quick Actions on Card */}
                                <div style={{ display: 'flex', gap: '4px', zIndex: 5 }} onClick={e => e.stopPropagation()}>
                                    <button
                                        className={styles.iconButton}
                                        onClick={(e) => handleCopy(e, project.content, project.id)}
                                        title="Copy"
                                    >
                                        {copiedId === project.id ? <FiCheck color="#4ade80" /> : <FiCopy />}
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        onClick={(e) => deleteProject(e, project.id)}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && !loading && (
                    <div style={{ color: 'var(--color-text-muted)' }}>
                        No projects found. Generate a prompt to get started!
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedProject && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleWrapper}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className={styles.editTitleInput}
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Project Title"
                                    />
                                ) : (
                                    <>
                                        <h2 className={styles.modalTitle}>{selectedProject.title}</h2>
                                        <span className={styles.modalDate}>Created on {new Date(selectedProject.created_at).toLocaleDateString()}</span>
                                    </>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                {isEditing ? (
                                    <>
                                        <button className={styles.actionBtn} onClick={saveEdit} style={{ color: '#4ade80', borderColor: '#4ade80' }}>
                                            <FiCheck /> Save
                                        </button>
                                        <button className={styles.actionBtn} onClick={cancelEdit} style={{ color: '#f87171', borderColor: '#f87171' }}>
                                            <FiX /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className={styles.iconButton} onClick={startEdit} title="Edit">
                                            <FiEdit2 size={20} />
                                        </button>
                                        <button
                                            className={styles.iconButton}
                                            onClick={(e) => handleCopy(e, selectedProject.content, 'modal')}
                                            title="Copy Content"
                                        >
                                            {copiedId === 'modal' ? <FiCheck size={20} color="#4ade80" /> : <FiCopy size={20} />}
                                        </button>
                                        <button className={styles.iconButton} onClick={(e) => deleteProject(e, selectedProject.id)} title="Delete">
                                            <FiTrash2 size={20} />
                                        </button>
                                        <button className={styles.closeButton} onClick={closeModal} title="Close">
                                            <FiX size={24} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalBody}>
                            {isEditing ? (
                                <textarea
                                    className={styles.modalEditInput}
                                    value={editForm.content}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                    spellCheck={false}
                                />
                            ) : (
                                <pre className={styles.modalCodeBlock}>
                                    {selectedProject.content}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
