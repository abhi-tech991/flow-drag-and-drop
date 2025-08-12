import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import { toast } from 'sonner';

export interface WorkflowState {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  status: 'draft' | 'running' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export const useWorkflowState = () => {
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createWorkflow = useCallback((name: string, description: string = '') => {
    const newWorkflow: WorkflowState = {
      id: `workflow-${Date.now()}`,
      name,
      description,
      nodes: [],
      edges: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
    
    setCurrentWorkflow(newWorkflow);
    toast.success('New workflow created');
    return newWorkflow;
  }, []);

  const updateWorkflow = useCallback((updates: Partial<WorkflowState>) => {
    setCurrentWorkflow(prev => {
      if (!prev) return null;
      
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date(),
        version: prev.version + 1,
      };
      
      return updated;
    });
  }, []);

  const saveWorkflow = useCallback(async (workflow?: WorkflowState) => {
    const workflowToSave = workflow || currentWorkflow;
    if (!workflowToSave) {
      toast.error('No workflow to save');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically send to your backend
      // await api.saveWorkflow(workflowToSave);
      
      // For now, save to localStorage as a fallback
      const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const existingIndex = savedWorkflows.findIndex((w: WorkflowState) => w.id === workflowToSave.id);
      
      if (existingIndex >= 0) {
        savedWorkflows[existingIndex] = workflowToSave;
      } else {
        savedWorkflows.push(workflowToSave);
      }
      
      localStorage.setItem('workflows', JSON.stringify(savedWorkflows));
      toast.success('Workflow saved successfully');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkflow]);

  const loadWorkflow = useCallback(async (workflowId: string) => {
    setIsLoading(true);
    try {
      // Here you would typically fetch from your backend
      // const workflow = await api.loadWorkflow(workflowId);
      
      // For now, load from localStorage
      const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const workflow = savedWorkflows.find((w: WorkflowState) => w.id === workflowId);
      
      if (workflow) {
        setCurrentWorkflow(workflow);
        toast.success('Workflow loaded successfully');
        return workflow;
      } else {
        toast.error('Workflow not found');
        return null;
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateWorkflow = useCallback((nodes: Node[], edges: Edge[]) => {
    const errors: string[] = [];
    
    // Check if workflow has start and end nodes
    const startNode = nodes.find(node => node.type === 'start');
    const endNode = nodes.find(node => node.type === 'end');
    
    if (!startNode) {
      errors.push('Workflow must have a start node');
    }
    if (!endNode) {
      errors.push('Workflow must have an end node');
    }
    
    // Check if workflow has at least 3 nodes (start, some processing, end)
    if (nodes.length < 2) {
      errors.push('Workflow must have at least start and end nodes');
    }
    
    // Check for disconnected nodes (excluding start/end nodes that can be isolated)
    if (nodes.length > 2) {
      const connectedNodeIds = new Set();
      edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      
      const disconnectedNodes = nodes.filter(node => 
        !connectedNodeIds.has(node.id) && 
        node.type !== 'start' && 
        node.type !== 'end'
      );
      
      if (disconnectedNodes.length > 0) {
        errors.push(`${disconnectedNodes.length} disconnected step(s) found`);
      }
    }
    
    // Check if start node has outgoing connections
    if (startNode && edges.filter(edge => edge.source === startNode.id).length === 0) {
      errors.push('Start node must be connected to other steps');
    }
    
    // Check if end node has incoming connections  
    if (endNode && edges.filter(edge => edge.target === endNode.id).length === 0) {
      errors.push('End node must be connected from other steps');
    }
    
    // Check for required configurations (exclude start and end nodes)
    const unconfiguredNodes = nodes.filter(node => {
      // Start and end nodes don't need configuration
      if (node.type === 'start' || node.type === 'end') {
        return false;
      }
      
      const data = node.data as WorkflowNodeData;
      
      // For custom nodes, check if they have customConfig or regular config
      if (data.customConfig && Object.keys(data.customConfig).length > 0) {
        return false;
      }
      
      // For regular nodes, check config
      return !data.config || Object.keys(data.config).length === 0;
    });
    
    if (unconfiguredNodes.length > 0) {
      errors.push(`${unconfiguredNodes.length} step(s) need configuration`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const exportWorkflow = useCallback((workflow?: WorkflowState) => {
    const workflowToExport = workflow || currentWorkflow;
    if (!workflowToExport) {
      toast.error('No workflow to export');
      return;
    }

    const dataStr = JSON.stringify(workflowToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflowToExport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Workflow exported successfully');
  }, [currentWorkflow]);

  return {
    currentWorkflow,
    isLoading,
    createWorkflow,
    updateWorkflow,
    saveWorkflow,
    loadWorkflow,
    validateWorkflow,
    exportWorkflow,
  };
};