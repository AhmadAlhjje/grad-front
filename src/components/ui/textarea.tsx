'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-secondary-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-danger-500 mr-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full px-4 py-2.5 text-secondary-900 bg-white',
            'border rounded-lg transition-all duration-200',
            'placeholder:text-secondary-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'resize-y min-h-[100px]',
            error
              ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
              : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-secondary-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
