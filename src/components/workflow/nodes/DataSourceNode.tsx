import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Database, Settings, Trash2 } from 'lucide-react';
import { NodeCard } from '../shared/NodeCard';
import { NodeHandle } from '../shared/NodeHandle';
import { NodeStatusIndicator } from '../shared/NodeStatusIndicator';
import { NodeActionButton } from '../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface DataSourceNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const DataSourceNode: React.FC<DataSourceNodeProps> = ({ 
  data, 
  selected 
}) => {
  const dataSourceColor = 'hsl(var(--workflow-erp))';

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
      icon={<Database className="h-6 w-6 text-workflow-erp" />}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={dataSourceColor}
    >
      <div className="space-y-2">
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Fetching data...' : undefined}
          progress={data.status === 'processing' ? 30 : undefined}
        />
        
        <div className="flex gap-2">
          <NodeActionButton
            icon={Settings}
            label="Configure"
            onClick={handleConfigure}
            color={dataSourceColor}
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
        color={dataSourceColor}
      />
      <NodeHandle
        type="source"
        position={Position.Right}
        color={dataSourceColor}
      />
    </NodeCard>
  );
};

export default memo(DataSourceNode);