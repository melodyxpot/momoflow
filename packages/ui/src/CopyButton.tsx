"use client";

import { Button } from "@heroui/react";
import { useState } from "react";

export interface CopyButtonProps {
  value: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function CopyButton({ value, label = "Copy", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <Button
      size={size}
      variant={copied ? "solid" : "flat"}
      color={copied ? "success" : "primary"}
      onPress={handleCopy}
    >
      {copied ? "Copied!" : label}
    </Button>
  );
}
