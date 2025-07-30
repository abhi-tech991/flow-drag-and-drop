import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { enhancedInitialNodes, enhancedInitialEdges } from './enhanced-initial-elements';
import EnhancedDataSourceNode from './nodes/enhanced/EnhancedDataSourceNode';
import EnhancedProcessNode from './nodes/enhanced/EnhancedProcessNode';
import EnhancedAINode from './nodes/enhanced/EnhancedAINode';
import EnhancedFilterNode from './nodes/enhanced/EnhancedFilterNode';
import EnhancedVisualizationNode from './nodes/enhanced/EnhancedVisualizationNode';
import { EnhancedWorkflowToolbar } from './EnhancedWorkflowToolbar';
import { NodeConfigModal } from './modals/NodeConfigModal';
import { useWorkflowState } from './hooks/useWorkflowState';
import { toast } from 'sonner';
import { WorkflowNodeData } from '@/types/workflow';

const enhancedNodeTypes = {
  enhancedDataSource: EnhancedDataSourceNode,
  enhancedProcess: EnhancedProcessNode,
  enhancedAI: EnhancedAINode,
  enhancedFilter: EnhancedFilterNode,
  enhancedVisualization: EnhancedVisualizationNode,
};

const EnhancedWorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(enhancedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(enhancedInitialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  const { 
    currentWorkflow, 
    updateWorkflow, 
    saveWorkflow, 
    validateWorkflow, 
    exportWorkflow 
  } = useWorkflowState();

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success('Connected workflow steps');
    },
    [setEdges],
  );

  const openNodeConfiguration = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setConfigModalOpen(true);
    }
  }, [nodes]);

  // Initialize nodes with onConfigure callbacks
  React.useEffect(() => {
    setNodes((prevNodes) => 
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onConfigure: () => openNodeConfiguration(node.id),
        },
      }))
    );
  }, [openNodeConfiguration]);

  const onAddNode = useCallback((nodeType: string) => {
    const nodeTypeMap = {
      dataSource: 'enhancedDataSource',
      process: 'enhancedProcess',
      ai: 'enhancedAI',
      filter: 'enhancedFilter',
      visualization: 'enhancedVisualization',
    };

    const mappedType = nodeTypeMap[nodeType as keyof typeof nodeTypeMap] || nodeType;

    const newNodeId = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: mappedType,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: getNodeLabel(nodeType),
        description: getNodeDescription(nodeType),
        status: 'idle',
        config: {},
        onConfigure: () => openNodeConfiguration(newNodeId),
      },
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      // Update workflow state
      updateWorkflow({ nodes: updatedNodes, edges });
      return updatedNodes;
    });
    toast.success(`Added ${getNodeLabel(nodeType)} node`);
  }, [setNodes, edges, updateWorkflow, openNodeConfiguration]);

  const getNodeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      dataSource: 'New Data Source',
      process: 'New Process Step',
      ai: 'AI Processing',
      filter: 'Data Filter',
      visualization: 'Data Visualization',
    };
    return labels[type] || type;
  };

  const getNodeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      dataSource: 'Connect to external data source',
      process: 'Transform and process data',
      ai: 'Apply AI/ML algorithms',
      filter: 'Filter and refine data',
      visualization: 'Display results and charts',
    };
    return descriptions[type] || '';
  };

  const onRunWorkflow = useCallback(async () => {
    // Validate workflow before running
    const validation = validateWorkflow(nodes, edges);
    if (!validation.isValid) {
      toast.error(`Cannot run workflow: ${validation.errors.join(', ')}`);
      return;
    }

    setIsRunning(true);
    updateWorkflow({ status: 'running' });
    toast.success('Starting workflow execution...');

    try {
      // Simulate workflow execution with proper error handling
      const nodeIds = nodes.map(n => n.id);
      
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        
        // Set node to processing with progress
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === nodeId
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    status: 'processing',
                    progress: 0
                  } 
                }
              : node
          )
        );

        // Simulate processing with progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.id === nodeId
                ? { 
                    ...node, 
                    data: { 
                      ...node.data, 
                      progress 
                    } 
                  }
                : node
            )
          );
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Set node to completed
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === nodeId
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    status: 'completed',
                    progress: 100
                  } 
                }
              : node
          )
        );

        if (i < nodeIds.length - 1) {
          toast.info(`Completed step ${i + 1} of ${nodeIds.length}`);
        }
      }

      setIsRunning(false);
      updateWorkflow({ status: 'completed' });
      toast.success('Workflow completed successfully!');
      
      // Auto-save after successful run
      await saveWorkflow();
      
    } catch (error) {
      setIsRunning(false);
      updateWorkflow({ status: 'error' });
      toast.error('Workflow execution failed');
      console.error('Workflow execution error:', error);
    }
  }, [nodes, edges, setNodes, validateWorkflow, updateWorkflow, saveWorkflow]);

  const onClearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    toast.success('Workflow cleared');
  }, [setNodes, setEdges]);

  const onSaveWorkflow = useCallback(async () => {
    updateWorkflow({ nodes, edges });
    await saveWorkflow();
  }, [nodes, edges, updateWorkflow, saveWorkflow]);

  const onExportWorkflow = useCallback(() => {
    updateWorkflow({ nodes, edges });
    exportWorkflow();
  }, [nodes, edges, updateWorkflow, exportWorkflow]);

  const handleNodeConfigSave = useCallback((config: any) => {
    if (!selectedNode) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                config,
                label: config.stepName || node.data.label,
                description: config.description || node.data.description,
              },
            }
          : node
      )
    );

    toast.success('Configuration saved successfully');
  }, [selectedNode, setNodes]);

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <EnhancedWorkflowToolbar 
        onAddNode={onAddNode}
        onClearWorkflow={onClearWorkflow}
        onRunWorkflow={onRunWorkflow}
        onSaveWorkflow={onSaveWorkflow}
        onExportWorkflow={onExportWorkflow}
        isRunning={isRunning}
      />
      
      <div className="flex-1 bg-gradient-workflow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={enhancedNodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="enhanced-workflow-canvas"
        >
          <Background 
            color="hsl(var(--muted-foreground) / 0.2)" 
            gap={24} 
            size={1}
          />
          <Controls className="enhanced-controls" />
          <MiniMap 
            className="enhanced-minimap" 
            pannable 
            zoomable
            nodeColor={(node) => {
              switch (node.type) {
                case 'enhancedDataSource': return 'hsl(var(--workflow-erp))';
                case 'enhancedProcess': return 'hsl(var(--workflow-process))';
                case 'enhancedAI': return 'hsl(var(--workflow-ai))';
                case 'enhancedFilter': return 'hsl(var(--workflow-filter))';
                case 'enhancedVisualization': return 'hsl(var(--workflow-analyze))';
                default: return 'hsl(var(--primary))';
              }
            }}
          />
        </ReactFlow>
      </div>
      
      {/* Configuration Modal */}
      {selectedNode && (
        <NodeConfigModal
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setSelectedNode(null);
          }}
          onSave={handleNodeConfigSave}
          nodeData={selectedNode.data as WorkflowNodeData}
          nodeType={selectedNode.type || ''}
        />
      )}
    </div>
  );
};

export default EnhancedWorkflowBuilder;