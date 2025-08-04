import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface ConditionalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  nodeData: any;
}

interface SubNode {
  id: string;
  condition: string;
  label: string;
}

export const ConditionalConfigModal: React.FC<ConditionalConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodeData
}) => {
  const [stepName, setStepName] = useState('');
  const [description, setDescription] = useState('');
  const [variable, setVariable] = useState('');
  const [operator, setOperator] = useState('equals');
  const [value, setValue] = useState('');
  const [subnodes, setSubnodes] = useState<SubNode[]>([]);

  useEffect(() => {
    if (nodeData) {
      setStepName(nodeData.label || '');
      setDescription(nodeData.description || '');
      setVariable(nodeData.config?.variable || '');
      setOperator(nodeData.config?.operator || 'equals');
      setValue(nodeData.config?.value || '');
      setSubnodes(nodeData.subnodes || []);
    }
  }, [nodeData]);

  const addSubnode = () => {
    const newSubnode: SubNode = {
      id: `subnode-${Date.now()}`,
      condition: '',
      label: ''
    };
    setSubnodes([...subnodes, newSubnode]);
  };

  const removeSubnode = (id: string) => {
    setSubnodes(subnodes.filter(sub => sub.id !== id));
  };

  const updateSubnode = (id: string, field: keyof SubNode, value: string) => {
    setSubnodes(subnodes.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ));
  };

  const handleSave = () => {
    const config = {
      stepName,
      description,
      variable,
      operator,
      value,
      subnodes
    };
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Conditional Logic</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stepName">Step Name</Label>
              <Input
                id="stepName"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="Enter step name"
              />
            </div>
            <div>
              <Label htmlFor="variable">Variable</Label>
              <Input
                id="variable"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                placeholder="e.g., data.status"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this condition checks"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operator">Operator</Label>
              <select
                id="operator"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
              </select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Comparison value"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Sub-conditions</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addSubnode}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Sub-condition
              </Button>
            </div>

            <div className="space-y-3">
              {subnodes.map((subnode) => (
                <Card key={subnode.id} className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">Condition</Label>
                      <Input
                        value={subnode.condition}
                        onChange={(e) => updateSubnode(subnode.id, 'condition', e.target.value)}
                        placeholder="e.g., value > 100"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-5">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={subnode.label}
                        onChange={(e) => updateSubnode(subnode.id, 'label', e.target.value)}
                        placeholder="Description"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSubnode(subnode.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};