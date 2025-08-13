import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { JsonNodeSidebar } from './JsonNodeSidebar';
import { JsonWorkflowCanvas } from './JsonWorkflowCanvas';
import { NodeDefinition, WorkflowDefinition } from '@/types/json-workflow';

// Import sample data
import sampleNodeDefinitions from '@/data/sample-node-definitions.json';
import sampleWorkflow from '@/data/sample-workflow.json';

export const SimpleWorkflowBuilder: React.FC = () => {
  const [nodeDefinitions, setNodeDefinitions] = useState<NodeDefinition[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDefinition | undefined>();

  // Load sample node definitions on mount
  useEffect(() => {
    setNodeDefinitions(sampleNodeDefinitions.nodeDefinitions as NodeDefinition[]);
  }, []);

  const handleAddNode = useCallback((nodeDefinition: NodeDefinition) => {
    // This will be handled by the canvas component when a node is dragged from sidebar
    toast.info(`Ready to add ${nodeDefinition.label} node - drag it to the canvas`);
  }, []);

  const handleLoadNodeDefinitions = useCallback((definitions: NodeDefinition[]) => {
    setNodeDefinitions(definitions);
  }, []);

  const handleLoadWorkflow = useCallback((workflowJson: string) => {
    try {
      const workflow = JSON.parse(workflowJson);
      setCurrentWorkflow(workflow);
      toast.success(`Loaded workflow: ${workflow.name}`);
    } catch (error) {
      toast.error('Invalid workflow JSON');
    }
  }, []);

  const handleWorkflowChange = useCallback((workflow: WorkflowDefinition) => {
    setCurrentWorkflow(workflow);
  }, []);

  const handleLoadSampleWorkflow = useCallback(() => {
    setCurrentWorkflow(sampleWorkflow as WorkflowDefinition);
    toast.success('Loaded sample ERP analysis workflow');
  }, []);

  return (
    <div className="h-screen w-full flex bg-background">
      {/* JSON-based Node Sidebar */}
      <JsonNodeSidebar
        nodeDefinitions={nodeDefinitions}
        onAddNode={handleAddNode}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLoadNodeDefinitions={handleLoadNodeDefinitions}
        onLoadWorkflow={handleLoadWorkflow}
      />

      {/* Main Canvas Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-96' : 'ml-0'}`}>
        {/* Toolbar */}
        <div className="h-16 border-b border-border bg-background/50 backdrop-blur-sm flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {currentWorkflow?.name || 'JSON Workflow Builder'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentWorkflow?.description || 'Build workflows using JSON-defined nodes and configurations'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleLoadSampleWorkflow}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Load Sample Workflow
            </button>
            
            {currentWorkflow && (
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(currentWorkflow, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${currentWorkflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Workflow exported');
                }}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Export Workflow
              </button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="h-[calc(100vh-4rem)]">
          <JsonWorkflowCanvas
            nodeDefinitions={nodeDefinitions}
            onAddNodeToCanvas={handleAddNode}
            workflow={currentWorkflow}
            onWorkflowChange={handleWorkflowChange}
          />
        </div>
      </div>
    </div>
  );
};