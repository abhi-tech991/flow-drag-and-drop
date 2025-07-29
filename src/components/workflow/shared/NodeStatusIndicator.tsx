import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeStatusIndicatorProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  className?: string;
}

export const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = ({
  status,
  progress,
  message,
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: Loader2,
          color: 'text-workflow-process',
          bgColor: 'bg-workflow-process/10',
          iconClassName: 'animate-spin'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          iconClassName: ''
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          iconClassName: ''
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          iconClassName: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("p-1 rounded-full", config.bgColor)}>
        <Icon className={cn("h-3 w-3", config.color, config.iconClassName)} />
      </div>
      
      {message && (
        <span className="text-xs text-muted-foreground">{message}</span>
      )}
      
      {status === 'processing' && typeof progress === 'number' && (
        <div className="flex-1 max-w-[100px]">
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </div>
  );
};