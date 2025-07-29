import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface VisualizationNodeProps {
  data: {
    label: string;
    description?: string;
  };
}

const VisualizationNode: React.FC<VisualizationNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[280px] p-4 shadow-lg border-2 border-workflow-analyze/20 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-workflow-analyze/10 flex items-center justify-center relative">
            <BarChart3 className="h-6 w-6 text-workflow-analyze" />
            <TrendingUp className="h-3 w-3 text-workflow-analyze absolute -top-1 -right-1" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-1">
            {data.label}
          </h3>
          
          {data.description && (
            <p className="text-xs text-muted-foreground">
              {data.description}
            </p>
          )}
          
          {/* Mini chart visualization */}
          <div className="mt-2 h-8 flex items-end gap-1">
            <div className="w-2 bg-workflow-analyze/30 rounded-sm" style={{ height: '60%' }}></div>
            <div className="w-2 bg-workflow-analyze/50 rounded-sm" style={{ height: '80%' }}></div>
            <div className="w-2 bg-workflow-analyze/70 rounded-sm" style={{ height: '40%' }}></div>
            <div className="w-2 bg-workflow-analyze rounded-sm" style={{ height: '100%' }}></div>
            <div className="w-2 bg-workflow-analyze/60 rounded-sm" style={{ height: '70%' }}></div>
          </div>
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-workflow-analyze bg-workflow-analyze"
      />
    </Card>
  );
};

export default memo(VisualizationNode);