import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeCard } from './shared/NodeCard';
import { NodeStatusIndicator } from './shared/NodeStatusIndicator';
import { NodeActionButton } from './shared/NodeActionButton';
import { Settings, Trash2, Database, Zap, Brain, Filter, BarChart3 } from 'lucide-react';
import { WorkflowNodeData } from '@/types/workflow';
import { Progress } from '@/components/ui/progress';

interface CustomNodeConfig {
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'switch' | 'json';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }>;
  validation?: {
    endpoint?: string;
    required?: string[];
  };
}

interface CustomNodeProps {
  id: string;
  data: WorkflowNodeData & {
    customConfig?: CustomNodeConfig;
    customStyle?: {
      backgroundColor?: string;
      borderColor?: string;
      icon?: string;
    };
    onConfigure?: () => void;
    onDelete?: () => void;
  };
}

const CustomNodeRenderer: React.FC<CustomNodeProps> = ({ id, data }) => {
  const getIcon = () => {
    const iconName = data.customStyle?.icon || 'database';
    
    switch (iconName) {
      case 'database': return <Database className="h-6 w-6" />;
      case 'zap': return <Zap className="h-6 w-6" />;
      case 'brain': return <Brain className="h-6 w-6" />;
      case 'filter': return <Filter className="h-6 w-6" />;
      case 'chart': return <BarChart3 className="h-6 w-6" />;
      default: return <Database className="h-6 w-6" />;
    }
  };

  const iconColor = data.customStyle?.backgroundColor || 'hsl(var(--primary))';

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={<div style={{ color: iconColor }}>{getIcon()}</div>}
      customStyle={{
        borderColor: data.customStyle?.borderColor,
        backgroundColor: data.customStyle?.backgroundColor ? `${data.customStyle.backgroundColor}/0.05` : undefined,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 bg-blue-500 border-2 border-white shadow-lg"
      />
      
      <div className="mt-3">
        <NodeStatusIndicator status={data.status} progress={data.progress} />

        {/* Progress Bar */}
        {data.status === 'processing' && data.progress !== undefined && (
          <div className="mb-3">
            <Progress value={data.progress} className="h-1" />
            <span className="text-xs text-muted-foreground">{data.progress}%</span>
          </div>
        )}

        {/* Custom Configuration Display */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
            <div className="font-medium mb-1">Configuration:</div>
            {Object.entries(data.config).map(([key, value]) => (
              <div key={key} className="text-xs mb-1">
                <span className="font-medium">{key}:</span> {
                  typeof value === 'object' ? JSON.stringify(value) : String(value)
                }
              </div>
            ))}
          </div>
        )}

        {/* Custom Fields Summary */}
        {data.customConfig?.fields && (
          <div className="mb-3 p-2 bg-primary/10 rounded text-xs">
            <div className="font-medium mb-1">Custom Fields:</div>
            <div className="text-muted-foreground">
              {data.customConfig.fields.length} configuration fields available
            </div>
            {data.customConfig.validation?.endpoint && (
              <div className="text-muted-foreground mt-1">
                Backend validation: {data.customConfig.validation.endpoint}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {data.status === 'error' && data.errorMessage && (
          <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            {data.errorMessage}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <NodeActionButton
            icon={Settings}
            label="Configure"
            onClick={data.onConfigure || (() => {})}
            variant="outline"
          />
          <NodeActionButton
            icon={Trash2}
            label="Delete"
            onClick={data.onDelete || (() => {})}
            variant="outline"
            color="#ef4444"
          />
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 bg-blue-500 border-2 border-white shadow-lg"
      />
    </NodeCard>
  );
};

export default CustomNodeRenderer;