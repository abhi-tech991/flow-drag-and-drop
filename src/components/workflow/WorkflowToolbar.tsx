import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Database, 
  Zap, 
  Brain, 
  Filter, 
  BarChart3, 
  Trash2,
  Plus
} from 'lucide-react';

interface WorkflowToolbarProps {
  onAddNode: (nodeType: string) => void;
  onClearWorkflow: () => void;
  selectedNodeType: string | null;
  setSelectedNodeType: (type: string | null) => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onAddNode,
  onClearWorkflow,
  selectedNodeType,
  setSelectedNodeType,
}) => {
  const nodeTypes = [
    {
      type: 'dataSource',
      label: 'Data Source',
      icon: Database,
      description: 'Connect to ERP, Shopify, or other data sources',
      color: 'workflow-erp',
    },
    {
      type: 'process',
      label: 'Process',
      icon: Zap,
      description: 'Transform and combine data',
      color: 'workflow-process',
    },
    {
      type: 'ai',
      label: 'AI/ML',
      icon: Brain,
      description: 'Apply AI algorithms and categorization',
      color: 'workflow-ai',
    },
    {
      type: 'filter',
      label: 'Filter',
      icon: Filter,
      description: 'Filter and refine data sets',
      color: 'workflow-filter',
    },
    {
      type: 'visualization',
      label: 'Visualize',
      icon: BarChart3,
      description: 'Create charts and analytics',
      color: 'workflow-analyze',
    },
  ];

  return (
    <Card className="m-4 p-4 shadow-lg border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Workflow Builder</h2>
          <div className="h-6 w-px bg-border mx-2" />
          <span className="text-sm text-muted-foreground">Drag and drop to create your inventory workflow</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddNode(nodeType.type)}
                  className="group relative"
                  style={{
                    borderColor: `hsl(var(--${nodeType.color}))`,
                    color: `hsl(var(--${nodeType.color}))`,
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">{nodeType.label}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="font-medium">{nodeType.label}</div>
                    <div className="text-muted-foreground">{nodeType.description}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearWorkflow}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};