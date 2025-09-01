'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
        success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
        warning: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700',
        outline: 'border-gray-300 text-gray-900 hover:bg-gray-50',
        'outline-destructive': 'border-red-300 text-red-600 hover:bg-red-50',
        'outline-success': 'border-green-300 text-green-600 hover:bg-green-50',
        'outline-warning': 'border-yellow-300 text-yellow-600 hover:bg-yellow-50',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, leftIcon, rightIcon, dot, children, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {dot && (
          <span className="w-2 h-2 bg-current rounded-full ml-1.5" />
        )}
        {leftIcon && (
          <span className="ml-1">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="mr-1">{rightIcon}</span>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };