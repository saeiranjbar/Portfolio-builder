import type { CSSProperties } from "react";
import type { Guide } from "./types";

export interface SmartGuidesOverlayProps {
  guides: Guide[];
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
  measurementColor?: string;
  strokeWidth?: number;
  dashed?: boolean;
  viewBox?: string;
  labelFontSize?: number;
}

export function SmartGuidesOverlay({
  guides,
  width,
  height,
  className,
  style,
  color = "#ff3eb5",
  measurementColor = "#ff3eb5",
  strokeWidth = 1,
  dashed = false,
  viewBox = `0 0 ${width} ${height}`,
  labelFontSize = 11,
}: SmartGuidesOverlayProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
        ...style,
      }}
    >
      {guides.map((guide) => {
        const isMeasurement = guide.kind === "measurement" || guide.kind === "spacing";
        const stroke = isMeasurement ? measurementColor : color;
        const x1 = guide.axis === "x" ? guide.position : Math.min(guide.start, guide.end);
        const x2 = guide.axis === "x" ? guide.position : Math.max(guide.start, guide.end);
        const y1 = guide.axis === "y" ? guide.position : Math.min(guide.start, guide.end);
        const y2 = guide.axis === "y" ? guide.position : Math.max(guide.start, guide.end);
        const labelX = guide.axis === "x" ? guide.position + 5 : (x1 + x2) / 2;
        const labelY = guide.axis === "y" ? guide.position - 5 : (y1 + y2) / 2 - 5;

        return (
          <g key={guide.id}>
            <line
              x1={guide.axis === "x" ? guide.position : x1}
              y1={guide.axis === "y" ? guide.position : y1}
              x2={guide.axis === "x" ? guide.position : x2}
              y2={guide.axis === "y" ? guide.position : y2}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={dashed || isMeasurement ? "4 3" : undefined}
              vectorEffect="non-scaling-stroke"
            />
            {guide.label && (
              <g transform={`translate(${labelX}, ${labelY})`}>
                <rect
                  x={-guide.label.length * labelFontSize * 0.29 - 4}
                  y={-labelFontSize - 3}
                  width={guide.label.length * labelFontSize * 0.58 + 8}
                  height={labelFontSize + 6}
                  rx={3}
                  fill="#222222"
                  fillOpacity={0.92}
                />
                <text
                  x={0}
                  y={0}
                  fill="#ffffff"
                  fontSize={labelFontSize}
                  textAnchor="middle"
                  dominantBaseline="auto"
                >
                  {guide.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
