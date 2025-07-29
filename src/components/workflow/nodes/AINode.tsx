import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

interface AINodeProps {
  data: {
    label: string;
    description?: string;
  };
}

const AINode: React.FC<AINodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[280px] p-4 shadow-lg border-2 border-workflow-ai/20 bg-card relative overflow-hidden">
      {/* AI Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-workflow-ai/5 to-transparent pointer-events-none" />
      
      <div className="relative flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-workflow-ai/10 flex items-center justify-center relative">
            <Brain className="h-6 w-6 text-workflow-ai" />
            <Sparkles className="h-3 w-3 text-workflow-ai absolute -top-1 -right-1" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-workflow-ai text-white">
              AI/ML
            </Badge>
          </div>
          
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
        className="w-3 h-3 border-2 border-workflow-ai bg-workflow-ai"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-workflow-ai bg-workflow-ai"
      />
    </Card>
  );
};

export default memo(AINode);