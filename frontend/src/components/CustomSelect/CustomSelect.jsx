import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSelect = (option) => {
        onChange(option);
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

    return (
        <div className={styles.selectContainer} ref={containerRef}>
            <div className={`${styles.selectHeader} ${isOpen ? styles.open : ''}`} onClick={handleToggle}>
                <span className={styles.selectedValue}>{value || placeholder}</span>
                <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>▼</span>
            </div>
            {isOpen && (
                <div className={styles.optionsContainer}>
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`${styles.option} ${option === value ? styles.selected : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
