import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { Database, FileSpreadsheet } from 'lucide-react';
import { NodeCard } from '../../shared/NodeCard';
import { NodeHandle } from '../../shared/NodeHandle';
import { NodeStatusIndicator } from '../../shared/NodeStatusIndicator';
import { WorkflowNodeData } from '@/types/workflow';

interface EnhancedDataSourceNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const EnhancedDataSourceNode: React.FC<EnhancedDataSourceNodeProps> = ({ 
  data, 
  selected 
}) => {
  const getSourceConfig = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'netsuite':
        return {
          icon: '🔷',
          color: 'hsl(var(--workflow-erp))',
          bgColor: 'hsl(var(--workflow-erp) / 0.1)',
        };
      case 'shopify':
        return {
          icon: '🛍️',
          color: 'hsl(var(--workflow-shopify))',
          bgColor: 'hsl(var(--workflow-shopify) / 0.1)',
        };
      case 'csv':
      case 'excel':
        return {
          icon: <FileSpreadsheet className="h-6 w-6" />,
          color: 'hsl(var(--workflow-process))',
          bgColor: 'hsl(var(--workflow-process) / 0.1)',
        };
      default:
        return {
          icon: <Database className="h-6 w-6" />,
          color: 'hsl(var(--workflow-erp))',
          bgColor: 'hsl(var(--workflow-erp) / 0.1)',
        };
    }
  };

  const sourceConfig = getSourceConfig(data.source || '');

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={typeof sourceConfig.icon === 'string' ? sourceConfig.icon : sourceConfig.icon}
      badge={data.source ? {
        text: data.source,
        color: sourceConfig.color
      } : undefined}
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={sourceConfig.color}
    >
      <div className="mt-2">
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Fetching data...' : undefined}
        />
      </div>
      
      <NodeHandle
        type="source"
        position={Position.Right}
        color={sourceConfig.color}
      />
    </NodeCard>
  );
};

export default memo(EnhancedDataSourceNode);