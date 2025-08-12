import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Zap, Settings, Trash2 } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface ProcessNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const ProcessNode: React.FC<ProcessNodeProps> = ({ 
  data, 
  selected 
}) => {
  const processColor = 'hsl(var(--workflow-process))';

  const handleConfigure = () => {
    if (data.onConfigure) {
      data.onConfigure();
    }
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete();
    }
  };

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={<Zap className="h-6 w-6 text-workflow-process" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={processColor}
    >
      <div className="space-y-2">
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Processing data...' : undefined}
          progress={data.status === 'processing' ? 65 : undefined}
        />
        
        <div className="flex gap-2">
          <NodeActionButton
            icon={Settings}
            label="Configure"
            onClick={handleConfigure}
            color={processColor}
            variant="ghost"
          />
          <NodeActionButton
            icon={Trash2}
            label="Delete"
            onClick={handleDelete}
            variant="ghost"
            className="hover:text-destructive hover:border-destructive"
          />
        </div>
      </div>
      
      <NodeHandle
        type="target"
        position={Position.Left}
        color={processColor}
      />
      <NodeHandle
        type="source"
        position={Position.Right}
        color={processColor}
      />
    </NodeCard>
  );
};

export default memo(ProcessNode);