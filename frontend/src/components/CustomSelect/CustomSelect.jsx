import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styles from './CustomSelect.module.css';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select...', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSelect = (option) => {
        const val = typeof option === 'object' ? option.value : option;
        onChange(val);
        setIsOpen(false);
    };

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Find label for current value
    const getDisplayLabel = () => {
        if (!value) return placeholder || "Select...";

        // Check if options are objects
        if (options.length > 0 && typeof options[0] === 'object') {
            const found = options.find(o => o.value === value);
            return found ? found.label : value;
        }

        return value;
    };

    return (
        <div className={`${styles.selectContainer} ${className}`} ref={containerRef}>
            <div
                className={`${styles.selectHeader} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.selectedValue}>
                    {getDisplayLabel()}
                </div>
                <FiChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
            </div>

            {isOpen && (
                <div className={styles.optionsList}>
                    {options.map((option, index) => {
                        const optValue = typeof option === 'object' ? option.value : option;
                        const optLabel = typeof option === 'object' ? option.label : option;

                        return (
                            <div
                                key={index}
                                className={`${styles.option} ${value === optValue ? styles.selected : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {optLabel}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
