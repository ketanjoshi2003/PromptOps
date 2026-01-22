import React, { useState, useCallback, useRef } from 'react';
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

const ChainFlow = () => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);

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

        try {
            const result = await chainService.executeChain(payload);
            console.log("Chain Result:", result);

            if (result.results) {
                // The backend now returns { step_results, enhanced_output }
                // We handle both the old format (for safety) and the new format
                if (result.results.step_results) {
                    setExecutionResults(result.results.step_results);
                } else {
                    // Fallback if backend structure differs
                    setExecutionResults(result.results);
                }

                if (result.results.enhanced_output) {
                    setCombinedOutput(result.results.enhanced_output);
                }
            }
        } catch (error) {
            alert(`Execution failed: ${error.message}`);
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
                        <h3 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Chain Results</h3>

                        {/* Combined Output Section */}
                        {combinedOutput && (
                            <div className={styles.resultItem} style={{ borderLeft: '4px solid var(--color-primary)' }}>
                                <div className={styles.resultHeader}>
                                    <strong>Combined Output</strong>
                                </div>
                                <div className={styles.resultContent} style={{ whiteSpace: 'pre-wrap' }}>
                                    {combinedOutput}
                                </div>
                            </div>
                        )}

                        <hr style={{ margin: '16px 0', borderColor: 'var(--color-border)', opacity: 0.3 }} />

                        {/* Individual Step Results */}
                        {executionResults && nodes.map(node => {
                            const result = executionResults[node.id];
                            if (!result) return null;
                            return (
                                <div key={node.id} className={styles.resultItem}>
                                    <div className={styles.resultHeader}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }}></span>
                                        {node.data.label}
                                    </div>
                                    <div className={styles.resultContent}>
                                        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const ChainPage = () => {
    return (
        <ReactFlowProvider>
            <ChainFlow />
        </ReactFlowProvider>
    );
};

export default ChainPage;
