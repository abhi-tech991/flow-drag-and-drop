import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus,
  Search,
  Upload,
  Download,
  FileJson
} from 'lucide-react';
import { NodeDefinition } from '@/types/json-workflow';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';

interface JsonNodeSidebarProps {
  nodeDefinitions: NodeDefinition[];
  onAddNodeToCanvas: (nodeDefinition: NodeDefinition) => void;
  onNodeDefinitionsChange?: (nodeDefinitions: NodeDefinition[]) => void;
}

export const JsonNodeSidebar: React.FC<JsonNodeSidebarProps> = ({ 
  nodeDefinitions, 
  onAddNodeToCanvas,
  onNodeDefinitionsChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonDialog, setShowJsonDialog] = useState(false);

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

  const handleLoadNodeDefinitions = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (parsed.nodeDefinitions && Array.isArray(parsed.nodeDefinitions)) {
        if (onNodeDefinitionsChange) {
          onNodeDefinitionsChange(parsed.nodeDefinitions);
        }
        toast.success(`Loaded ${parsed.nodeDefinitions.length} node definitions`);
        setShowJsonDialog(false);
        setJsonInput('');
      } else {
        toast.error('Invalid node definitions JSON format. Expected: { "nodeDefinitions": [...] }');
      }
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleExportNodeDefinitions = () => {
    const data = { nodeDefinitions };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'node-definitions.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Node definitions exported');
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.nodeDefinitions && Array.isArray(parsed.nodeDefinitions)) {
          if (onNodeDefinitionsChange) {
            onNodeDefinitionsChange(parsed.nodeDefinitions);
          }
          toast.success(`Loaded ${parsed.nodeDefinitions.length} node definitions from file`);
        } else {
          toast.error('Invalid node definitions file format');
        }
      } catch (error) {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Workflow Nodes
        </h2>
        
        {/* Import/Export Controls */}
        <div className="flex gap-2 mb-4">
          <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import Node Definitions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste node definitions JSON...\n\nExample:\n{\n  "nodeDefinitions": [\n    {\n      "id": "my-node",\n      "type": "custom",\n      "label": "My Node",\n      ...\n    }\n  ]\n}'
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleLoadNodeDefinitions} className="flex-1">
                    Import JSON
                  </Button>
                  <Button variant="outline" onClick={() => setShowJsonDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                File
              </span>
            </Button>
          </label>

          <Button variant="outline" size="sm" onClick={handleExportNodeDefinitions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

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
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 text-xs"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredNodes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileJson className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No nodes found</p>
              <p className="text-sm">Try adjusting your search or import node definitions</p>
            </div>
          ) : (
            filteredNodes.map((nodeDefinition) => {
              const IconComponent = getIconComponent(nodeDefinition.icon);
              return (
                <Card 
                  key={nodeDefinition.id} 
                  className="p-3 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', nodeDefinition.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{
                        backgroundColor: `hsl(var(--${nodeDefinition.color}) / 0.1)`,
                        color: `hsl(var(--${nodeDefinition.color}))`,
                      }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">{nodeDefinition.label}</h3>
                        <Badge variant="outline" className="text-xs capitalize ml-2">
                          {nodeDefinition.category}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {nodeDefinition.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {nodeDefinition.configFields && (
                          <p className="text-xs text-primary">
                            {nodeDefinition.configFields.length} config fields
                          </p>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddNodeToCanvas(nodeDefinition)}
                          className="ml-auto"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};