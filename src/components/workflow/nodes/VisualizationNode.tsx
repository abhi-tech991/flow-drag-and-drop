import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { BarChart3, Eye } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface VisualizationNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const VisualizationNode: React.FC<VisualizationNodeProps> = ({ 
  data, 
  selected 
}) => {
  const vizColor = 'hsl(var(--workflow-analyze))';

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
      icon={<BarChart3 className="h-6 w-6 text-workflow-analyze" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={vizColor}
    >
      <div className="space-y-2">
        {/* Mini Chart */}
        <div className="flex items-end space-x-1 h-8 mt-2">
          {[3, 7, 4, 8, 5, 6, 7].map((height, index) => (
            <div
              key={index}
              className="bg-workflow-analyze rounded-sm animate-pulse"
              style={{
                width: '4px',
                height: `${height * 3}px`,
                animationDelay: `${index * 100}ms`
              }}
            />
          ))}
        </div>
        
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Generating charts...' : undefined}
          progress={data.status === 'processing' ? 85 : undefined}
        />
        
        <NodeActionButton
          icon={Eye}
          label="View"
          onClick={handleConfigure}
          color={vizColor}
          variant="ghost"
        />
      </div>
      
      <NodeHandle
        type="target"
        position={Position.Left}
        color={vizColor}
      />
    </NodeCard>
  );
};

export default memo(VisualizationNode);