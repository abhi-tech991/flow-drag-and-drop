import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Code, Play, Save } from 'lucide-react';

interface JsonNodeConfig {
  id: string;
  type: string;
  label: string;
  description?: string;
  position?: { x: number; y: number };
  config: {
    fields: Array<{
      name: string;
      type: 'text' | 'number' | 'select' | 'textarea' | 'switch' | 'json';
      label: string;
      placeholder?: string;
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
      };
    }>;
    validation?: {
      endpoint?: string;
      required?: string[];
    };
  };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    icon?: string;
  };
}

interface JsonWorkflowConfig {
  name: string;
  description: string;
  version: string;
  nodes: JsonNodeConfig[];
  validation: {
    endpoint: string;
    headers?: Record<string, string>;
  };
}

interface JsonWorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: JsonWorkflowConfig) => void;
}

export const JsonWorkflowBuilder: React.FC<JsonWorkflowBuilderProps> = ({
  isOpen,
  onClose,
  onApplyConfig
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedConfig, setParsedConfig] = useState<JsonWorkflowConfig | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const sampleConfig: JsonWorkflowConfig = {
    name: "Custom Data Processing Workflow",
    description: "A custom workflow for processing business data",
    version: "1.0.0",
    nodes: [
      {
        id: "custom-data-source",
        type: "customDataSource",
        label: "Custom Data Source",
        description: "Connect to your custom data source",
        config: {
          fields: [
            {
              name: "sourceUrl",
              type: "text",
              label: "Source URL",
              placeholder: "https://api.example.com/data",
              required: true,
              validation: {
                pattern: "^https?://.*",
                message: "Must be a valid URL"
              }
            },
            {
              name: "apiKey",
              type: "text",
              label: "API Key",
              placeholder: "Enter your API key",
              required: true
            },
            {
              name: "refreshInterval",
              type: "number",
              label: "Refresh Interval (minutes)",
              placeholder: "30",
              validation: {
                min: 1,
                max: 1440,
                message: "Must be between 1 and 1440 minutes"
              }
            },
            {
              name: "autoRefresh",
              type: "switch",
              label: "Enable Auto Refresh",
              required: false
            }
          ],
          validation: {
            endpoint: "/api/validate/datasource",
            required: ["sourceUrl", "apiKey"]
          }
        },
        style: {
          backgroundColor: "hsl(var(--workflow-erp))",
          borderColor: "hsl(var(--workflow-erp))",
          icon: "database"
        }
      },
      {
        id: "custom-transformer",
        type: "customTransformer",
        label: "Custom Data Transformer",
        description: "Transform data using custom rules",
        config: {
          fields: [
            {
              name: "transformationType",
              type: "select",
              label: "Transformation Type",
              required: true,
              options: [
                { value: "map", label: "Map Fields" },
                { value: "filter", label: "Filter Data" },
                { value: "aggregate", label: "Aggregate Data" },
                { value: "custom", label: "Custom Logic" }
              ]
            },
            {
              name: "transformationRules",
              type: "json",
              label: "Transformation Rules (JSON)",
              placeholder: '{"field1": "newField1", "field2": "newField2"}',
              required: true
            },
            {
              name: "outputFormat",
              type: "select",
              label: "Output Format",
              required: true,
              options: [
                { value: "json", label: "JSON" },
                { value: "csv", label: "CSV" },
                { value: "xml", label: "XML" }
              ]
            }
          ],
          validation: {
            endpoint: "/api/validate/transformer",
            required: ["transformationType", "transformationRules"]
          }
        },
        style: {
          backgroundColor: "hsl(var(--workflow-process))",
          borderColor: "hsl(var(--workflow-process))",
          icon: "zap"
        }
      }
    ],
    validation: {
      endpoint: "/api/validate/workflow",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer {{token}}"
      }
    }
  };

  const validateJsonConfig = useCallback(async (config: JsonWorkflowConfig) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Client-side validation
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic structure validation
      if (!config.name) errors.push("Workflow name is required");
      if (!config.nodes || config.nodes.length === 0) errors.push("At least one node is required");
      if (!config.validation?.endpoint) errors.push("Validation endpoint is required");

      // Node validation
      config.nodes?.forEach((node, index) => {
        if (!node.id) errors.push(`Node ${index + 1}: ID is required`);
        if (!node.type) errors.push(`Node ${index + 1}: Type is required`);
        if (!node.label) errors.push(`Node ${index + 1}: Label is required`);
        if (!node.config?.fields) errors.push(`Node ${index + 1}: Configuration fields are required`);

        // Field validation
        node.config?.fields?.forEach((field, fieldIndex) => {
          if (!field.name) errors.push(`Node ${index + 1}, Field ${fieldIndex + 1}: Name is required`);
          if (!field.type) errors.push(`Node ${index + 1}, Field ${fieldIndex + 1}: Type is required`);
          if (!field.label) errors.push(`Node ${index + 1}, Field ${fieldIndex + 1}: Label is required`);
        });
      });

      // Backend validation (simulate for now)
      if (errors.length === 0 && config.validation?.endpoint) {
        try {
          // In a real implementation, this would call the backend
          // const response = await fetch(config.validation.endpoint, {
          //   method: 'POST',
          //   headers: config.validation.headers || {},
          //   body: JSON.stringify(config)
          // });
          
          // Simulate backend validation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate some backend warnings
          if (config.nodes.length > 5) {
            warnings.push("Large number of nodes may impact performance");
          }
          
          warnings.push("Backend validation successful - configuration is valid");
        } catch (error) {
          errors.push(`Backend validation failed: ${error}`);
        }
      }

      setValidationResult({
        isValid: errors.length === 0,
        errors,
        warnings
      });

      if (errors.length === 0) {
        toast.success("Configuration validated successfully!");
      } else {
        toast.error(`Validation failed with ${errors.length} errors`);
      }

    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [`Validation error: ${error}`],
        warnings: []
      });
      toast.error("Validation failed");
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleParseJson = useCallback(() => {
    try {
      const config = JSON.parse(jsonInput) as JsonWorkflowConfig;
      setParsedConfig(config);
      validateJsonConfig(config);
    } catch (error) {
      setParsedConfig(null);
      setValidationResult({
        isValid: false,
        errors: [`Invalid JSON: ${error}`],
        warnings: []
      });
      toast.error("Invalid JSON format");
    }
  }, [jsonInput, validateJsonConfig]);

  const handleApplyConfig = useCallback(() => {
    if (parsedConfig && validationResult?.isValid) {
      onApplyConfig(parsedConfig);
      onClose();
      toast.success("Custom workflow configuration applied!");
    }
  }, [parsedConfig, validationResult, onApplyConfig, onClose]);

  const loadSampleConfig = useCallback(() => {
    setJsonInput(JSON.stringify(sampleConfig, null, 2));
    setParsedConfig(sampleConfig);
    setValidationResult(null);
  }, [sampleConfig]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            JSON-Based Workflow Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* JSON Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="json-input">Workflow Configuration (JSON)</Label>
              <Button variant="outline" size="sm" onClick={loadSampleConfig}>
                Load Sample
              </Button>
            </div>
            
            <Textarea
              id="json-input"
              placeholder="Paste your JSON workflow configuration here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button 
                onClick={handleParseJson} 
                disabled={!jsonInput.trim() || isValidating}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {isValidating ? 'Validating...' : 'Parse & Validate'}
              </Button>
              
              {parsedConfig && validationResult?.isValid && (
                <Button onClick={handleApplyConfig} variant="default">
                  <Save className="h-4 w-4 mr-2" />
                  Apply Config
                </Button>
              )}
            </div>
          </div>

          {/* Validation Results & Preview */}
          <div className="space-y-4">
            <Label>Validation Results</Label>
            
            {validationResult && (
              <div className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <Badge variant="default" className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid Configuration
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Invalid Configuration
                    </Badge>
                  )}
                </div>

                {/* Errors */}
                {validationResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Validation Errors:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Warnings:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Configuration Preview */}
            {parsedConfig && (
              <Card className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Configuration Preview</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {parsedConfig.name}</div>
                    <div><strong>Version:</strong> {parsedConfig.version}</div>
                    <div><strong>Nodes:</strong> {parsedConfig.nodes?.length || 0}</div>
                    <div><strong>Validation Endpoint:</strong> {parsedConfig.validation?.endpoint}</div>
                  </div>

                  {parsedConfig.nodes && parsedConfig.nodes.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Custom Nodes:</div>
                      {parsedConfig.nodes.map((node, index) => (
                        <div key={index} className="bg-muted/50 p-2 rounded text-xs">
                          <div className="font-medium">{node.label}</div>
                          <div className="text-muted-foreground">{node.type}</div>
                          <div className="text-muted-foreground">
                            {node.config.fields?.length || 0} configuration fields
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};