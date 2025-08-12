import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Brain, Sparkles, Trash2 } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { Badge } from '@/components/ui/badge';
import { WorkflowNodeData } from '@/types/workflow';

interface AINodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const AINode: React.FC<AINodeProps> = ({ 
  data, 
  selected 
}) => {
  const aiColor = 'hsl(var(--workflow-ai))';

  const handleTrainModel = () => {
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
      icon={<Brain className="h-6 w-6 text-workflow-ai" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={aiColor}
      badge={{
        text: 'AI',
        variant: 'secondary',
        color: aiColor
      }}
    >
      <div className="space-y-2">
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Training model...' : undefined}
          progress={data.status === 'processing' ? 75 : undefined}
        />
        
        <div className="flex gap-2">
          <NodeActionButton
            icon={Sparkles}
            label="Train"
            onClick={handleTrainModel}
            color={aiColor}
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
        color={aiColor}
      />
      <NodeHandle
        type="source"
        position={Position.Right}
        color={aiColor}
      />
    </NodeCard>
  );
};

export default memo(AINode);