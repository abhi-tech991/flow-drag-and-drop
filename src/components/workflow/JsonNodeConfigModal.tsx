import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NodeDefinition, NodeFieldConfig } from '@/types/json-workflow';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface JsonNodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
  nodeDefinition: NodeDefinition;
  initialConfig?: Record<string, any>;
}

export const JsonNodeConfigModal: React.FC<JsonNodeConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nodeDefinition,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<Record<string, any>>(initialConfig);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
    setValidationErrors({});
  }, [initialConfig, isOpen]);

  const validateField = useCallback((field: NodeFieldConfig, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation && value) {
      const { min, max, pattern, message } = field.validation;
      
      if (field.type === 'number') {
        const num = Number(value);
        if (min !== undefined && num < min) {
          return message || `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && num > max) {
          return message || `${field.label} must be at most ${max}`;
        }
      }
      
      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return message || `${field.label} format is invalid`;
        }
      }
    }

    return null;
  }, []);

  const validateAllFields = useCallback(() => {
    const errors: Record<string, string> = {};
    
    nodeDefinition.configFields?.forEach(field => {
      const error = validateField(field, config[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [config, nodeDefinition.configFields, validateField]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setConfig(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleSave = useCallback(async () => {
    setIsValidating(true);
    
    const isValid = validateAllFields();
    
    if (isValid) {
      onSave(config);
      onClose();
    }
    
    setIsValidating(false);
  }, [config, validateAllFields, onSave, onClose]);

  const renderField = useCallback((field: NodeFieldConfig) => {
    const value = config[field.name] || '';
    const hasError = !!validationErrors[field.name];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className={hasError ? 'text-destructive' : ''}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && (
              <p className="text-sm text-destructive">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className={hasError ? 'text-destructive' : ''}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && (
              <p className="text-sm text-destructive">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className={hasError ? 'text-destructive' : ''}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(newValue) => handleFieldChange(field.name, newValue)}>
              <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-destructive">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={field.name}
                checked={!!value}
                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              />
              <Label htmlFor={field.name} className={hasError ? 'text-destructive' : ''}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {hasError && (
              <p className="text-sm text-destructive">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className={hasError ? 'text-destructive' : ''}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFieldChange(field.name, file.name);
                }
              }}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && (
              <p className="text-sm text-destructive">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  }, [config, validationErrors, handleFieldChange]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configure {nodeDefinition.label}
            <Badge variant="outline" className="capitalize">
              {nodeDefinition.category}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Node Description */}
          <div className="text-sm text-muted-foreground">
            {nodeDefinition.description}
          </div>

          <Separator />

          {/* Configuration Fields */}
          {nodeDefinition.configFields && nodeDefinition.configFields.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Configuration</h3>
              {nodeDefinition.configFields.map(renderField)}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This node type does not require any configuration.
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Errors Summary */}
          {hasValidationErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors above before saving.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Configuration Preview */}
          {Object.keys(config).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Configuration</h4>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isValidating || hasValidationErrors}
          >
            {isValidating ? (
              'Validating...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};