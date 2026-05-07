"use client";

import { QRCodeCanvas } from "qrcode.react";

export interface QRCodeBlockProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

export function QRCodeBlock({
  value,
  size = 160,
  bgColor = "#ffffff",
  fgColor = "#000000",
}: QRCodeBlockProps) {
  return (
    <div className="inline-flex rounded-xl border border-default-200 bg-content1 p-3">
      <QRCodeCanvas
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        includeMargin={false}
        level="M"
      />
    </div>
  );
}
