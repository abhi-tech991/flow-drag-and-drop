import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Flag } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { WorkflowNodeData } from '@/types/workflow';

interface EndNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const EndNode: React.FC<EndNodeProps> = ({ data, selected }) => {
  const endColor = 'hsl(var(--destructive))';

  return (
    <NodeCard
      title={data.label || 'End'}
      description={data.description || 'End point of the workflow'}
      status={data.status}
      icon={<Flag className="h-6 w-6 text-destructive" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={endColor}
    >
      <NodeHandle
        type="target"
        position={Position.Left}
        color={endColor}
      />
    </NodeCard>
  );
};

export default memo(EndNode);