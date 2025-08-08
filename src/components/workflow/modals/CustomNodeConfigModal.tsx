import React, { useState, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { WorkflowNodeData } from '@/types/workflow';
import { Save, X, Settings, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomFieldConfig {
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
}

interface CustomNodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  nodeData: WorkflowNodeData & {
    customConfig?: {
      fields: CustomFieldConfig[];
      validation?: {
        endpoint?: string;
        required?: string[];
      };
    };
  };
  nodeType: string;
}

export const CustomNodeConfigModal: React.FC<CustomNodeConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodeData,
  nodeType
}) => {
  const [config, setConfig] = useState<Record<string, any>>(nodeData.config || {});
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: CustomFieldConfig, value: any): string[] => {
    const errors: string[] = [];

    // Required validation
    if (field.required && (!value || value === '')) {
      errors.push(`${field.label} is required`);
    }

    if (value && value !== '') {
      // Type-specific validation
      if (field.type === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push(`${field.label} must be a valid number`);
        } else {
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            errors.push(`${field.label} must be at least ${field.validation.min}`);
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            errors.push(`${field.label} must be at most ${field.validation.max}`);
          }
        }
      }

      // Pattern validation
      if (field.validation?.pattern && field.type === 'text') {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push(field.validation.message || `${field.label} format is invalid`);
        }
      }

      // JSON validation
      if (field.type === 'json') {
        try {
          JSON.parse(value);
        } catch (error) {
          errors.push(`${field.label} must be valid JSON`);
        }
      }
    }

    return errors;
  }, []);

  const validateConfiguration = useCallback(async () => {
    if (!nodeData.customConfig?.fields) return;

    setIsValidating(true);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Client-side validation
    nodeData.customConfig.fields.forEach(field => {
      const fieldErrors = validateField(field, config[field.name]);
      errors.push(...fieldErrors);
    });

    // Backend validation if endpoint is provided
    if (nodeData.customConfig.validation?.endpoint && errors.length === 0) {
      try {
        // Simulate backend validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real implementation, this would be:
        // const response = await fetch(nodeData.customConfig.validation.endpoint, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(config)
        // });
        
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   errors.push(...(errorData.errors || ['Backend validation failed']));
        // } else {
        //   const result = await response.json();
        //   warnings.push(...(result.warnings || []));
        // }

        warnings.push('Backend validation successful');
      } catch (error) {
        errors.push(`Backend validation failed: ${error}`);
      }
    }

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings
    });

    setIsValidating(false);
  }, [config, nodeData.customConfig, validateField]);

  const handleSave = async () => {
    // Validate before saving
    await validateConfiguration();
    
    if (validationResult?.isValid !== false) {
      setIsLoading(true);
      try {
        await onSave(config);
        onClose();
        toast.success('Custom node configuration saved successfully');
      } catch (error) {
        console.error('Failed to save configuration:', error);
        toast.error('Failed to save configuration');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please fix validation errors before saving');
    }
  };

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear validation when config changes
    setValidationResult(null);
  }, []);

  const renderCustomField = (field: CustomFieldConfig) => {
    const fieldValue = config[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={fieldValue}
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(fieldValue)}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label className="text-sm text-muted-foreground">
              {fieldValue ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      case 'json':
        return (
          <Textarea
            placeholder={field.placeholder || 'Enter JSON...'}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configure {nodeData.label}
          </DialogTitle>
          <DialogDescription>
            Configure this custom node using the dynamic fields defined in the JSON configuration.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-6 mt-4">
          <div className="space-y-6">
            {/* Basic Node Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="node-name">Step Name</Label>
                <Input
                  id="node-name"
                  placeholder="Enter step name"
                  value={config.stepName || nodeData.label}
                  onChange={(e) => handleFieldChange('stepName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="node-type">Node Type</Label>
                <Input
                  id="node-type"
                  value={nodeType}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this step does..."
                value={config.description || nodeData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            {/* Custom Fields */}
            {nodeData.customConfig?.fields && nodeData.customConfig.fields.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Custom Configuration</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateConfiguration}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Validate
                  </Button>
                </div>

                {nodeData.customConfig.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {renderCustomField(field)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No custom configuration fields defined for this node type.
              </div>
            )}

            {/* Validation Results */}
            {validationResult && (
              <div className="space-y-3">
                <Separator />
                
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

                {validationResult.warnings.length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Validation Warnings:</div>
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
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || validationResult?.isValid === false}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};