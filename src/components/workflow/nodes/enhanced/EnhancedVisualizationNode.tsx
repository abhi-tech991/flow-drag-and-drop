import React, { memo } from 'react';
import { Position } from '@xyflow/react';
import { BarChart3, TrendingUp, Eye } from 'lucide-react';
import { NodeCard } from '../../shared/NodeCard';
import { NodeHandle } from '../../shared/NodeHandle';
import { NodeStatusIndicator } from '../../shared/NodeStatusIndicator';
import { NodeActionButton } from '../../shared/NodeActionButton';
import { WorkflowNodeData } from '@/types/workflow';

interface EnhancedVisualizationNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const EnhancedVisualizationNode: React.FC<EnhancedVisualizationNodeProps> = ({ 
  data, 
  selected 
}) => {
  const visualizationColor = 'hsl(var(--workflow-analyze))';

  const handleViewDashboard = () => {
    console.log('View dashboard:', data);
  };

  return (
    <NodeCard
      title={data.label}
      description={data.description}
      status={data.status}
      icon={
        <div className="relative">
          <BarChart3 className="h-6 w-6 text-workflow-analyze" />
          <TrendingUp className="h-3 w-3 text-workflow-analyze absolute -top-1 -right-1" />
        </div>
      }
      className={selected ? 'ring-2 ring-primary' : ''}
      glowColor={visualizationColor}
    >
      <div className="space-y-2">
        {/* Mini Chart Visualization */}
        <div className="h-8 flex items-end gap-1 opacity-70">
          <div className="w-2 bg-workflow-analyze/30 rounded-sm animate-fade-in" style={{ height: '60%', animationDelay: '0.1s' }}></div>
          <div className="w-2 bg-workflow-analyze/50 rounded-sm animate-fade-in" style={{ height: '80%', animationDelay: '0.2s' }}></div>
          <div className="w-2 bg-workflow-analyze/70 rounded-sm animate-fade-in" style={{ height: '40%', animationDelay: '0.3s' }}></div>
          <div className="w-2 bg-workflow-analyze rounded-sm animate-fade-in" style={{ height: '100%', animationDelay: '0.4s' }}></div>
          <div className="w-2 bg-workflow-analyze/60 rounded-sm animate-fade-in" style={{ height: '70%', animationDelay: '0.5s' }}></div>
        </div>
        
        <NodeStatusIndicator 
          status={data.status || 'idle'} 
          message={data.status === 'processing' ? 'Generating charts...' : undefined}
        />
        
        <NodeActionButton
          icon={Eye}
          label="View"
          onClick={handleViewDashboard}
          color={visualizationColor}
          variant="ghost"
        />
      </div>
      
      <NodeHandle
        type="target"
        position={Position.Left}
        color={visualizationColor}
      />
    </NodeCard>
  );
};

export default memo(EnhancedVisualizationNode);