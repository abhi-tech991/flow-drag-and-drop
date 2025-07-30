import { LucideIcon } from 'lucide-react';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  source?: string;
  icon?: string;
  status?: 'idle' | 'processing' | 'completed' | 'error';
  config?: Record<string, any>;
  onConfigure?: () => void;
  progress?: number;
  errorMessage?: string;
}

export interface WorkflowNodeType {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
  category: 'source' | 'transform' | 'ai' | 'filter' | 'output';
}

export interface ConnectionValidation {
  sourceType: string;
  targetType: string;
  isValid: boolean;
  message?: string;
}