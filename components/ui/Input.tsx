'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'focus-visible:ring-blue-500 focus-visible:border-blue-500',
        error: 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
        success: 'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    leftElement,
    rightElement,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success;
    
    const inputVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {(leftIcon || leftElement) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon || leftElement}
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              {
                'pr-10': leftIcon || leftElement,
                'pl-10': rightIcon || rightElement,
              },
              className
            )}
            ref={ref}
            {...props}
          />
          
          {(rightIcon || rightElement) && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon || rightElement}
            </div>
          )}
        </div>
        
        {(error || success || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}
            {helperText && !error && !success && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };