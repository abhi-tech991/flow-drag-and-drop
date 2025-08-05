import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeCard } from '../shared/NodeCard';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { Split, Settings, Trash2 } from 'lucide-react';
import { WorkflowNodeData } from '@/types/workflow';
import { Progress } from '@/components/ui/progress';

interface SwitchNodeProps {
  id: string;
  data: WorkflowNodeData & {
    onConfigure?: () => void;
    onDelete?: () => void;
    subnodes?: Array<{
      id: string;
      case: string;
      label: string;
    }>;
  };
}

const SwitchNode: React.FC<SwitchNodeProps> = ({ id, data }) => {
  const hasSubnodes = data.subnodes && data.subnodes.length > 0;
  const maxOutputs = Math.max(3, data.subnodes?.length || 0);

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={<Split className="h-6 w-6 text-purple-600" />}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 bg-purple-500 border-2 border-white shadow-lg"
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

        {/* Subnodes Display */}
        {hasSubnodes && (
          <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
            <div className="font-medium mb-1">Cases:</div>
            {data.subnodes?.map((subnode, index) => (
              <div key={subnode.id} className="flex justify-between text-xs">
                <span>{subnode.case}</span>
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

      {/* Multiple outputs for different cases */}
      {Array.from({ length: maxOutputs }, (_, index) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
        const topPosition = 25 + (index * (50 / maxOutputs));
        return (
          <Handle
            key={index}
            type="source"
            position={Position.Right}
            id={`case-${index}`}
            style={{ top: `${topPosition}%` }}
            className={`w-4 h-4 ${colors[index % colors.length]} border-2 border-white shadow-lg`}
          />
        );
      })}
    </NodeCard>
  );
};

export default SwitchNode;