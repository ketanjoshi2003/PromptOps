import React, { useState } from 'react';
import { FiZap, FiChevronDown, FiPlus, FiX } from 'react-icons/fi';
import styles from './ProjectForm.module.css';
import CustomSelect from '../CustomSelect/CustomSelect';

const InlineAddPopup = ({ category, isOpen, activeCategory, customValue, setCustomValue, onAdd, onClose }) => {
    if (!isOpen || activeCategory !== category) return null;

    return (
        <>
            {/* Invisible fixed overlay to catch clicks outside */}
            <div className={styles.modalOverlay} onClick={onClose} />

            {/* The actual popup box relative to the header */}
            <div
                className={styles.minimalModalContent}
                onClick={e => e.stopPropagation()}
            >
                <input
                    type="text"
                    className={styles.minimalModalTextarea}
                    value={customValue}
                    onChange={e => setCustomValue(e.target.value)}
                    placeholder="Add custom..."
                    autoFocus
                />
                <button className={styles.minimalAddBtn} onClick={onAdd}>SAVE</button>
            </div>
        </>
    );
};

const ProjectForm = ({ onSubmit, isSubmitting, selectedModel, onModelChange }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Web App',
        frontendStack: [],
        frontendStyling: [],
        mobileStack: [],
        backendStack: [],
        database: 'None',
        auth: [],
        api: [],
        devOps: [],

        aiControl: 'Controlled',
        additionalInstructions: ''
    });

    // Custom Options State
    const [customOptions, setCustomOptions] = useState({
        frontendStack: [],
        frontendStyling: [],
        mobileStack: [],
        backendStack: [],
        database: [],
        auth: [],
        api: [],
        devOps: [],
        appType: []
    });

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [customValue, setCustomValue] = useState('');

    const [isDevOpsOpen, setIsDevOpsOpen] = useState(false);
    const [isDeveloperSettingsOpen, setIsDeveloperSettingsOpen] = useState(false);

    const [errors, setErrors] = useState({});

    // 1️⃣ Canonical Tech Stack Categories
    const APP_TYPES = [
        'Web App', 'Mobile App', 'Full-Stack App',
        'Backend API', 'SaaS Platform', 'Admin Dashboard',
        'Landing Page', 'CLI Tool', 'Microservice', 'AI-powered App',
        ...customOptions.appType
    ];

    const FRONTEND_FRAMEWORKS = [
        'React', 'Next.js', 'Vue', 'Nuxt',
        'Angular', 'Svelte / SvelteKit', 'Flutter (web/mobile)', 'None',
        ...customOptions.frontendStack
    ];
    const STYLING_OPTIONS = [
        'CSS', 'Tailwind CSS', 'Material UI',
        'Ant Design', 'Bootstrap', 'Chakra UI',
        ...customOptions.frontendStyling
    ];
    const MOBILE_STACK = [
        'React Native', 'Flutter', 'SwiftUI (iOS)',
        'Kotlin (Android)', 'Expo',
        ...customOptions.mobileStack
    ];
    const BACKEND_STACK = [
        'Node.js (Express)', 'Node.js (NestJS)', 'FastAPI',
        'Django', 'Django REST Framework', 'Spring Boot',
        '.NET Web API', 'Ruby on Rails', 'Go (Gin / Fiber)',
        'None (Frontend-only)',
        ...customOptions.backendStack
    ];
    const DATABASE_OPTIONS = [
        'PostgreSQL', 'MySQL', 'SQLite', 'SQL Server',
        'MongoDB', 'Redis', 'DynamoDB', 'Firestore',
        ...customOptions.database
    ];
    const AUTH_OPTIONS = [
        'Email + Password', 'JWT', 'OAuth (Google, GitHub)',
        'Session-based', 'None',
        ...customOptions.auth
    ];
    const API_OPTIONS = [
        'REST', 'GraphQL', 'WebSockets', 'gRPC',
        ...customOptions.api
    ];
    const DEVOPS_OPTIONS = [
        'Unit tests', 'Integration tests', 'TypeScript',
        'Linting', 'Docker', 'CI/CD',
        ...customOptions.devOps
    ];

    const openAddModal = (e, category) => {
        e.stopPropagation();
        setActiveCategory(category);
        setIsAddModalOpen(true);
        setCustomValue('');
    };

    const handleAddCustom = () => {
        if (!customValue.trim()) {
            setIsAddModalOpen(false);
            return;
        }

        const newValue = customValue.trim();

        setCustomOptions(prev => ({
            ...prev,
            [activeCategory]: [...prev[activeCategory], newValue]
        }));

        // Automatically select the newly added item
        if (activeCategory === 'database' || activeCategory === 'appType') {
            handleRadioChange(activeCategory === 'appType' ? 'type' : activeCategory, newValue);
        } else {
            handleCheckboxChange(activeCategory, newValue);
        }

        setIsAddModalOpen(false);
        setCustomValue('');
    };


    const handleDeleteCustom = (e, category, value) => {
        e.preventDefault();
        e.stopPropagation();

        setCustomOptions(prev => ({
            ...prev,
            [category]: prev[category].filter(opt => opt !== value)
        }));

        // Remove from formData if it was selected
        setFormData(prev => {
            if (category === 'database' || category === 'appType') {
                const fieldName = category === 'appType' ? 'type' : 'database';
                const defaultVal = category === 'appType' ? 'Web App' : 'None';
                return prev[fieldName] === value ? { ...prev, [fieldName]: defaultVal } : prev;
            } else {
                const currentList = prev[category] || [];
                return {
                    ...prev,
                    [category]: currentList.filter(item => item !== value)
                };
            }
        });
    };

    const aiControlOptions = ['Controlled', 'Balanced', 'Exploratory'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCustomSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCheckboxChange = (group, value) => {
        setFormData(prev => {
            const current = [...prev[group]];
            const index = current.indexOf(value);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(value);
            }
            return { ...prev, [group]: current };
        });
        if (errors[group]) setErrors(prev => ({ ...prev, [group]: '' }));
    };

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Helper to determine if UI stack should be shown
    const showFrontend = () => {
        const noUiTypes = ['Backend API', 'CLI Tool', 'Microservice'];
        return !noUiTypes.includes(formData.type);
    };

    // Helper to determine if Mobile stack should be shown
    const showMobile = () => {
        return ['Mobile App', 'Full-Stack App', 'AI-powered App'].includes(formData.type);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.additionalInstructions.trim()) newErrors.additionalInstructions = 'Objective description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.fieldSection}>
                <div className={styles.fieldLabel}>Project Title</div>
                <input
                    type="text"
                    name="title"
                    className={styles.input}
                    placeholder="e.g., My E-commerce Platform"
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.fieldSection}>
                <div className={styles.fieldTitle}>
                    Objective <span className={styles.requiredStar}>*</span>
                </div>
                <div className={styles.helperText}>
                    Natural-language description of what the project goal is.
                </div>
                <div className={styles.textareaWrapper}>
                    <textarea
                        name="additionalInstructions"
                        className={styles.textarea}
                        placeholder="e.g., E-commerce web application with product catalog, shopping cart, and payment integration..."
                        value={formData.additionalInstructions}
                        onChange={handleChange}
                    />
                </div>
                {errors.additionalInstructions && <span className={styles.errorText}>{errors.additionalInstructions}</span>}
            </div>

            <div className={styles.rowInputs}>
                <div className={styles.fieldSection}>
                    <div className={styles.fieldLabel}>Model Selection</div>
                    <CustomSelect
                        options={[
                            { label: 'Fast & Structured', value: 'meta-llama/llama-4-scout-17b-16e-instruct' },
                            { label: 'Expert Reasoner', value: 'llama-3.3-70b-versatile' }
                        ]}
                        value={selectedModel}
                        onChange={(val) => onModelChange(val)}
                        placeholder="Select Model"
                    />
                </div>

                <div className={styles.fieldSection}>
                    <div className={styles.fieldLabel}>AI Control Mode</div>
                    <CustomSelect
                        options={aiControlOptions}
                        value={formData.aiControl}
                        onChange={(val) => handleCustomSelectChange('aiControl', val)}
                        placeholder="Select Control"
                    />
                </div>
            </div>

            {/* A. Application Type - Radio Buttons */}
            <div className={styles.fieldSection}>
                <div className={styles.fieldLabel}>
                    Application Type
                    <FiPlus className={styles.addIcon} title="Add Custom Application Type" onClick={(e) => openAddModal(e, 'appType')} />
                    <InlineAddPopup
                        category="appType"
                        isOpen={isAddModalOpen}
                        activeCategory={activeCategory}
                        customValue={customValue}
                        setCustomValue={setCustomValue}
                        onAdd={handleAddCustom}
                        onClose={() => setIsAddModalOpen(false)}
                    />
                </div>
                <div className={styles.checkboxGroup}> {/* Reusing checkboxGroup style for grid layout */}
                    {APP_TYPES.map(type => {
                        const isCustom = customOptions.appType.includes(type);
                        return (
                            <div key={type} className={styles.checkboxWrapper}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={type}
                                        checked={formData.type === type}
                                        onChange={() => handleRadioChange('type', type)}
                                    />
                                    {type}
                                </label>
                                {isCustom && (
                                    <FiX
                                        className={styles.removeIcon}
                                        onClick={(e) => handleDeleteCustom(e, 'appType', type)}
                                        title="Remove custom option"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Developer Options Dropdown */}
            <div className={styles.fieldSection}>
                <div
                    className={styles.advancedToggle}
                    onClick={() => setIsDeveloperSettingsOpen(!isDeveloperSettingsOpen)}
                    role="button"
                    tabIndex={0}
                >
                    <span>Developer Options</span>
                    <FiChevronDown
                        className={styles.chevron}
                        style={{ transform: isDeveloperSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                </div>

                {isDeveloperSettingsOpen && (
                    <div className={styles.advancedContent}>
                        {/* B. Frontend Stack */}
                        {showFrontend() && (
                            <div className={styles.fieldSection}>
                                <div className={styles.fieldLabel}>
                                    Frontend Frameworks
                                    <FiPlus className={styles.addIcon} title="Add Custom Framework" onClick={(e) => openAddModal(e, 'frontendStack')} />
                                    <InlineAddPopup
                                        category="frontendStack"
                                        isOpen={isAddModalOpen}
                                        activeCategory={activeCategory}
                                        customValue={customValue}
                                        setCustomValue={setCustomValue}
                                        onAdd={handleAddCustom}
                                        onClose={() => setIsAddModalOpen(false)}
                                    />
                                </div>
                                <div className={styles.checkboxGroup}>
                                    {FRONTEND_FRAMEWORKS.map(opt => {
                                        const isCustom = customOptions.frontendStack.includes(opt);
                                        return (
                                            <div key={opt} className={styles.checkboxWrapper}>
                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.frontendStack.includes(opt)}
                                                        onChange={() => handleCheckboxChange('frontendStack', opt)}
                                                    />
                                                    {opt}
                                                </label>
                                                {isCustom && (
                                                    <FiX
                                                        className={styles.removeIcon}
                                                        onClick={(e) => handleDeleteCustom(e, 'frontendStack', opt)}
                                                        title="Remove custom option"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className={styles.fieldLabel} style={{ marginTop: '10px' }}>
                                    Styling
                                    <FiPlus className={styles.addIcon} title="Add Custom Styling" onClick={(e) => openAddModal(e, 'frontendStyling')} />
                                    <InlineAddPopup
                                        category="frontendStyling"
                                        isOpen={isAddModalOpen}
                                        activeCategory={activeCategory}
                                        customValue={customValue}
                                        setCustomValue={setCustomValue}
                                        onAdd={handleAddCustom}
                                        onClose={() => setIsAddModalOpen(false)}
                                    />
                                </div>
                                <div className={styles.checkboxGroup}>
                                    {STYLING_OPTIONS.map(opt => {
                                        const isCustom = customOptions.frontendStyling.includes(opt);
                                        return (
                                            <div key={opt} className={styles.checkboxWrapper}>
                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.frontendStyling.includes(opt)}
                                                        onChange={() => handleCheckboxChange('frontendStyling', opt)}
                                                    />
                                                    {opt}
                                                </label>
                                                {isCustom && (
                                                    <FiX
                                                        className={styles.removeIcon}
                                                        onClick={(e) => handleDeleteCustom(e, 'frontendStyling', opt)}
                                                        title="Remove custom option"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* C. Mobile Stack */}
                        {showMobile() && (
                            <div className={styles.fieldSection}>
                                <div className={styles.fieldLabel}>
                                    Mobile Stack
                                    <FiPlus className={styles.addIcon} title="Add Custom Mobile Framework" onClick={(e) => openAddModal(e, 'mobileStack')} />
                                    <InlineAddPopup
                                        category="mobileStack"
                                        isOpen={isAddModalOpen}
                                        activeCategory={activeCategory}
                                        customValue={customValue}
                                        setCustomValue={setCustomValue}
                                        onAdd={handleAddCustom}
                                        onClose={() => setIsAddModalOpen(false)}
                                    />
                                </div>
                                <div className={styles.checkboxGroup}>
                                    {MOBILE_STACK.map(opt => {
                                        const isCustom = customOptions.mobileStack.includes(opt);
                                        return (
                                            <div key={opt} className={styles.checkboxWrapper}>
                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.mobileStack.includes(opt)}
                                                        onChange={() => handleCheckboxChange('mobileStack', opt)}
                                                    />
                                                    {opt}
                                                </label>
                                                {isCustom && (
                                                    <FiX
                                                        className={styles.removeIcon}
                                                        onClick={(e) => handleDeleteCustom(e, 'mobileStack', opt)}
                                                        title="Remove custom option"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* D. Backend Stack */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>
                                Backend Stack
                                <FiPlus className={styles.addIcon} title="Add Custom Backend Framework" onClick={(e) => openAddModal(e, 'backendStack')} />
                                <InlineAddPopup
                                    category="backendStack"
                                    isOpen={isAddModalOpen}
                                    activeCategory={activeCategory}
                                    customValue={customValue}
                                    setCustomValue={setCustomValue}
                                    onAdd={handleAddCustom}
                                    onClose={() => setIsAddModalOpen(false)}
                                />
                            </div>
                            <div className={styles.checkboxGroup}>
                                {BACKEND_STACK.map(opt => {
                                    const isCustom = customOptions.backendStack.includes(opt);
                                    return (
                                        <div key={opt} className={styles.checkboxWrapper}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.backendStack.includes(opt)}
                                                    onChange={() => handleCheckboxChange('backendStack', opt)}
                                                />
                                                {opt}
                                            </label>
                                            {isCustom && (
                                                <FiX
                                                    className={styles.removeIcon}
                                                    onClick={(e) => handleDeleteCustom(e, 'backendStack', opt)}
                                                    title="Remove custom option"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* E. Database */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>
                                Database
                                <FiPlus className={styles.addIcon} title="Add Custom Database" onClick={(e) => openAddModal(e, 'database')} />
                                <InlineAddPopup
                                    category="database"
                                    isOpen={isAddModalOpen}
                                    activeCategory={activeCategory}
                                    customValue={customValue}
                                    setCustomValue={setCustomValue}
                                    onAdd={handleAddCustom}
                                    onClose={() => setIsAddModalOpen(false)}
                                />
                            </div>
                            <div className={styles.checkboxGroup}>
                                {DATABASE_OPTIONS.map(opt => {
                                    const isCustom = customOptions.database.includes(opt);
                                    return (
                                        <div key={opt} className={styles.checkboxWrapper}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="radio"
                                                    name="database"
                                                    value={opt}
                                                    checked={formData.database === opt}
                                                    onClick={() => {
                                                        if (formData.database === opt) {
                                                            handleRadioChange('database', 'None');
                                                        } else {
                                                            handleRadioChange('database', opt);
                                                        }
                                                    }}
                                                    onChange={() => { }} // specific handler above
                                                />
                                                {opt}
                                            </label>
                                            {isCustom && (
                                                <FiX
                                                    className={styles.removeIcon}
                                                    onClick={(e) => handleDeleteCustom(e, 'database', opt)}
                                                    title="Remove custom option"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* F. Authentication */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>
                                Authentication
                                <FiPlus className={styles.addIcon} title="Add Custom Auth Option" onClick={(e) => openAddModal(e, 'auth')} />
                                <InlineAddPopup
                                    category="auth"
                                    isOpen={isAddModalOpen}
                                    activeCategory={activeCategory}
                                    customValue={customValue}
                                    setCustomValue={setCustomValue}
                                    onAdd={handleAddCustom}
                                    onClose={() => setIsAddModalOpen(false)}
                                />
                            </div>
                            <div className={styles.checkboxGroup}>
                                {AUTH_OPTIONS.map(opt => {
                                    const isCustom = customOptions.auth.includes(opt);
                                    return (
                                        <div key={opt} className={styles.checkboxWrapper}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.auth.includes(opt)}
                                                    onChange={() => handleCheckboxChange('auth', opt)}
                                                />
                                                {opt}
                                            </label>
                                            {isCustom && (
                                                <FiX
                                                    className={styles.removeIcon}
                                                    onClick={(e) => handleDeleteCustom(e, 'auth', opt)}
                                                    title="Remove custom option"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* G. API / Communication */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>
                                API / Communication
                                <FiPlus className={styles.addIcon} title="Add Custom API Option" onClick={(e) => openAddModal(e, 'api')} />
                                <InlineAddPopup
                                    category="api"
                                    isOpen={isAddModalOpen}
                                    activeCategory={activeCategory}
                                    customValue={customValue}
                                    setCustomValue={setCustomValue}
                                    onAdd={handleAddCustom}
                                    onClose={() => setIsAddModalOpen(false)}
                                />
                            </div>
                            <div className={styles.checkboxGroup}>
                                {API_OPTIONS.map(opt => {
                                    const isCustom = customOptions.api.includes(opt);
                                    return (
                                        <div key={opt} className={styles.checkboxWrapper}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.api.includes(opt)}
                                                    onChange={() => handleCheckboxChange('api', opt)}
                                                />
                                                {opt}
                                            </label>
                                            {isCustom && (
                                                <FiX
                                                    className={styles.removeIcon}
                                                    onClick={(e) => handleDeleteCustom(e, 'api', opt)}
                                                    title="Remove custom option"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* H. Dev & Quality */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>
                                Dev & Quality
                                <FiPlus
                                    className={styles.addIcon}
                                    onClick={(e) => openAddModal(e, 'devOps')}
                                    title="Add Custom Test/Dev Option"
                                />
                                <InlineAddPopup
                                    category="devOps"
                                    isOpen={isAddModalOpen}
                                    activeCategory={activeCategory}
                                    customValue={customValue}
                                    setCustomValue={setCustomValue}
                                    onAdd={handleAddCustom}
                                    onClose={() => setIsAddModalOpen(false)}
                                />
                            </div>
                            <div className={styles.checkboxGroup}>
                                {DEVOPS_OPTIONS.map(opt => {
                                    const isCustom = customOptions.devOps.includes(opt);
                                    return (
                                        <div key={opt} className={styles.checkboxWrapper}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.devOps.includes(opt)}
                                                    onChange={() => handleCheckboxChange('devOps', opt)}
                                                />
                                                {opt}
                                            </label>
                                            {isCustom && (
                                                <FiX
                                                    className={styles.removeIcon}
                                                    onClick={(e) => handleDeleteCustom(e, 'devOps', opt)}
                                                    title="Remove custom option"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.buttonSection}>
                <button type="submit" className={styles.getApiBtn} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                    <FiZap /> {isSubmitting ? 'GENERATING...' : 'GENERATE PROMPT'}
                </button>
            </div>

        </form>
    );
};

export default ProjectForm;
