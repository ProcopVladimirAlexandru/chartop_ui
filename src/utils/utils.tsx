import { useState, useEffect } from "react";

export function getDimensions(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getDimensions());
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowDimensions;
}

export function isScreenSmall(width: number, height: number): boolean {
  return width < 640 || height < 640;
}

export const FRED_DATA_SOURCE_UID = "federal_reserve";
export const BASE_FRED_LINK = "https://fred.stlouisfed.org/series";

export const MAXIMUM_VECTORS: number =
  Number(import.meta.env.MAXIMUM_VECTORS) || 100;

export const MAXIMUM_SELECTED_VECTORS: number =
  Number(import.meta.env.MAXIMUM_SELECTED_VECTORS) || 5;

export const DEFAULT_AXIS_DOMAIN_LENGTH =
  Number(import.meta.env.DEFAULT_AXIS_DOMAIN_LENGTH) || 1;

export const DEFAULT_X_MIN: number = -1;

export const DEFAULT_Y_MIN: number = -1;

export const DEFAULT_ORIGIN_VECTOR: Array<number> = [0.0, 0.0];
