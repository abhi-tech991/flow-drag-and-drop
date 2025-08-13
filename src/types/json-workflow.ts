import { LucideIcon } from 'lucide-react';

// Node metadata and configuration JSON structure
export interface NodeFieldConfig {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface NodeAction {
  type: 'configure' | 'delete' | 'custom';
  label: string;
  icon?: string;
  handler?: string; // Function name or action type
  color?: string;
}

export interface NodeDefinition {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  color: string;
  category: 'source' | 'transform' | 'ai' | 'filter' | 'output' | 'control';
  configFields?: NodeFieldConfig[];
  actions?: NodeAction[];
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    width?: number;
    height?: number;
  };
}

// Workflow UI JSON structure
export interface WorkflowNodeInstance {
  id: string;
  type: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
  style?: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  style?: Record<string, any>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version?: string;
  nodes: WorkflowNodeInstance[];
  connections: WorkflowConnection[];
  metadata?: {
    created?: string;
    modified?: string;
    author?: string;
    tags?: string[];
  };
}

// Combined JSON structure for complete workflow configuration
export interface WorkflowConfig {
  nodeDefinitions: NodeDefinition[];
  workflow?: WorkflowDefinition;
}