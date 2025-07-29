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

  const onAddNode = useCallback((nodeType: string) => {
    const nodeTypeMap = {
      dataSource: 'enhancedDataSource',
      process: 'enhancedProcess',
      ai: 'enhancedAI',
      filter: 'enhancedFilter',
      visualization: 'enhancedVisualization',
    };

    const mappedType = nodeTypeMap[nodeType as keyof typeof nodeTypeMap] || nodeType;

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: mappedType,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: getNodeLabel(nodeType),
        description: getNodeDescription(nodeType),
        status: 'idle',
      },
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success(`Added ${getNodeLabel(nodeType)} node`);
  }, [setNodes]);

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
    setIsRunning(true);
    toast.success('Starting workflow execution...');

    // Simulate workflow execution
    const nodeIds = nodes.map(n => n.id);
    
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      
      // Set node to processing
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, status: 'processing' } }
            : node
        )
      );

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set node to completed
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, status: 'completed' } }
            : node
        )
      );

      if (i < nodeIds.length - 1) {
        toast.info(`Completed step ${i + 1} of ${nodeIds.length}`);
      }
    }

    setIsRunning(false);
    toast.success('Workflow completed successfully!');
  }, [nodes, setNodes]);

  const onClearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    toast.success('Workflow cleared');
  }, [setNodes, setEdges]);

  const onSaveWorkflow = useCallback(() => {
    const workflow = { nodes, edges };
    localStorage.setItem('workflow', JSON.stringify(workflow));
    toast.success('Workflow saved locally');
  }, [nodes, edges]);

  const onExportWorkflow = useCallback(() => {
    const workflow = { nodes, edges };
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'inventory-workflow.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Workflow exported');
  }, [nodes, edges]);

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
    </div>
  );
};

export default EnhancedWorkflowBuilder;