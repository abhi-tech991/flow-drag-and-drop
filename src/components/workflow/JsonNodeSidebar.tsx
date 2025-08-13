import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Menu,
  X,
  Plus,
  Search,
  Upload,
  Download
} from 'lucide-react';
import { NodeDefinition } from '@/types/json-workflow';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';

interface JsonNodeSidebarProps {
  nodeDefinitions: NodeDefinition[];
  onAddNode: (nodeDefinition: NodeDefinition) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLoadNodeDefinitions: (definitions: NodeDefinition[]) => void;
  onLoadWorkflow: (workflowJson: string) => void;
}

export const JsonNodeSidebar: React.FC<JsonNodeSidebarProps> = ({
  nodeDefinitions,
  onAddNode,
  isOpen,
  onToggle,
  onLoadNodeDefinitions,
  onLoadWorkflow
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [inputType, setInputType] = useState<'nodes' | 'workflow'>('nodes');

  const categories = [
    { id: 'all', label: 'All Nodes' },
    { id: 'source', label: 'Data Sources' },
    { id: 'transform', label: 'Transforms' },
    { id: 'ai', label: 'AI/ML' },
    { id: 'filter', label: 'Filters' },
    { id: 'output', label: 'Outputs' },
    { id: 'control', label: 'Control Flow' },
  ];

  const filteredNodes = nodeDefinitions.filter(node => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Box;
  };

  const handleLoadJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (inputType === 'nodes') {
        if (parsed.nodeDefinitions && Array.isArray(parsed.nodeDefinitions)) {
          onLoadNodeDefinitions(parsed.nodeDefinitions);
          toast.success(`Loaded ${parsed.nodeDefinitions.length} node definitions`);
        } else {
          toast.error('Invalid node definitions JSON format');
        }
      } else {
        onLoadWorkflow(jsonInput);
        toast.success('Loaded workflow configuration');
      }
      
      setJsonInput('');
      setShowJsonInput(false);
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const exportNodeDefinitions = () => {
    const data = { nodeDefinitions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'node-definitions.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Node definitions exported');
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 shadow-lg"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-96 bg-background border-r border-border transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 pt-16 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            JSON-Based Workflow Nodes
          </h2>
          
          {/* JSON Input/Export Controls */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              <Button
                variant={showJsonInput ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJsonInput(!showJsonInput)}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Load JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportNodeDefinitions}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {showJsonInput && (
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex gap-2">
                  <Button
                    variant={inputType === 'nodes' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputType('nodes')}
                  >
                    Node Definitions
                  </Button>
                  <Button
                    variant={inputType === 'workflow' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputType('workflow')}
                  >
                    Workflow
                  </Button>
                </div>
                
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={inputType === 'nodes' 
                    ? 'Paste node definitions JSON...' 
                    : 'Paste workflow JSON...'
                  }
                  rows={6}
                />
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleLoadJson}>
                    Load
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowJsonInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nodes..."
              className="pl-10"
            />
          </div>
          
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

          {/* Node List */}
          <div className="space-y-3">
            {filteredNodes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No nodes found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            ) : (
              filteredNodes.map((nodeDefinition) => {
                const IconComponent = getIconComponent(nodeDefinition.icon);
                return (
                  <Card key={nodeDefinition.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: `hsl(var(--${nodeDefinition.color}) / 0.1)`,
                            color: `hsl(var(--${nodeDefinition.color}))`,
                          }}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{nodeDefinition.label}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {nodeDefinition.description}
                          </p>
                          {nodeDefinition.configFields && (
                            <p className="text-xs text-primary mt-1">
                              {nodeDefinition.configFields.length} config fields
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
      onClick={() => onAddNode(nodeDefinition)}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', nodeDefinition.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      draggable
      className="hover:scale-105 transition-transform cursor-grab active:cursor-grabbing"
    >
      <Plus className="h-3 w-3" />
    </Button>
                    </div>
                  </Card>
                );
              })
            )}
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