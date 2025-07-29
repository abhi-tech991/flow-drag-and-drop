import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface ProcessNodeProps {
  data: {
    label: string;
    description?: string;
  };
}

const ProcessNode: React.FC<ProcessNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[280px] p-4 shadow-lg border-2 border-workflow-process/20 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-workflow-process/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-workflow-process" />
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
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-workflow-process bg-workflow-process"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-workflow-process bg-workflow-process"
      />
    </Card>
  );
};

export default memo(ProcessNode);