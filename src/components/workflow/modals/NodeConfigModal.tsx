import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkflowNodeData } from '@/types/workflow';
import { Save, X, Settings } from 'lucide-react';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  nodeData: WorkflowNodeData;
  nodeType: string;
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodeData,
  nodeType
}) => {
  const [config, setConfig] = useState(nodeData.config || {});
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfigFields = () => {
    switch (nodeType) {
      case 'enhancedDataSource':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="source-type">Data Source Type</Label>
              <Select
                value={config.sourceType || ''}
                onValueChange={(value) => setConfig({...config, sourceType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="netsuite">NetSuite ERP</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="api">REST API</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="connection-string">Connection String</Label>
              <Input
                id="connection-string"
                placeholder="Enter connection details"
                value={config.connectionString || ''}
                onChange={(e) => setConfig({...config, connectionString: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
              <Input
                id="sync-frequency"
                type="number"
                placeholder="30"
                value={config.syncFrequency || ''}
                onChange={(e) => setConfig({...config, syncFrequency: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync"
                checked={config.autoSync || false}
                onCheckedChange={(checked) => setConfig({...config, autoSync: checked})}
              />
              <Label htmlFor="auto-sync">Enable Auto Sync</Label>
            </div>
          </div>
        );

      case 'enhancedProcess':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="transformation-type">Transformation Type</Label>
              <Select
                value={config.transformationType || ''}
                onValueChange={(value) => setConfig({...config, transformationType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transformation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merge">Merge Data</SelectItem>
                  <SelectItem value="transform">Transform Fields</SelectItem>
                  <SelectItem value="aggregate">Aggregate Data</SelectItem>
                  <SelectItem value="normalize">Normalize Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="transformation-rules">Transformation Rules</Label>
              <Textarea
                id="transformation-rules"
                placeholder="Define transformation logic..."
                value={config.transformationRules || ''}
                onChange={(e) => setConfig({...config, transformationRules: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        );

      case 'enhancedAI':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-model">AI Model</Label>
              <Select
                value={config.aiModel || ''}
                onValueChange={(value) => setConfig({...config, aiModel: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categorization">Smart Categorization</SelectItem>
                  <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                  <SelectItem value="prediction">Demand Prediction</SelectItem>
                  <SelectItem value="optimization">Inventory Optimization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
              <Input
                id="confidence-threshold"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={config.confidenceThreshold || ''}
                onChange={(e) => setConfig({...config, confidenceThreshold: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-learning"
                checked={config.autoLearning || false}
                onCheckedChange={(checked) => setConfig({...config, autoLearning: checked})}
              />
              <Label htmlFor="auto-learning">Enable Auto Learning</Label>
            </div>
          </div>
        );

      case 'enhancedFilter':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-conditions">Filter Conditions</Label>
              <Textarea
                id="filter-conditions"
                placeholder="Define filter conditions (JSON format)..."
                value={config.filterConditions || ''}
                onChange={(e) => setConfig({...config, filterConditions: e.target.value})}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="discrepancy-threshold">Discrepancy Threshold (%)</Label>
              <Input
                id="discrepancy-threshold"
                type="number"
                min="0"
                max="100"
                placeholder="5"
                value={config.discrepancyThreshold || ''}
                onChange={(e) => setConfig({...config, discrepancyThreshold: e.target.value})}
              />
            </div>
          </div>
        );

      case 'enhancedVisualization':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select
                value={config.chartType || ''}
                onValueChange={(value) => setConfig({...config, chartType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="metrics">Metrics to Display</Label>
              <Textarea
                id="metrics"
                placeholder="Specify metrics and KPIs..."
                value={config.metrics || ''}
                onChange={(e) => setConfig({...config, metrics: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="real-time"
                checked={config.realTime || false}
                onCheckedChange={(checked) => setConfig({...config, realTime: checked})}
              />
              <Label htmlFor="real-time">Real-time Updates</Label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            No configuration options available for this node type.
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configure {nodeData.label}
          </DialogTitle>
          <DialogDescription>
            Set up the configuration for this workflow step. These settings will be used when the workflow runs.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-6 mt-4">
          <div className="space-y-6">
            <div>
              <Label htmlFor="node-name">Step Name</Label>
              <Input
                id="node-name"
                placeholder="Enter step name"
                value={config.stepName || nodeData.label}
                onChange={(e) => setConfig({...config, stepName: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this step does..."
                value={config.description || nodeData.description}
                onChange={(e) => setConfig({...config, description: e.target.value})}
                rows={2}
              />
            </div>

            <Separator />

            {renderConfigFields()}
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};