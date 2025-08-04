import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Zap, 
  Brain, 
  Filter, 
  BarChart3, 
  Trash2,
  Plus,
  Play,
  Save,
  Download
} from 'lucide-react';
import { WorkflowNodeType } from '@/types/workflow';

interface WorkflowToolbarProps {
  onAddNode: (nodeType: string) => void;
  onClearWorkflow: () => void;
  onRunWorkflow: () => void;
  onSaveWorkflow: () => void;
  onExportWorkflow: () => void;
  isRunning: boolean;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onAddNode,
  onClearWorkflow,
  onRunWorkflow,
  onSaveWorkflow,
  onExportWorkflow,
  isRunning
}) => {
  const nodeTypes: WorkflowNodeType[] = [
    {
      type: 'dataSource',
      label: 'Data Source',
      icon: Database,
      description: 'Connect to ERP, Shopify, CSV, or other data sources',
      color: 'workflow-erp',
      category: 'source',
    },
    {
      type: 'process',
      label: 'Process',
      icon: Zap,
      description: 'Transform, combine, and manipulate data',
      color: 'workflow-process',
      category: 'transform',
    },
    {
      type: 'ai',
      label: 'AI/ML',
      icon: Brain,
      description: 'Apply AI algorithms and smart categorization',
      color: 'workflow-ai',
      category: 'ai',
    },
    {
      type: 'filter',
      label: 'Filter',
      icon: Filter,
      description: 'Filter, sort, and refine data sets',
      color: 'workflow-filter',
      category: 'filter',
    },
    {
      type: 'visualization',
      label: 'Visualize',
      icon: BarChart3,
      description: 'Create charts, dashboards, and analytics',
      color: 'workflow-analyze',
      category: 'output',
    },
  ];

  return (
    <Card className="m-4 p-4 shadow-lg border-border/50 animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Inventory Workflow Builder
            </h2>
            <p className="text-sm text-muted-foreground">
              Automate your end-of-month inventory reconciliation
            </p>
          </div>
          
          <Separator orientation="vertical" className="h-12" />
          
          {/* Node Creation Buttons */}
          <div className="flex items-center gap-1">
            {nodeTypes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <div key={nodeType.type} className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddNode(nodeType.type)}
                    className="group relative transition-all duration-200 hover:scale-105"
                    style={{
                      borderColor: `hsl(var(--${nodeType.color}))`,
                      color: `hsl(var(--${nodeType.color}))`,
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <Plus className="h-3 w-3" />
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 animate-scale-in">
                      <div className="font-medium">{nodeType.label}</div>
                      <div className="text-muted-foreground mt-1">
                        {nodeType.description}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                    </div>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onRunWorkflow}
            disabled={isRunning}
            className="gap-2 bg-gradient-primary hover:opacity-90"
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? 'Running...' : 'Run Workflow'}
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveWorkflow}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportWorkflow}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
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