import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NodeDefinition } from '@/types/json-workflow';
import * as LucideIcons from 'lucide-react';

interface JsonNodeRendererProps {
  id: string;
  data: {
    label: string;
    description?: string;
    nodeDefinition?: NodeDefinition;
    config?: Record<string, any>;
    onConfigure?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
  };
}

export const JsonNodeRenderer: React.FC<JsonNodeRendererProps> = ({ id, data }) => {
  const { label, description, nodeDefinition, config, onConfigure, onDelete } = data;

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return LucideIcons.Box;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Box;
  };

  const IconComponent = getIconComponent(nodeDefinition?.icon);
  
  const isConfigured = config && Object.keys(config).length > 0;
  const isStartOrEnd = nodeDefinition?.type === 'start' || nodeDefinition?.type === 'end';

  const getNodeColor = () => {
    if (nodeDefinition?.color) {
      return `hsl(var(--${nodeDefinition.color}))`;
    }
    return 'hsl(var(--primary))';
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfigure && !isStartOrEnd) {
      onConfigure(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !isStartOrEnd) {
      onDelete(id);
    }
  };

  return (
    <Card className="min-w-[200px] max-w-[300px] p-4 shadow-lg border-2 hover:shadow-xl transition-all duration-200"
          style={{ 
            borderColor: isConfigured ? getNodeColor() : 'hsl(var(--border))',
            backgroundColor: 'hsl(var(--card))'
          }}>
      
      {/* Input Handle */}
      {!isStartOrEnd || nodeDefinition?.type === 'end' ? (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2"
          style={{ backgroundColor: getNodeColor(), borderColor: getNodeColor() }}
        />
      ) : null}

      {/* Node Content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{
              backgroundColor: `${getNodeColor()}20`,
              color: getNodeColor(),
            }}
          >
            <IconComponent className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">
              {label}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={isConfigured ? "default" : "secondary"}
            className="text-xs"
          >
            {isStartOrEnd ? 'Ready' : isConfigured ? 'Configured' : 'Needs Config'}
          </Badge>
          
          {nodeDefinition?.category && (
            <Badge variant="outline" className="text-xs capitalize">
              {nodeDefinition.category}
            </Badge>
          )}
        </div>

        {/* Configuration Summary */}
        {isConfigured && config && (
          <div className="text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-1">
              {Object.entries(config).slice(0, 2).map(([key, value]) => (
                <span key={key} className="bg-muted px-2 py-1 rounded">
                  {key}: {String(value).slice(0, 15)}...
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isStartOrEnd && (
          <div className="flex gap-2">
            {nodeDefinition?.actions?.map((action, index) => {
              const ActionIcon = getIconComponent(action.icon);
              
              if (action.type === 'configure') {
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={handleConfigure}
                    className="flex-1 text-xs"
                  >
                    <ActionIcon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Button>
                );
              }
              
              if (action.type === 'delete') {
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="flex-1 text-xs text-destructive hover:text-destructive"
                  >
                    <ActionIcon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Button>
                );
              }
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle custom actions
                    console.log(`Custom action: ${action.handler}`);
                  }}
                  className="flex-1 text-xs"
                >
                  <ActionIcon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Output Handle */}
      {!isStartOrEnd || nodeDefinition?.type === 'start' ? (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2"
          style={{ backgroundColor: getNodeColor(), borderColor: getNodeColor() }}
        />
      ) : null}
    </Card>
  );
};