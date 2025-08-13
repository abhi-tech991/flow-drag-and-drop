import React, { useCallback, useState, useEffect } from 'react';
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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeDefinition, WorkflowDefinition } from '@/types/json-workflow';
import { JsonNodeRenderer } from './JsonNodeRenderer';
import { JsonNodeConfigModal } from './JsonNodeConfigModal';
import { toast } from 'sonner';

interface JsonWorkflowCanvasProps {
  nodeDefinitions: NodeDefinition[];
  onAddNodeToCanvas: (nodeDefinition: NodeDefinition) => void;
  workflow?: WorkflowDefinition;
  onWorkflowChange?: (workflow: WorkflowDefinition) => void;
}

export const JsonWorkflowCanvas: React.FC<JsonWorkflowCanvasProps> = ({
  nodeDefinitions,
  onAddNodeToCanvas,
  workflow,
  onWorkflowChange
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Initialize with start and end nodes
  useEffect(() => {
    if (workflow) {
      // Load workflow from JSON
      const workflowNodes = workflow.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          nodeDefinition: nodeDefinitions.find(def => def.type === node.type),
          onConfigure: (nodeId: string) => openNodeConfiguration(nodeId),
          onDelete: (nodeId: string) => deleteNode(nodeId),
        }
      }));
      
      const workflowEdges = workflow.connections.map(conn => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
        type: conn.type || 'smoothstep',
        style: {
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
          ...conn.style
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: 'hsl(var(--primary))',
        },
      }));

      setNodes(workflowNodes);
      setEdges(workflowEdges);
    } else {
      // Initialize with basic start and end nodes
      const initialNodes: Node[] = [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 50, y: 200 },
          data: {
            label: 'Start',
            nodeDefinition: { 
              id: 'start',
              type: 'start', 
              label: 'Start', 
              icon: 'Play',
              description: 'Workflow start point',
              color: 'primary',
              category: 'control'
            } as NodeDefinition,
          },
          draggable: true,
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 200 },
          data: {
            label: 'End',
            nodeDefinition: { 
              id: 'end',
              type: 'end', 
              label: 'End', 
              icon: 'Square',
              description: 'Workflow end point',
              color: 'primary',
              category: 'control'
            } as NodeDefinition,
          },
          draggable: true,
        },
      ];
      setNodes(initialNodes);
      setEdges([]);
    }
  }, [workflow, nodeDefinitions]);

  const openNodeConfiguration = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.type !== 'start' && node.type !== 'end' && node.data.nodeDefinition) {
      setSelectedNode(node);
      setConfigModalOpen(true);
    } else {
      toast.info('Start and End nodes do not require configuration');
    }
  }, [nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    
    if (nodeToDelete?.type === 'start' || nodeToDelete?.type === 'end') {
      toast.error('Cannot delete start or end nodes');
      return;
    }

    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    toast.success('Node deleted');
  }, [nodes, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: 'smoothstep',
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: 'hsl(var(--primary))',
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Connected workflow steps');
    },
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.currentTarget as Element).getBoundingClientRect();
      const nodeDefinitionId = event.dataTransfer.getData('application/json');
      
      if (!nodeDefinitionId) return;

      const nodeDefinition = nodeDefinitions.find(def => def.id === nodeDefinitionId);
      if (!nodeDefinition) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const nodeId = `${nodeDefinition.type}-${Date.now()}`;
      const newNode: Node = {
        id: nodeId,
        type: nodeDefinition.type,
        position,
        data: {
          label: nodeDefinition.label,
          description: nodeDefinition.description,
          nodeDefinition,
          config: {},
          onConfigure: () => openNodeConfiguration(nodeId),
          onDelete: () => deleteNode(nodeId),
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`Added ${nodeDefinition.label} node`);
    },
    [nodeDefinitions, setNodes, openNodeConfiguration, deleteNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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

    setConfigModalOpen(false);
    setSelectedNode(null);
    toast.success('Configuration saved successfully');
  }, [selectedNode, setNodes]);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setEdges((eds) => eds.filter(e => e.id !== edge.id));
    toast.success('Connection deleted');
  }, [setEdges]);

  // Update parent component when workflow changes
  useEffect(() => {
    if (onWorkflowChange && nodes.length > 0) {
      const workflowData: WorkflowDefinition = {
        id: workflow?.id || `workflow-${Date.now()}`,
        name: workflow?.name || 'Untitled Workflow',
        description: workflow?.description,
        version: workflow?.version || '1.0.0',
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type!,
          position: node.position,
          data: {
            label: node.data.label,
            description: node.data.description,
            config: node.data.config,
          }
        })),
        connections: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
        })),
        metadata: {
          ...workflow?.metadata,
          modified: new Date().toISOString(),
        }
      };
      onWorkflowChange(workflowData);
    }
  }, [nodes, edges, onWorkflowChange, workflow]);

  const nodeTypes = {
    start: JsonNodeRenderer,
    end: JsonNodeRenderer,
    dataSource: JsonNodeRenderer,
    process: JsonNodeRenderer,
    ai: JsonNodeRenderer,
    filter: JsonNodeRenderer,
    visualization: JsonNodeRenderer,
    conditional: JsonNodeRenderer,
    switch: JsonNodeRenderer,
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="top-right"
      >
        <MiniMap zoomable pannable />
        <Controls />
        <Background gap={16} />
      </ReactFlow>

      {selectedNode && selectedNode.data.nodeDefinition && selectedNode.data.nodeDefinition.id && (
        <JsonNodeConfigModal
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setSelectedNode(null);
          }}
          onSave={handleNodeConfigSave}
          nodeDefinition={selectedNode.data.nodeDefinition}
          initialConfig={selectedNode.data.config || {}}
        />
      )}
    </div>
  );
};