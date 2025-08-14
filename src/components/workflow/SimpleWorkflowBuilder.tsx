import React, { useState, useEffect } from 'react';
import { JsonNodeSidebar } from './JsonNodeSidebar';
import { JsonWorkflowCanvas } from './JsonWorkflowCanvas';
import { NodeDefinition, WorkflowDefinition } from '@/types/json-workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, FolderOpen, Play, Plus, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

// Import sample data
import sampleNodeDefinitions from '@/data/sample-node-definitions.json';
import sampleWorkflow from '@/data/sample-workflow.json';

// Local storage keys
const STORAGE_KEYS = {
  NODE_DEFINITIONS: 'workflow_node_definitions',
  WORKFLOWS: 'workflow_saved_workflows',
  CURRENT_WORKFLOW: 'workflow_current'
};

export const SimpleWorkflowBuilder: React.FC = () => {
  const [nodeDefinitions, setNodeDefinitions] = useState<NodeDefinition[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDefinition>();
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowDefinition[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      // Load node definitions (use sample as fallback)
      const storedNodeDefs = localStorage.getItem(STORAGE_KEYS.NODE_DEFINITIONS);
      if (storedNodeDefs) {
        setNodeDefinitions(JSON.parse(storedNodeDefs));
      } else {
        setNodeDefinitions(sampleNodeDefinitions.nodeDefinitions as NodeDefinition[]);
        localStorage.setItem(STORAGE_KEYS.NODE_DEFINITIONS, JSON.stringify(sampleNodeDefinitions.nodeDefinitions));
      }

      // Load saved workflows
      const storedWorkflows = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (storedWorkflows) {
        setSavedWorkflows(JSON.parse(storedWorkflows));
      }

      // Load current workflow (use sample as fallback)
      const storedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKFLOW);
      if (storedCurrent) {
        setCurrentWorkflow(JSON.parse(storedCurrent));
      } else {
        setCurrentWorkflow(sampleWorkflow as WorkflowDefinition);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      toast.error('Error loading saved data');
      // Fallback to sample data
      setNodeDefinitions(sampleNodeDefinitions.nodeDefinitions as NodeDefinition[]);
      setCurrentWorkflow(sampleWorkflow as WorkflowDefinition);
    }
  };

  const handleAddNodeToCanvas = (nodeDefinition: NodeDefinition) => {
    // This will be handled by the canvas component
    console.log('Add node to canvas:', nodeDefinition);
  };

  const handleWorkflowChange = (workflow: WorkflowDefinition) => {
    setCurrentWorkflow(workflow);
    // Auto-save current workflow
    localStorage.setItem(STORAGE_KEYS.CURRENT_WORKFLOW, JSON.stringify(workflow));
  };

  const handleSaveWorkflow = () => {
    if (!currentWorkflow) {
      toast.error('No workflow to save');
      return;
    }
    
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    try {
      const workflowToSave = {
        ...currentWorkflow,
        name: workflowName,
        metadata: {
          ...currentWorkflow.metadata,
          modified: new Date().toISOString()
        }
      };

      const existingIndex = savedWorkflows.findIndex(w => w.id === workflowToSave.id);
      let updatedWorkflows;
      
      if (existingIndex >= 0) {
        updatedWorkflows = [...savedWorkflows];
        updatedWorkflows[existingIndex] = workflowToSave;
      } else {
        updatedWorkflows = [...savedWorkflows, workflowToSave];
      }

      setSavedWorkflows(updatedWorkflows);
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(updatedWorkflows));
      
      toast.success(`Workflow "${workflowName}" saved successfully`);
      setShowSaveDialog(false);
      setWorkflowName('');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const handleLoadWorkflow = (workflow: WorkflowDefinition) => {
    setCurrentWorkflow(workflow);
    localStorage.setItem(STORAGE_KEYS.CURRENT_WORKFLOW, JSON.stringify(workflow));
    toast.success(`Workflow "${workflow.name}" loaded successfully`);
    setShowLoadDialog(false);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const updatedWorkflows = savedWorkflows.filter(w => w.id !== workflowId);
    setSavedWorkflows(updatedWorkflows);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(updatedWorkflows));
    toast.success('Workflow deleted');
  };

  const handleRunWorkflow = () => {
    if (!currentWorkflow) {
      toast.error('No workflow to run');
      return;
    }

    // Validate that all nodes except start/end are configured
    const unconfiguredNodes = currentWorkflow.nodes.filter(node => {
      if (node.type === 'start' || node.type === 'end') return false;
      return !node.data?.config || Object.keys(node.data.config).length === 0;
    });

    if (unconfiguredNodes.length > 0) {
      toast.error(`Please configure all nodes. ${unconfiguredNodes.length} nodes need configuration.`);
      return;
    }

    toast.success('Workflow execution started (simulation)');
    console.log('Running workflow:', currentWorkflow);
  };

  const handleNewWorkflow = () => {
    const newWorkflow: WorkflowDefinition = {
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: 'A new workflow',
      version: '1.0.0',
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          position: { x: 50, y: 200 },
          data: { label: 'Start' }
        },
        {
          id: 'end-1',
          type: 'end',
          position: { x: 800, y: 200 },
          data: { label: 'End' }
        }
      ],
      connections: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'User'
      }
    };
    
    setCurrentWorkflow(newWorkflow);
    localStorage.setItem(STORAGE_KEYS.CURRENT_WORKFLOW, JSON.stringify(newWorkflow));
    toast.success('New workflow created');
  };

  const handleExportWorkflow = () => {
    if (!currentWorkflow) {
      toast.error('No workflow to export');
      return;
    }

    const dataStr = JSON.stringify(currentWorkflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWorkflow.name || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  };

  const handleImportWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as WorkflowDefinition;
        setCurrentWorkflow(imported);
        localStorage.setItem(STORAGE_KEYS.CURRENT_WORKFLOW, JSON.stringify(imported));
        toast.success('Workflow imported successfully');
      } catch (error) {
        toast.error('Invalid workflow file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleNodeDefinitionsChange = (newDefinitions: NodeDefinition[]) => {
    setNodeDefinitions(newDefinitions);
    localStorage.setItem(STORAGE_KEYS.NODE_DEFINITIONS, JSON.stringify(newDefinitions));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">JSON Workflow Builder</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleNewWorkflow}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>

              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Workflow</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter workflow name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveWorkflow()}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveWorkflow} className="flex-1">
                        Save Workflow
                      </Button>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Load Workflow</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {savedWorkflows.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No saved workflows</p>
                    ) : (
                      savedWorkflows.map((workflow) => (
                        <div
                          key={workflow.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{workflow.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {workflow.metadata?.modified && new Date(workflow.metadata.modified).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLoadWorkflow(workflow)}
                            >
                              Load
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={handleExportWorkflow}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportWorkflow}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>

              <Button variant="default" size="sm" onClick={handleRunWorkflow}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {currentWorkflow ? `Workflow: ${currentWorkflow.name}` : 'No workflow loaded'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card">
          <JsonNodeSidebar 
            nodeDefinitions={nodeDefinitions}
            onAddNodeToCanvas={handleAddNodeToCanvas}
            onNodeDefinitionsChange={handleNodeDefinitionsChange}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <JsonWorkflowCanvas
            nodeDefinitions={nodeDefinitions}
            onAddNodeToCanvas={handleAddNodeToCanvas}
            workflow={currentWorkflow}
            onWorkflowChange={handleWorkflowChange}
          />
        </div>
      </div>
    </div>
  );
};