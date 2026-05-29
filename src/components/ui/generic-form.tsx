'use client';

import * as React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { get as lodashGet } from 'lodash';

// =============================================================================
// FORM CONTEXT
// =============================================================================

interface FormContextType {
  pathPrefix: string;
  updateField: (path: string, value: any) => void;
  resumeData: any;
}

export const FormContext = React.createContext<FormContextType | null>(null);

// =============================================================================
// GENERIC FORM CONTAINER
// =============================================================================

export interface GenericFormProps {
  pathPrefix: string;
  children: React.ReactNode;
  className?: string;
}

export function GenericForm({
  pathPrefix,
  children,
  className,
}: GenericFormProps): React.ReactElement {
  const { resumeData, updateField } = useResumeStore();

  return (
    <FormContext.Provider value={{ pathPrefix, updateField, resumeData }}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </FormContext.Provider>
  );
}

// =============================================================================
// FORM ROW (Horizontal grid layout)
// =============================================================================

export interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({ children, className }: FormRowProps): React.ReactElement {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// FORM TEXT FIELD
// =============================================================================

export interface FormTextFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  isArray?: boolean;
}

export function FormTextField({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  disabled,
  className,
  isArray = false,
}: FormTextFieldProps): React.ReactElement {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('FormTextField must be used within a GenericForm component');
  }

  const { pathPrefix, updateField, resumeData } = context;
  const fullPath = pathPrefix ? `${pathPrefix}.${name}` : name;
  
  const rawValue = lodashGet(resumeData, fullPath);
  const value = isArray && Array.isArray(rawValue) 
    ? rawValue.join(', ') 
    : (rawValue ?? '');

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (isArray) {
            const arr = val.split(',').map((s) => s.trim());
            updateField(fullPath, arr);
          } else {
            updateField(fullPath, val);
          }
        }}
      />
    </div>
  );
}

// =============================================================================
// FORM TEXT AREA
// =============================================================================

export interface FormTextAreaProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function FormTextArea({
  name,
  label,
  placeholder,
  required,
  disabled,
  className,
  rows = 4,
}: FormTextAreaProps): React.ReactElement {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('FormTextArea must be used within a GenericForm component');
  }

  const { pathPrefix, updateField, resumeData } = context;
  const fullPath = pathPrefix ? `${pathPrefix}.${name}` : name;
  const value = lodashGet(resumeData, fullPath) ?? '';

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        value={value}
        onChange={(e) => updateField(fullPath, e.target.value)}
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-zinc-800 bg-[#0c0c0e]/50 px-3.5 py-2.5 text-sm text-zinc-150 shadow-inner placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 resize-none'
        )}
      />
    </div>
  );
}

// =============================================================================
// FORM CHECKBOX
// =============================================================================

export interface FormCheckboxProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export function FormCheckbox({
  name,
  label,
  description,
  disabled,
  className,
  onCheckedChange,
}: FormCheckboxProps): React.ReactElement {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('FormCheckbox must be used within a GenericForm component');
  }

  const { pathPrefix, updateField, resumeData } = context;
  const fullPath = pathPrefix ? `${pathPrefix}.${name}` : name;
  const checked = !!lodashGet(resumeData, fullPath);

  return (
    <div className={cn('flex items-start space-x-2', className)}>
      <Checkbox
        id={fullPath}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(val) => {
          const isChecked = !!val;
          updateField(fullPath, isChecked);
          onCheckedChange?.(isChecked);
        }}
      />
      <div className="space-y-0.5 select-none">
        <label
          htmlFor={fullPath}
          className="text-xs text-zinc-400 font-medium cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-zinc-500 leading-normal">{description}</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// FORM DATE PICKER
// =============================================================================

export interface FormDatePickerProps {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormDatePicker({
  name,
  label,
  placeholder,
  disabled,
  className,
}: FormDatePickerProps): React.ReactElement {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('FormDatePicker must be used within a GenericForm component');
  }

  const { pathPrefix, updateField, resumeData } = context;
  const fullPath = pathPrefix ? `${pathPrefix}.${name}` : name;
  const value = lodashGet(resumeData, fullPath) ?? '';

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <DatePicker
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(val) => updateField(fullPath, val)}
      />
    </div>
  );
}

export default GenericForm;
