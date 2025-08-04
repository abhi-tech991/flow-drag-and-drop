import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Play } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { WorkflowNodeData } from '@/types/workflow';

interface StartNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const StartNode: React.FC<StartNodeProps> = ({ data, selected }) => {
  const startColor = 'hsl(var(--primary))';

  return (
    <NodeCard
      title={data.label || 'Start'}
      description={data.description || 'Starting point of the workflow'}
      status={data.status}
      icon={<Play className="h-6 w-6 text-primary" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={startColor}
    >
      <NodeHandle
        type="source"
        position={Position.Right}
        color={startColor}
      />
    </NodeCard>
  );
};

export default memo(StartNode);