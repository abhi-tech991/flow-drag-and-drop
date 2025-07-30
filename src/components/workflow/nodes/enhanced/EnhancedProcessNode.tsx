import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Zap, Settings } from 'lucide-react';
import { NodeCard } from '../../shared/NodeCard';
import { NodeHandle } from '../../shared/NodeHandle';
import { NodeStatusIndicator } from '../../shared/NodeStatusIndicator';
import { NodeActionButton } from '../../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface EnhancedProcessNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const EnhancedProcessNode: React.FC<EnhancedProcessNodeProps> = ({ 
  data, 
  selected 
}) => {
  const processColor = 'hsl(var(--workflow-process))';

  const handleConfigure = () => {
    if (data.onConfigure) {
      data.onConfigure();
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
        
        <NodeActionButton
          icon={Settings}
          label="Configure"
          onClick={handleConfigure}
          color={processColor}
          variant="ghost"
        />
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

export default memo(EnhancedProcessNode);