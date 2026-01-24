import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Handle,
    Position,
    useReactFlow,
    ReactFlowProvider,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FiPlus, FiPlay, FiTrash2, FiX, FiZap } from 'react-icons/fi';
import styles from './ChainPage.module.css';
import { chainService } from '../services/chainService';

// Custom Edge Component
const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <button
                        className={styles.edgeButton}
                        onClick={onEdgeClick}
                        title="Disconnect"
                    >
                        <FiX />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

// Custom Node Component
const PromptNode = ({ data, id }) => {
    return (
        <div className={styles.nodeContainer}>
            <div className={styles.nodeHeader}>
                <span>{data.label}</span>
                <button
                    onClick={() => data.onDelete(id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                    <FiTrash2 size={14} />
                </button>
            </div>
            <div className={`${styles.nodeBody} nodrag`}>
                <textarea
                    className={`${styles.nodeInput} nodrag`}
                    placeholder="Enter prompt..."
                    value={data.prompt}
                    onChange={(evt) => data.onChange(id, evt.target.value)}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag when typing
                />
            </div>
            {/* Input Handle (Context from previous) */}
            <Handle type="target" position={Position.Left} id="in" />

            {/* Output Handle (Output to next) */}
            <Handle type="source" position={Position.Right} id="out" />
        </div>
    );
};

const nodeTypes = {
    promptNode: PromptNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

const initialNodes = [
    {
        id: '1',
        type: 'promptNode',
        position: { x: 50, y: 50 },
        data: { label: 'Start Prompt', prompt: '' },
    },
];

const AutoResizeTextarea = ({ value, onChange, isNotification, readOnly }) => {
    const textareaRef = useRef(null);
    const shadowRef = useRef(null);

    React.useEffect(() => {
        if (textareaRef.current && shadowRef.current) {
            shadowRef.current.value = value;
            const newHeight = shadowRef.current.scrollHeight;
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [value]);

    const renderHighlights = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const headerMatch = line.match(/^((#+)\s)(.*)/);
            const bulletMatch = line.match(/^(-\s)(.*)/);
            const numberMatch = line.match(/^(\d+[\.\)]\s)(.*)/);
            const stepMatch = line.match(/^((Step[_\s]+\d+:?)\s*)(.*)/i); // Added Step Match (underscore or space)

            let content;
            if (headerMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{headerMatch[1]}</span>
                        {headerMatch[3]}
                    </>
                );
            } else if (bulletMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{bulletMatch[1]}</span>
                        {bulletMatch[2]}
                    </>
                );
            } else if (numberMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{numberMatch[1]}</span>
                        {numberMatch[2]}
                    </>
                );
            } else if (stepMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{stepMatch[1]}</span>
                        {stepMatch[3]}
                    </>
                );
            } else {
                content = line;
            }

            return (
                <React.Fragment key={i}>
                    {content}
                    {i < lines.length - 1 && '\n'}
                </React.Fragment>
            );
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <textarea
                ref={shadowRef}
                className={styles.codeEditor}
                value={value}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    visibility: 'hidden',
                    height: '0',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    zIndex: -100
                }}
            />
            <div
                className={styles.codeEditor}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    color: isNotification ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                    background: 'var(--color-bg-secondary)',
                    pointerEvents: 'none',
                    borderColor: 'transparent',
                    zIndex: 0,
                    overflow: 'hidden'
                }}
            >
                {renderHighlights(value)}
            </div>

            <textarea
                ref={textareaRef}
                className={styles.codeEditor}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                readOnly={readOnly}
                rows={1}
                style={{
                    overflow: 'hidden',
                    color: 'transparent',
                    background: 'transparent',
                    caretColor: 'var(--color-text-primary)',
                    position: 'relative',
                    zIndex: 1
                }}
                spellCheck={false}
                autoCorrect="off"
            />
        </div>
    );
};

