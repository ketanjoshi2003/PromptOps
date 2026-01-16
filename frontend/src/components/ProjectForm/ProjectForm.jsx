import React, { useState } from 'react';
import { FiZap } from 'react-icons/fi';
import styles from './ProjectForm.module.css';
import CustomSelect from '../CustomSelect/CustomSelect';

const ProjectForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Web Application',
        frontendStack: [],
        backendStack: [],
        database: 'None',
        complexity: 'Medium',
        aiControl: 'Strict',
        additionalInstructions: ''
    });


    const [errors, setErrors] = useState({});

    // Configuration for each project type
    const PROJECT_DATA = {
        'Web Application': {
            frontend: ['React', 'Next.js', 'Vue', 'Angular', 'None'],
            backend: ['FastAPI', 'Node.js (Express)', 'Django', 'Spring Boot']
        },
        'Mobile Application': {
            frontend: ['React Native', 'Flutter', 'Expo', 'Ionic', 'Kotlin', 'Java', 'Jetpack Compose', 'XML'],
            backend: ['FastAPI', 'Node.js (Express)', 'Firebase', 'Supabase', 'Spring Boot']
        },
        'Backend API': {
            frontend: ['None'],
            backend: ['FastAPI', 'Node.js (Express)', 'Django', 'Spring Boot', 'Go (Gin)']
        }
    };

    const projectTypes = Object.keys(PROJECT_DATA);

    // Dynamic options based on selected type
    const currentType = formData.type || 'Web Application';
    const frontendOptions = PROJECT_DATA[currentType]?.frontend || [];
    const backendOptions = PROJECT_DATA[currentType]?.backend || [];
    const databaseOptions = ['PostgreSQL', 'MySQL', 'MongoDB', 'None'];
    const complexityLevels = ['Low', 'Medium', 'High'];
    const aiControlOptions = ['Strict', 'Balanced', 'Exploratory'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCustomSelectChange = (name, value) => {
        setFormData(prev => {
            const updates = { [name]: value };
            // Reset stacks if project type changes to avoid invalid selections
            if (name === 'type') {
                updates.frontendStack = [];
                updates.backendStack = [];
            }
            return { ...prev, ...updates };
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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
        if (errors[group]) {
            setErrors(prev => ({ ...prev, [group]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.additionalInstructions.trim()) newErrors.additionalInstructions = 'Objective description is required';
        // Backend stack is now optional

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
                <div className={styles.fieldLabel}>
                    Project Title
                </div>
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
                    <div className={styles.fieldLabel}>
                        Project Type <div className={styles.infoIcon}>i</div>
                    </div>
                    <CustomSelect
                        options={projectTypes}
                        value={formData.type}
                        onChange={(val) => handleCustomSelectChange('type', val)}
                        placeholder="Select Type"
                    />
                </div>
                <div className={styles.fieldSection}>
                    <div className={styles.fieldLabel}>
                        Complexity Level <div className={styles.infoIcon}>i</div>
                    </div>
                    <CustomSelect
                        options={complexityLevels}
                        value={formData.complexity}
                        onChange={(val) => handleCustomSelectChange('complexity', val)}
                        placeholder="Select Complexity"
                    />
                </div>
            </div>

            <div className={styles.fieldSection}>
                <div className={styles.fieldLabel}>
                    AI Control Mode <div className={styles.infoIcon}>i</div>
                </div>
                <CustomSelect
                    options={aiControlOptions}
                    value={formData.aiControl}
                    onChange={(val) => handleCustomSelectChange('aiControl', val)}
                    placeholder="Select AI Control Mode"
                />
            </div>

            <div className={styles.fieldSection}>
                <div className={styles.advancedContent}>
                    <div className={styles.fieldSection}>
                        <div className={styles.fieldLabel}>Frontend Stack</div>
                        <div className={styles.checkboxGroup}>
                            {frontendOptions.map(option => (
                                <label key={option} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.frontendStack.includes(option)}
                                        onChange={() => handleCheckboxChange('frontendStack', option)}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.fieldSection}>
                        <div className={styles.fieldLabel}>Backend Stack</div>
                        <div className={styles.checkboxGroup}>
                            {backendOptions.map(option => (
                                <label key={option} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.backendStack.includes(option)}
                                        onChange={() => handleCheckboxChange('backendStack', option)}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                        {errors.backendStack && <span className={styles.errorText}>{errors.backendStack}</span>}
                    </div>

                    <div className={styles.fieldSection}>
                        <div className={styles.fieldLabel}>Database</div>
                        <CustomSelect
                            options={databaseOptions}
                            value={formData.database}
                            onChange={(val) => handleCustomSelectChange('database', val)}
                            placeholder="Select Database"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.buttonSection}>
                <button type="submit" className={styles.getApiBtn}>
                    <FiZap /> GENERATE PROMPT
                </button>
            </div>

        </form>
    );
};

export default ProjectForm;
