"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* Table Variants */
export type TableVariant = "striped" | "plain";

/* Table Sizes */
export type TableSize = "sm" | "md" | "lg";

/* Table Layout */
export type TableLayout = "fixed" | "auto";

/* Table Props */
export interface TableProps {
  children: React.ReactNode;
  className?: string;
  variant?: TableVariant;
  size?: TableSize;
  layout?: TableLayout;
}

/* Table Component */
export const Table = ({
  children,
  className = "",
  variant = "striped",
  size = "md",
  layout = "auto",
}: TableProps) => {
  return (
    <div
      className={cn(
        "overflow-x-auto",
        "sm:max-h-[400px]",
        "divide-y",
        "rounded-lg",
        "border",
        "divider-y-reverse",
        variant === "striped" && "divide-y",
        size === "sm" && "text-sm",
        size === "lg" && "text-lg",
        layout === "fixed" && "table-fixed",
        className
      )}
    >
      <table className="min-w-full">{children}</table>
    </div>
  );
};

/* Table Header */
export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader = ({
  children,
  className = "",
}: TableHeaderProps) => {
  return (
    <thead>
      <tr className={cn("text-left", "text-gray-700", className)}>{children}</tr>
    </thead>
  );
};

/* Table Body */
export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody = ({
  children,
  className = "",
}: TableBodyProps) => {
  return <tbody className={cn(className)}>{children}</tbody>;
};

/* Table Row */
export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow = ({
  children,
  className = "",
  onClick,
}: TableRowProps) => {
  return (
    <tr
      className={cn(
        "hover:bg-primary-5",
        "hover:bg-primary-100",
        "transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

/* Table Cell */
export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "center";
}

export const TableCell = ({
  children,
  className = "",
  variant,
}: TableCellProps) => {
  return (
    <td
      className={cn(
        "px-4",
        "py-2",
        "text-sm",
        "text-gray-600",
        variant === "center" && "text-center",
        className
      )}
    >
      {children}
    </td>
  );
};

/* Table Head */
export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHead = ({
  children,
  className = "",
}: TableHeadProps) => {
  return (
    <th
      scope="col"
      className={cn(
        "px-4",
        "py-3",
        "text-xs",
        "font-semibold",
        "tracking-wider",
        "text-gray-500",
        "uppercase",
        className
      )}
    >
      {children}
    </th>
  );
};