import React from 'react';
import clsx from 'clsx';
import { filterFigmaProps } from './utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, noPadding = false, ...props }) => {
  return (
    <div 
      className={clsx(
        "bg-card text-card-foreground border border-border rounded-2xl shadow-xl overflow-hidden",
        !noPadding && "p-6",
        className
      )}
      {...filterFigmaProps(props)}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("flex flex-col space-y-1.5 mb-4", className)} {...filterFigmaProps(props)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return (
    <h3 className={clsx("font-semibold leading-none tracking-tight text-foreground text-lg", className)} {...filterFigmaProps(props)}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
  return (
    <p className={clsx("text-sm text-muted-foreground", className)} {...filterFigmaProps(props)}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("", className)} {...filterFigmaProps(props)}>
      {children}
    </div>
  );
};
