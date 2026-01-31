import React, { useState } from 'react';
import { FiZap, FiChevronDown } from 'react-icons/fi';
import styles from './ProjectForm.module.css';
import CustomSelect from '../CustomSelect/CustomSelect';

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
    const [isDevOpsOpen, setIsDevOpsOpen] = useState(false);
    const [isDeveloperSettingsOpen, setIsDeveloperSettingsOpen] = useState(false);

    const [errors, setErrors] = useState({});

    // 1️⃣ Canonical Tech Stack Categories

    // A. Application Type
    const APP_TYPES = [
        'Web App', 'Mobile App', 'Full-Stack App',
        'Backend API', 'SaaS Platform', 'Admin Dashboard',
        'Landing Page', 'CLI Tool', 'Microservice', 'AI-powered App'
    ];

    // B. Frontend Stack (Only if app type involves UI)
    const FRONTEND_FRAMEWORKS = [
        'React', 'Next.js', 'Vue', 'Nuxt',
        'Angular', 'Svelte / SvelteKit', 'Flutter (web/mobile)', 'None'
    ];
    const STYLING_OPTIONS = [
        'CSS', 'Tailwind CSS', 'Material UI',
        'Ant Design', 'Bootstrap', 'Chakra UI'
    ];

    // C. Mobile Stack (Only if Mobile App is selected)
    const MOBILE_STACK = [
        'React Native', 'Flutter', 'SwiftUI (iOS)',
        'Kotlin (Android)', 'Expo'
    ];

    // D. Backend Stack (API & business logic)
    const BACKEND_STACK = [
        'Node.js (Express)', 'Node.js (NestJS)', 'FastAPI',
        'Django', 'Django REST Framework', 'Spring Boot',
        '.NET Web API', 'Ruby on Rails', 'Go (Gin / Fiber)',
        'None (Frontend-only)'
    ];

    // E. Database (Persistence layer)
    const DATABASE_OPTIONS = [
        'PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', // SQL
        'MongoDB', 'Redis', 'DynamoDB', 'Firestore' // NoSQL
    ];

    // F. Authentication
    const AUTH_OPTIONS = [
        'Email + Password', 'JWT', 'OAuth (Google, GitHub)',
        'Session-based', 'None'
    ];

    // G. API / Communication
    const API_OPTIONS = [
        'REST', 'GraphQL', 'WebSockets', 'gRPC'
    ];

    // H. Dev & Quality (Advanced)
    const DEVOPS_OPTIONS = [
        'Unit tests', 'Integration tests', 'TypeScript',
        'Linting', 'Docker', 'CI/CD'
    ];


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
                <div className={styles.fieldLabel}>Application Type</div>
                <div className={styles.checkboxGroup}> {/* Reusing checkboxGroup style for grid layout */}
                    {APP_TYPES.map(type => (
                        <label key={type} className={styles.checkboxLabel}>
                            <input
                                type="radio"
                                name="type"
                                value={type}
                                checked={formData.type === type}
                                onChange={() => handleRadioChange('type', type)}
                            />
                            {type}
                        </label>
                    ))}
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
                                <div className={styles.fieldLabel}>Frontend Frameworks</div>
                                <div className={styles.checkboxGroup}>
                                    {FRONTEND_FRAMEWORKS.map(opt => (
                                        <label key={opt} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={formData.frontendStack.includes(opt)}
                                                onChange={() => handleCheckboxChange('frontendStack', opt)}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                                <div className={styles.fieldLabel} style={{ marginTop: '10px' }}>Styling</div>
                                <div className={styles.checkboxGroup}>
                                    {STYLING_OPTIONS.map(opt => (
                                        <label key={opt} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={formData.frontendStyling.includes(opt)}
                                                onChange={() => handleCheckboxChange('frontendStyling', opt)}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* C. Mobile Stack */}
                        {showMobile() && (
                            <div className={styles.fieldSection}>
                                <div className={styles.fieldLabel}>Mobile Stack</div>
                                <div className={styles.checkboxGroup}>
                                    {MOBILE_STACK.map(opt => (
                                        <label key={opt} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={formData.mobileStack.includes(opt)}
                                                onChange={() => handleCheckboxChange('mobileStack', opt)}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* D. Backend Stack */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>Backend Stack</div>
                            <div className={styles.checkboxGroup}>
                                {BACKEND_STACK.map(opt => (
                                    <label key={opt} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.backendStack.includes(opt)}
                                            onChange={() => handleCheckboxChange('backendStack', opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* E. Database */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>Database</div>
                            <div className={styles.checkboxGroup}>
                                {DATABASE_OPTIONS.map(opt => (
                                    <label key={opt} className={styles.checkboxLabel}>
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
                                ))}
                            </div>
                        </div>

                        {/* F. Authentication */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>Authentication</div>
                            <div className={styles.checkboxGroup}>
                                {AUTH_OPTIONS.map(opt => (
                                    <label key={opt} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.auth.includes(opt)}
                                            onChange={() => handleCheckboxChange('auth', opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* G. API / Communication */}
                        <div className={styles.fieldSection}>
                            <div className={styles.fieldLabel}>API / Communication</div>
                            <div className={styles.checkboxGroup}>
                                {API_OPTIONS.map(opt => (
                                    <label key={opt} className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.api.includes(opt)}
                                            onChange={() => handleCheckboxChange('api', opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* H. Dev & Quality */}
                        <div className={styles.fieldSection}>
                            <div
                                className={styles.advancedToggle}
                                onClick={() => setIsDevOpsOpen(!isDevOpsOpen)}
                                role="button"
                                tabIndex={0}
                            >
                                <span>Dev & Quality (Advanced)</span>
                                <FiChevronDown
                                    className={styles.chevron}
                                    style={{ transform: isDevOpsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                />
                            </div>

                            {isDevOpsOpen && (
                                <div className={styles.advancedContent}>
                                    <div className={styles.checkboxGroup}>
                                        {DEVOPS_OPTIONS.map(opt => (
                                            <label key={opt} className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.devOps.includes(opt)}
                                                    onChange={() => handleCheckboxChange('devOps', opt)}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
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
