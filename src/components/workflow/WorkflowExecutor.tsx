import React, { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import { toast } from 'sonner';

interface WorkflowExecutorProps {
  nodes: Node[];
  edges: Edge[];
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  onExecutionComplete: () => void;
  onExecutionError: (error: string) => void;
}

export const useWorkflowExecutor = ({
  nodes,
  edges,
  onNodeUpdate,
  onExecutionComplete,
  onExecutionError
}: WorkflowExecutorProps) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];

    // Check if workflow has start and end nodes
    const startNode = nodes.find(node => node.type === 'start');
    const endNode = nodes.find(node => node.type === 'end');

    if (!startNode) errors.push('Workflow must have a start node');
    if (!endNode) errors.push('Workflow must have an end node');

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node => 
      node.type !== 'start' && node.type !== 'end' && !connectedNodeIds.has(node.id)
    );

    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length} disconnected node(s) found`);
    }

    // Check node configurations
    const unconfiguredNodes = nodes.filter(node => {
      const data = node.data as WorkflowNodeData;
      return node.type !== 'start' && node.type !== 'end' && 
             (!data.config || Object.keys(data.config).length === 0);
    });

    if (unconfiguredNodes.length > 0) {
      errors.push(`${unconfiguredNodes.length} node(s) need configuration`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [nodes, edges]);

  const executeNode = useCallback(async (node: Node) => {
    const data = node.data as WorkflowNodeData;

    // Update node status to processing
    onNodeUpdate(node.id, { status: 'processing', progress: 0 });

    try {
      // Simulate node execution with progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        onNodeUpdate(node.id, { progress });
      }

      // Simulate different execution times based on node type
      const executionTime = getExecutionTime(node.type!);
      await new Promise(resolve => setTimeout(resolve, executionTime));

      // Mark node as completed
      onNodeUpdate(node.id, { 
        status: 'completed', 
        progress: 100,
        errorMessage: undefined 
      });

      toast.success(`${data.label} completed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onNodeUpdate(node.id, { 
        status: 'error', 
        errorMessage 
      });
      throw error;
    }
  }, [onNodeUpdate]);

  const getExecutionTime = (nodeType: string): number => {
    const times: Record<string, number> = {
      'dataSource': 2000,
      'process': 3000,
      'ai': 5000,
      'filter': 1500,
      'visualization': 2500,
      'conditional': 1000,
      'switch': 1000
    };
    return times[nodeType] || 2000;
  };

  const getExecutionOrder = useCallback(() => {
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) return [];

    const executionOrder: Node[] = [];
    const visited = new Set<string>();
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (node && node.type !== 'start') {
        executionOrder.push(node);
      }

      // Find connected nodes
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      outgoingEdges.forEach(edge => traverse(edge.target));
    };

    traverse(startNode.id);
    return executionOrder;
  }, [nodes, edges]);

  const executeWorkflow = useCallback(async () => {
    const validation = validateWorkflow();
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      onExecutionError(validation.errors.join(', '));
      return;
    }

    setIsExecuting(true);
    setCurrentNodeIndex(0);

    try {
      const executionOrder = getExecutionOrder();
      
      for (let i = 0; i < executionOrder.length; i++) {
        const node = executionOrder[i];
        setCurrentNodeIndex(i);
        
        // Skip end node
        if (node.type === 'end') continue;
        
        await executeNode(node);
      }

      toast.success('Workflow executed successfully!');
      onExecutionComplete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Workflow execution failed';
      toast.error(errorMessage);
      onExecutionError(errorMessage);
    } finally {
      setIsExecuting(false);
      setCurrentNodeIndex(0);
    }
  }, [validateWorkflow, getExecutionOrder, executeNode, onExecutionComplete, onExecutionError]);

  const stopWorkflow = useCallback(() => {
    setIsExecuting(false);
    setCurrentNodeIndex(0);
    
    // Reset all node statuses
    nodes.forEach(node => {
      if (node.data.status === 'processing') {
        onNodeUpdate(node.id, { 
          status: 'idle', 
          progress: 0,
          errorMessage: undefined 
        });
      }
    });

    toast.info('Workflow execution stopped');
  }, [nodes, onNodeUpdate]);

  return {
    executeWorkflow,
    stopWorkflow,
    isExecuting,
    currentNodeIndex,
    validateWorkflow
  };
};