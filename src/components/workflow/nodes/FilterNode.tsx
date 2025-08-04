import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Filter, Sliders } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface FilterNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const FilterNode: React.FC<FilterNodeProps> = ({ 
  data, 
  selected 
}) => {
  const filterColor = 'hsl(var(--workflow-filter))';

  const handleConfigureFilters = () => {
    if (data.onConfigure) {
      data.onConfigure();
    }
  };

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={<Filter className="h-6 w-6 text-workflow-filter" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={filterColor}
    >
      <div className="space-y-2">
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Filtering data...' : undefined}
          progress={data.status === 'processing' ? 45 : undefined}
        />
        
        <NodeActionButton
          icon={Sliders}
          label="Filters"
          onClick={handleConfigureFilters}
          color={filterColor}
          variant="ghost"
        />
      </div>
      
      <NodeHandle
        type="target"
        position={Position.Left}
        color={filterColor}
      />
      <NodeHandle
        type="source"
        position={Position.Right}
        color={filterColor}
      />
    </NodeCard>
  );
};

export default memo(FilterNode);