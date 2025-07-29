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
import DataSourceNode from './nodes/DataSourceNode';
import ProcessNode from './nodes/ProcessNode';
import AINode from './nodes/AINode';
import FilterNode from './nodes/FilterNode';
import VisualizationNode from './nodes/VisualizationNode';
import { WorkflowToolbar } from './WorkflowToolbar';
import { toast } from 'sonner';

const nodeTypes = {
  dataSource: DataSourceNode,
  process: ProcessNode,
  ai: AINode,
  filter: FilterNode,
  visualization: VisualizationNode,
};

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      toast.success('Connected workflow steps');
    },
    [setEdges],
  );

  const onAddNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        label: getNodeLabel(nodeType),
        description: getNodeDescription(nodeType),
      },
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success(`Added ${getNodeLabel(nodeType)} node`);
  }, [setNodes]);

  const getNodeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      dataSource: 'Data Source',
      process: 'Process Data',
      ai: 'AI Processing',
      filter: 'Filter',
      visualization: 'Visualization',
    };
    return labels[type] || type;
  };

  const getNodeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      dataSource: 'Pull data from external source',
      process: 'Transform and process data',
      ai: 'Apply AI/ML algorithms',
      filter: 'Filter and refine data',
      visualization: 'Display results and charts',
    };
    return descriptions[type] || '';
  };

  const onClearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    toast.success('Workflow cleared');
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <WorkflowToolbar 
        onAddNode={onAddNode}
        onClearWorkflow={onClearWorkflow}
        selectedNodeType={selectedNodeType}
        setSelectedNodeType={setSelectedNodeType}
      />
      
      <div className="flex-1 bg-gradient-workflow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="workflow-canvas"
        >
          <Background color="#e2e8f0" gap={20} size={1} />
          <Controls className="react-flow-controls" />
          <MiniMap 
            className="react-flow-minimap" 
            pannable 
            zoomable
            nodeColor={(node) => {
              switch (node.type) {
                case 'dataSource': return 'hsl(var(--workflow-erp))';
                case 'process': return 'hsl(var(--workflow-process))';
                case 'ai': return 'hsl(var(--workflow-ai))';
                case 'filter': return 'hsl(var(--workflow-filter))';
                case 'visualization': return 'hsl(var(--workflow-analyze))';
                default: return 'hsl(var(--primary))';
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;