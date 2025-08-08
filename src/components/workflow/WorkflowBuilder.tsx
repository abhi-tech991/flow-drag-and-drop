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

import { initialNodes, initialEdges } from './initial-elements';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import DataSourceNode from './nodes/DataSourceNode';
import ProcessNode from './nodes/ProcessNode';
import AINode from './nodes/AINode';
import FilterNode from './nodes/FilterNode';
import VisualizationNode from './nodes/VisualizationNode';
import ConditionalNode from './nodes/ConditionalNode';
import SwitchNode from './nodes/SwitchNode';
import CustomNodeRenderer from './CustomNodeRenderer';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowSidebar } from './WorkflowSidebar';
import { NodeConfigModal } from './modals/NodeConfigModal';
import { CustomNodeConfigModal } from './modals/CustomNodeConfigModal';
import { JsonWorkflowBuilder } from './JsonWorkflowBuilder';
import { useWorkflowState } from './hooks/useWorkflowState';
import { toast } from 'sonner';
import { WorkflowNodeData } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { StopCircle } from 'lucide-react';

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  dataSource: DataSourceNode,
  process: ProcessNode,
  ai: AINode,
  filter: FilterNode,
  visualization: VisualizationNode,
  conditional: ConditionalNode,
  switch: SwitchNode,
  // Dynamic custom node types will be added here
};

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [jsonBuilderOpen, setJsonBuilderOpen] = useState(false);
  const [customNodeTypes, setCustomNodeTypes] = useState<Record<string, any>>({});
  const [isCustomNode, setIsCustomNode] = useState(false);
  
  const { 
    currentWorkflow, 
    updateWorkflow, 
    saveWorkflow, 
    validateWorkflow, 
    exportWorkflow 
  } = useWorkflowState();

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      // Check if source already has an outgoing edge (except start node)
      const sourceNode = nodes.find(n => n.id === params.source);
      if (sourceNode?.type !== 'start') {
        const hasOutgoingEdge = edges.some(edge => edge.source === params.source);
        if (hasOutgoingEdge) {
          toast.error('Each node can only have one outgoing connection');
          return;
        }
      }
      
      // Check if target already has an incoming edge (except end node)
      const targetNode = nodes.find(n => n.id === params.target);
      if (targetNode?.type !== 'end') {
        const hasIncomingEdge = edges.some(edge => edge.target === params.target);
        if (hasIncomingEdge) {
          toast.error('Each node can only have one incoming connection');
          return;
        }
      }

      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: 'straight',
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Connected workflow steps');
    },
    [setEdges, nodes, edges]
  );

  const openNodeConfiguration = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      // Check if it's a custom node type
      setIsCustomNode(Object.keys(customNodeTypes).includes(node.type));
      setConfigModalOpen(true);
    }
  }, [nodes, customNodeTypes]);

  const onDeleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    
    // Prevent deletion of start and end nodes
    if (nodeToDelete?.type === 'start' || nodeToDelete?.type === 'end') {
      toast.error('Cannot delete start or end nodes');
      return;
    }

    // Remove the node and its connected edges
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    
    toast.success('Node deleted');
  }, [nodes, setNodes, setEdges]);

  // Initialize nodes with onConfigure and onDelete callbacks
  React.useEffect(() => {
    setNodes((prevNodes) => 
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onConfigure: () => openNodeConfiguration(node.id),
          onDelete: () => onDeleteNode(node.id),
        },
      }))
    );
  }, [openNodeConfiguration, onDeleteNode]);

  const onAddNode = useCallback((nodeType: string) => {
    // Find a good position between start and end nodes
    const startNode = nodes.find(n => n.type === 'start');
    const endNode = nodes.find(n => n.type === 'end');
    
    let newX = 300;
    let newY = 200;
    
    if (startNode && endNode) {
      // Find existing intermediate nodes and place new node after them
      const intermediateNodes = nodes
        .filter(n => n.type !== 'start' && n.type !== 'end')
        .sort((a, b) => a.position.x - b.position.x);
      
      if (intermediateNodes.length > 0) {
        const lastNode = intermediateNodes[intermediateNodes.length - 1];
        newX = Math.min(lastNode.position.x + 250, endNode.position.x - 200);
      } else {
        newX = startNode.position.x + 250;
      }
      newY = startNode.position.y;
    }

    const nodeId = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: nodeType,
      position: { x: newX, y: newY },
      data: {
        label: getNodeLabel(nodeType),
        description: getNodeDescription(nodeType),
        status: 'idle',
        config: {},
        onConfigure: () => openNodeConfiguration(nodeId),
      },
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      updateWorkflow({ nodes: updatedNodes, edges });
      return updatedNodes;
    });
    toast.success(`Added ${getNodeLabel(nodeType)} node`);
  }, [setNodes, edges, updateWorkflow, openNodeConfiguration, nodes]);


  const getNodeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      dataSource: 'New Data Source',
      process: 'New Process Step',
      ai: 'AI Processing',
      filter: 'Data Filter',
      visualization: 'Data Visualization',
      conditional: 'Conditional Logic',
      switch: 'Switch Case',
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
      conditional: 'Add if-else branching logic',
      switch: 'Multi-case branching logic',
    };
    return descriptions[type] || '';
  };

  const handleJsonWorkflowConfig = useCallback((config: any) => {
    // Add custom node types from JSON config
    const newCustomNodeTypes: Record<string, any> = {};
    
    config.nodes?.forEach((nodeConfig: any) => {
      if (!nodeTypes[nodeConfig.type as keyof typeof nodeTypes]) {
        // Create a dynamic component for custom node types
        newCustomNodeTypes[nodeConfig.type] = (props: any) => (
          <CustomNodeRenderer 
            {...props} 
            data={{
              ...props.data,
              customConfig: nodeConfig.config,
              customStyle: nodeConfig.style
            }}
          />
        );
      }
    });

    setCustomNodeTypes(newCustomNodeTypes);
    
    // Add custom nodes to the workflow
    config.nodes?.forEach((nodeConfig: any, index: number) => {
      const nodeId = `${nodeConfig.type}-${Date.now()}-${index}`;
      const newNode: Node = {
        id: nodeId,
        type: nodeConfig.type,
        position: nodeConfig.position || { x: 300 + (index * 250), y: 200 },
        data: {
          label: nodeConfig.label,
          description: nodeConfig.description,
          status: 'idle',
          config: {},
          customConfig: nodeConfig.config,
          customStyle: nodeConfig.style,
          onConfigure: () => openNodeConfiguration(nodeId),
          onDelete: () => onDeleteNode(nodeId),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    });

    toast.success(`Applied custom workflow: ${config.name}`);
  }, [setNodes, openNodeConfiguration, onDeleteNode]);

  const onRunWorkflow = useCallback(async () => {
    // Enhanced workflow validation
    const validation = validateWorkflow(nodes, edges);
    if (!validation.isValid) {
      toast.error(`Cannot run workflow: ${validation.errors.join(', ')}`);
      return;
    }

    // Validate node configurations
    const unconfiguredNodes = nodes.filter(node => {
      if (node.type === 'start' || node.type === 'end') return false;
      const data = node.data as WorkflowNodeData;
      return !data.config || Object.keys(data.config).length === 0;
    });

    if (unconfiguredNodes.length > 0) {
      toast.error(`Please configure all nodes before running. ${unconfiguredNodes.length} nodes need configuration.`);
      return;
    }

    setIsRunning(true);
    setShouldStop(false);
    updateWorkflow({ status: 'running' });
    toast.success('Starting workflow execution...');

    try {
      // Get workflow execution order by following the edge connections
      const sortedNodes = getExecutionOrder(nodes, edges);
      
      for (let i = 0; i < sortedNodes.length && !shouldStop; i++) {
        const nodeId = sortedNodes[i];
        
        // Set node to processing
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
        for (let progress = 0; progress <= 100 && !shouldStop; progress += 20) {
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
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (shouldStop) {
          // Set all remaining nodes to idle
          setNodes((prevNodes) =>
            prevNodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                status: 'idle',
                progress: 0
              }
            }))
          );
          break;
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

        if (i < sortedNodes.length - 1) {
          toast.info(`Completed step ${i + 1} of ${sortedNodes.length}`);
        }
      }

      setIsRunning(false);
      setShouldStop(false);
      
      if (!shouldStop) {
        updateWorkflow({ status: 'completed' });
        toast.success('Workflow completed successfully!');
        await saveWorkflow();
      } else {
        updateWorkflow({ status: 'error' });
        toast.info('Workflow stopped by user');
      }
      
    } catch (error) {
      setIsRunning(false);
      setShouldStop(false);
      updateWorkflow({ status: 'error' });
      toast.error('Workflow execution failed');
      console.error('Workflow execution error:', error);
    }
  }, [nodes, edges, setNodes, validateWorkflow, updateWorkflow, saveWorkflow, shouldStop]);

  const onStopWorkflow = useCallback(() => {
    setShouldStop(true);
    toast.info('Stopping workflow...');
  }, []);

  const getExecutionOrder = (nodes: Node[], edges: Edge[]): string[] => {
    // Simple topological sort for linear workflow
    const order: string[] = [];
    const startNode = nodes.find(n => n.type === 'start');
    
    if (startNode) {
      let currentNodeId = startNode.id;
      order.push(currentNodeId);
      
      while (true) {
        const nextEdge = edges.find(e => e.source === currentNodeId);
        if (!nextEdge) break;
        
        currentNodeId = nextEdge.target;
        order.push(currentNodeId);
      }
    }
    
    return order;
  };

  const onClearWorkflow = useCallback(() => {
    // Keep only start and end nodes
    const startNode = nodes.find(n => n.type === 'start');
    const endNode = nodes.find(n => n.type === 'end');
    
    if (startNode && endNode) {
      setNodes([startNode, endNode]);
    } else {
      setNodes(initialNodes);
    }
    setEdges([]);
    toast.success('Workflow cleared');
  }, [nodes, setNodes, setEdges]);

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

  // Handle node deletion with keyboard
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    nodesToDelete.forEach(node => {
      if (node.type !== 'start' && node.type !== 'end') {
        onDeleteNode(node.id);
      }
    });
  }, [onDeleteNode]);

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <WorkflowSidebar
        onAddNode={onAddNode}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenJsonBuilder={() => setJsonBuilderOpen(true)}
        onSaveWorkflow={onSaveWorkflow}
        onLoadWorkflow={() => toast.info('Load workflow functionality coming soon')}
      />
      
      <WorkflowToolbar 
        onAddNode={onAddNode}
        onClearWorkflow={onClearWorkflow}
        onRunWorkflow={onRunWorkflow}
        onStopWorkflow={onStopWorkflow}
        onSaveWorkflow={onSaveWorkflow}
        onExportWorkflow={onExportWorkflow}
        isRunning={isRunning}
      />
      
      <div className="flex-1 bg-gradient-workflow relative">
        {/* Stop Button Overlay */}
        {isRunning && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="destructive"
              size="sm"
              onClick={onStopWorkflow}
              className="gap-2 shadow-lg"
            >
              <StopCircle className="h-4 w-4" />
              Stop Workflow
            </Button>
          </div>
        )}
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={(edgesToDelete) => {
            setEdges((eds) => eds.filter(edge => !edgesToDelete.find(e => e.id === edge.id)));
            toast.success('Edge deleted');
          }}
          nodeTypes={{ ...nodeTypes, ...customNodeTypes }}
          fitView
          attributionPosition="bottom-left"
          className="workflow-canvas"
          deleteKeyCode={['Delete', 'Backspace']}
          defaultEdgeOptions={{
            type: 'straight',
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
          }}
        >
          <Background 
            color="hsl(var(--muted-foreground) / 0.2)" 
            gap={24} 
            size={1}
          />
          <Controls className="workflow-controls" />
          <MiniMap 
            className="workflow-minimap" 
            pannable 
            zoomable
            nodeColor={(node) => {
              switch (node.type) {
                case 'start': return 'hsl(var(--primary))';
                case 'end': return 'hsl(var(--destructive))';
                case 'dataSource': return 'hsl(var(--workflow-erp))';
                case 'process': return 'hsl(var(--workflow-process))';
                case 'ai': return 'hsl(var(--workflow-ai))';
                case 'filter': return 'hsl(var(--workflow-filter))';
                case 'visualization': return 'hsl(var(--workflow-analyze))';
                case 'conditional': return 'hsl(var(--primary))';
                case 'switch': return 'hsl(var(--secondary))';
                default: return 'hsl(var(--primary))';
              }
            }}
          />
        </ReactFlow>
      </div>
      
      {/* Configuration Modal */}
      {selectedNode && (
        isCustomNode ? (
          <CustomNodeConfigModal
            isOpen={configModalOpen}
            onClose={() => {
              setConfigModalOpen(false);
              setSelectedNode(null);
              setIsCustomNode(false);
            }}
            onSave={handleNodeConfigSave}
            nodeData={selectedNode.data as WorkflowNodeData & { customConfig?: any }}
            nodeType={selectedNode.type}
          />
        ) : (
          <NodeConfigModal
            isOpen={configModalOpen}
            onClose={() => {
              setConfigModalOpen(false);
              setSelectedNode(null);
              setIsCustomNode(false);
            }}
            onSave={handleNodeConfigSave}
            nodeData={selectedNode.data as WorkflowNodeData}
            nodeType={selectedNode.type}
          />
        )
      )}

      {/* JSON Workflow Builder Modal */}
      <JsonWorkflowBuilder
        isOpen={jsonBuilderOpen}
        onClose={() => setJsonBuilderOpen(false)}
        onApplyConfig={handleJsonWorkflowConfig}
      />
    </div>
  );
};

export default WorkflowBuilder;
