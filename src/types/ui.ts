import { MouseEvent as ReactMouseEvent } from "react";

export type CircularProgressSizesType = "sm" | "md" | "lg";

export type GoogleChartData = Array<
  Array<string> | Array<Date | number | null>
>;
export type LWChartData = Array<{ time: string; value: number }>;
export type ChartJSData = Array<{ x: Date; y: number }>;

export type EventHandler = (
  event: ReactMouseEvent<HTMLElement, MouseEvent>,
  value: string | null,
) => void;
