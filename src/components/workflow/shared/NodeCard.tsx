import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeCardProps {
  title: string;
  description?: string;
  status?: 'idle' | 'processing' | 'completed' | 'error';
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
  className?: string;
  children?: React.ReactNode;
  glowColor?: string;
  customStyle?: {
    borderColor?: string;
    backgroundColor?: string;
  };
}

export const NodeCard: React.FC<NodeCardProps> = ({
  title,
  description,
  status = 'idle',
  icon,
  badge,
  className,
  children,
  glowColor,
  customStyle
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'border-workflow-process shadow-lg animate-pulse-glow';
      case 'completed': return 'border-green-500 shadow-green-200';
      case 'error': return 'border-red-500 shadow-red-200';
      default: return 'border-border';
    }
  };

  const cardStyle = customStyle ? {
    borderColor: customStyle.borderColor,
    backgroundColor: customStyle.backgroundColor,
  } : {};

  return (
    <Card 
      className={cn(
        "min-w-[280px] p-4 shadow-lg border-2 bg-card transition-all duration-300 hover:shadow-xl animate-fade-in",
        getStatusColor(),
        className
      )}
      style={cardStyle}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all duration-200",
            status === 'processing' && "animate-pulse"
          )} style={{
            backgroundColor: glowColor ? `${glowColor}10` : undefined
          }}>
            {icon}
          </div>
        </div>
        
        <div className="flex-1">
          {badge && (
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={cn(
                  badge.color && "text-white",
                  "animate-scale-in"
                )}
                style={{
                  backgroundColor: badge.color,
                  borderColor: badge.color
                }}
              >
                {badge.text}
              </Badge>
            </div>
          )}
          
          <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-1">
            {title}
          </h3>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};