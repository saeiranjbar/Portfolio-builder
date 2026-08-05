import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]';

    const variants = {
      default: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25',
      destructive: 'bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-600 hover:shadow-md hover:shadow-red-500/25',
      outline: 'border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:border-gray-300',
      secondary: 'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200',
      ghost: 'text-gray-900 hover:bg-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline rounded-full',
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-10 rounded-xl px-8',
      icon: 'h-9 w-9',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
