"use client";

import { Card } from "@heroui/react";
import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: {
    direction: "up" | "down" | "flat";
    value: string;
  };
}

export function StatCard({ label, value, hint, trend }: StatCardProps) {
  const trendColor =
    trend?.direction === "up"
      ? "text-success"
      : trend?.direction === "down"
        ? "text-danger"
        : "text-default-500";

  return (
    <Card shadow="sm" radius="lg" className="h-full gap-2">
      <p className="text-xs uppercase tracking-wide text-default-500">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        {trend && <span className={`text-sm ${trendColor}`}>{trend.value}</span>}
      </div>
      {hint && <p className="text-xs text-default-400">{hint}</p>}
    </Card>
  );
}
