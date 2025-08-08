import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Zap, 
  Brain, 
  Filter, 
  BarChart3, 
  Menu,
  X,
  Plus,
  GitBranch,
  Split,
  Code,
  Save,
  FolderOpen
} from 'lucide-react';
import { WorkflowNodeType } from '@/types/workflow';

interface WorkflowSidebarProps {
  onAddNode: (nodeType: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenJsonBuilder?: () => void;
  onSaveWorkflow?: () => void;
  onLoadWorkflow?: () => void;
}

export const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
  onAddNode,
  isOpen,
  onToggle,
  onOpenJsonBuilder,
  onSaveWorkflow,
  onLoadWorkflow
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    {
      type: 'conditional',
      label: 'Conditional',
      icon: GitBranch,
      description: 'Add if-else conditions and branching logic',
      color: 'primary',
      category: 'control',
    },
    {
      type: 'switch',
      label: 'Switch',
      icon: Split,
      description: 'Multi-branch switch conditions',
      color: 'secondary',
      category: 'control',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Nodes' },
    { id: 'source', label: 'Data Sources' },
    { id: 'transform', label: 'Transforms' },
    { id: 'ai', label: 'AI/ML' },
    { id: 'filter', label: 'Filters' },
    { id: 'output', label: 'Outputs' },
    { id: 'control', label: 'Control Flow' },
  ];

  const filteredNodes = selectedCategory === 'all' 
    ? nodeTypes 
    : nodeTypes.filter(node => node.category === selectedCategory);

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 shadow-lg"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r border-border transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 pt-16">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Workflow Nodes
          </h2>
          
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Workflow Actions */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-foreground">Workflow Actions</h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenJsonBuilder}
              className="w-full justify-start gap-2"
            >
              <Code className="h-4 w-4" />
              JSON Configuration
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveWorkflow}
                className="flex-1 justify-start gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadWorkflow}
                className="flex-1 justify-start gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Load
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Node List */}
          <div className="space-y-3">
            {filteredNodes.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Card key={nodeType.type} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: `hsl(var(--${nodeType.color}) / 0.1)`,
                          color: `hsl(var(--${nodeType.color}))`,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{nodeType.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {nodeType.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddNode(nodeType.type)}
                      className="hover:scale-105 transition-transform"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};