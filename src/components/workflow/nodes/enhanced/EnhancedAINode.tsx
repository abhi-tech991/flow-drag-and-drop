import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Brain, Sparkles, Wand2 } from 'lucide-react';
import { NodeCard } from '../../shared/NodeCard';
import { NodeHandle } from '../../shared/NodeHandle';
import { NodeStatusIndicator } from '../../shared/NodeStatusIndicator';
import { NodeActionButton } from '../../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface EnhancedAINodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const EnhancedAINode: React.FC<EnhancedAINodeProps> = ({ 
  data, 
  selected 
}) => {
  const aiColor = 'hsl(var(--workflow-ai))';

  const handleTrainModel = () => {
    console.log('Train AI model:', data);
  };

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={
        <div className="relative">
          <Brain className="h-6 w-6 text-workflow-ai" />
          <Sparkles className="h-3 w-3 text-workflow-ai absolute -top-1 -right-1 animate-pulse" />
        </div>
      }
      badge={{
        text: 'AI/ML',
        color: aiColor
      }}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={aiColor}
    >
      {/* AI Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-workflow-ai/5 to-transparent pointer-events-none rounded-lg" />
      
      <div className="relative space-y-2">
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'AI categorizing...' : undefined}
          progress={data.status === 'processing' ? 80 : undefined}
        />
        
        <div className="flex gap-1">
          <NodeActionButton
            icon={Wand2}
            label="Train"
            onClick={handleTrainModel}
            color={aiColor}
            variant="ghost"
            size="sm"
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

export default memo(EnhancedAINode);