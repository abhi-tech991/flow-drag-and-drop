import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeCard } from '../shared/NodeCard';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { GitBranch, Settings, Trash2 } from 'lucide-react';
import { WorkflowNodeData } from '@/types/workflow';
import { Progress } from '@/components/ui/progress';

interface ConditionalNodeProps {
  id: string;
  data: WorkflowNodeData & {
    onConfigure?: () => void;
    onDelete?: () => void;
    subnodes?: Array<{
      id: string;
      condition: string;
      label: string;
    }>;
  };
}

const ConditionalNode: React.FC<ConditionalNodeProps> = ({ id, data }) => {
  const hasSubnodes = data.subnodes && data.subnodes.length > 0;

  return (
    <NodeCard>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10">
            <GitBranch className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-sm">{data.label}</span>
        </div>
        <NodeStatusIndicator status={data.status} />
      </div>

      {data.description && (
        <p className="text-xs text-muted-foreground mb-3">
          {data.description}
        </p>
      )}

      {/* Progress Bar */}
      {data.status === 'processing' && data.progress !== undefined && (
        <div className="mb-3">
          <Progress value={data.progress} className="h-1" />
          <span className="text-xs text-muted-foreground">{data.progress}%</span>
        </div>
      )}

      {/* Subnodes Display */}
      {hasSubnodes && (
        <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
          <div className="font-medium mb-1">Conditions:</div>
          {data.subnodes?.map((subnode, index) => (
            <div key={subnode.id} className="flex justify-between text-xs">
              <span>{subnode.condition}</span>
              <span className="text-muted-foreground">{subnode.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Display */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
          <div className="font-medium mb-1">Configuration:</div>
          {Object.entries(data.config).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {data.status === 'error' && data.errorMessage && (
        <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          {data.errorMessage}
        </div>
      )}

      <div className="flex justify-between items-center">
        <NodeActionButton
          icon={Settings}
          onClick={data.onConfigure}
          tooltip="Configure conditional logic"
        />
        <NodeActionButton
          icon={Trash2}
          onClick={data.onDelete}
          tooltip="Delete node"
          variant="destructive"
        />
      </div>

      {/* Multiple outputs for different conditions */}
      <Handle 
        type="source" 
        position={Position.Right}
        id="true"
        style={{ top: '40%' }}
        className="w-3 h-3 bg-green-500 border-2 border-background"
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="false"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-red-500 border-2 border-background"
      />
    </NodeCard>
  );
};

export default ConditionalNode;