const ChainFlow = ({ onUsageUpdate }) => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [chainId, setChainId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const isLoaded = useRef(false);

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            try {
                const chains = await chainService.getChains();
                if (chains.length > 0) {
                    // Sort by updated_at descending
                    chains.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                    const latest = chains[0];
                    setChainId(latest.id);
                    setNodes(latest.nodes);
                    setEdges(latest.edges);
                }
            } catch (err) {
                console.error("Failed to load chains:", err);
            } finally {
                isLoaded.current = true; // Mark as loaded so auto-save can start
            }
        };
        if (localStorage.getItem('token')) {
            loadData();
        } else {
            isLoaded.current = true;
        }
    }, []);

    // Auto-Save Effect
    useEffect(() => {
        if (!isLoaded.current) return;
        if (!localStorage.getItem('token')) return;

        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                if (chainId) {
                    await chainService.updateChain(chainId, { nodes, edges });
                } else {
                    // Create new
                    // Only create if there's meaningful content (more than initial node or modified initial)
                    const isDefault = nodes.length === 1 && nodes[0].data.prompt === '' && edges.length === 0;
                    if (!isDefault) {
                        const newChain = await chainService.createChain({
                            title: `Chain ${new Date().toLocaleString()}`,
                            nodes,
                            edges
                        });
                        setChainId(newChain.id);
                    }
                }
            } catch (err) {
                console.error("Auto-save failed:", err);
            } finally {
                setIsSaving(false);
            }
        }, 2000); // 2s debounce

        return () => clearTimeout(timer);
    }, [nodes, edges, chainId]);

    // ... (handlers remain mostly same, just update onConnect)

    // Node Change Handler for text updates
    const onNodeDataChange = useCallback((id, text) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            prompt: text,
                        },
                    };
                }
                return node;
            })
        );
    }, []);

    // Node Delete Handler
    const onNodeDelete = useCallback((id) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, []);

    // Inject handlers into node data
    const nodesWithHandlers = nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onChange: onNodeDataChange,
            onDelete: onNodeDelete
        }
    }));

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
        [],
    );

    const onAddNode = useCallback(() => {
        const id = `${nodes.length + 1}`;
        const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : { position: { x: 0, y: 0 } };
        const newNode = {
            id,
            type: 'promptNode',
            // Position new node relative to the last one (offset by x + 350)
            position: {
                x: lastNode.position.x + 350,
                y: lastNode.position.y
            },
            data: { label: `Step ${id}`, prompt: '' },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes]);

    const onClearAll = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all steps?')) {
            setNodes([]);
            setEdges([]);
            setExecutionResults(null);
            setCombinedOutput(null);
        }
    }, []);

    const [executionResults, setExecutionResults] = useState(null);
    const [combinedOutput, setCombinedOutput] = useState(null);
    const [isNotification, setIsNotification] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const onGenerate = useCallback(async (mode = 'template') => {
        // Prepare payload
        const payload = {
            nodes: nodes.map(n => ({ id: n.id, data: { label: n.data.label, prompt: n.data.prompt } })),
            edges: edges.map(e => ({ source: e.source, target: e.target })),
            mode: mode
        };

        console.log(`Generating (${mode}) with:`, payload);
        setIsGenerating(true);
        setExecutionResults(null);
        setCombinedOutput(null);
        setIsNotification(false);

        const token = localStorage.getItem('token');
        if (!token) {
            setCombinedOutput("Authentication error. Please log in.");
            setIsNotification(true);
            setIsGenerating(false);
            return;
        }

        try {
            const result = await chainService.executeChain(payload);
            console.log("Chain Result:", result);

            if (result.results) {
                // The backend now returns { step_results, enhanced_output }
                // We handle both the old format (for safety) and the new format
                if (result.results.step_results) {
                    // setExecutionResults(result.results.step_results); // Hidden as per request
                } else {
                    // Fallback if backend structure differs
                    // setExecutionResults(result.results);
                }

                if (result.results.enhanced_output) {
                    setCombinedOutput(result.results.enhanced_output);
                    setIsNotification(false);
                }

                if (onUsageUpdate) onUsageUpdate();
            }
        } catch (error) {
            console.error(error);
            setIsNotification(true);
            if (error.message.includes('401') || error.message.includes('Session expired')) {
                setCombinedOutput("Session expired. Please log in again.");
                // Optionally clear token here if you want: localStorage.removeItem('token');
            } else if (error.message.includes('403') || error.message.includes('Usage limit')) {
                setCombinedOutput("Usage limit reached. Please upgrade to the Dev plan.");
            } else {
                setCombinedOutput(`Execution failed: ${error.message}`);
            }
        } finally {
            setIsGenerating(false);
        }

    }, [nodes, edges]);

    return (
        <div className={styles.chainContainer}>
            {/* Portal Actions to Header */}
            {document.getElementById('header-actions-root') && createPortal(
                <div className={styles.headerPortalContainer}>
                    <div className={styles.headerPortalLeft}>
                        <button className={`${styles.controlButton} ${styles.addBtn}`} onClick={onAddNode}>
                            <FiPlus /> Add Step
                        </button>
                        <button className={`${styles.controlButton} ${styles.clearBtn}`} onClick={onClearAll}>
                            <FiTrash2 /> Clear All
                        </button>
                    </div>
                    <div className={styles.headerPortalRight}>
                        <button
                            className={`${styles.controlButton} ${styles.generateBtn}`}
                            onClick={() => onGenerate('template')}
                            disabled={isGenerating}
                            title="Generate just the combined prompt template"
                        >
                            <FiPlay /> Generate Template
                        </button>

                        <button
                            className={`${styles.controlButton} ${styles.generateEnhancedBtn}`}
                            onClick={() => onGenerate('enhanced')}
                            disabled={isGenerating}
                            title="Generate and enhance with AI"
                        >
                            <FiZap /> Generate Enhanced
                        </button>
                        {isSaving && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Saving...</span>}
                    </div>
                </div>,
                document.getElementById('header-actions-root')
            )}

            <div className={styles.mainContent}>
                <div className={styles.flowContainer}>
                    <ReactFlow
                        nodes={nodesWithHandlers}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                        minZoom={0.1}
                        maxZoom={1.5}
                    >
                    </ReactFlow>
                </div>

                {(executionResults || combinedOutput) && (
                    <div className={styles.resultsSidebar}>


                        {/* Combined Output Section */}
                        {combinedOutput && (
                            <div className={styles.resultItem}>
                                <div className={styles.resultHeader}>
                                    <strong>Chained Prompt</strong>
                                </div>
                                <div className={styles.resultContent} style={{ padding: 0 }}>
                                    <AutoResizeTextarea
                                        value={combinedOutput}
                                        onChange={(val) => {
                                            setCombinedOutput(val);
                                            if (!val || val.trim() === '') {
                                                setCombinedOutput(null);
                                                setExecutionResults(null);
                                            }
                                        }}
                                        readOnly={false}
                                        isNotification={isNotification}
                                    />
                                </div>
                            </div>
                        )}




                    </div>
                )}
            </div>
        </div>
    );
};

const ChainPage = ({ onUsageUpdate }) => {
    return (
        <ReactFlowProvider>
            <ChainFlow onUsageUpdate={onUsageUpdate} />
        </ReactFlowProvider>
    );
};

export default ChainPage;
