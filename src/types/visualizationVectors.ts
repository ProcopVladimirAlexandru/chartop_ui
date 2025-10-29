import { SingleTimeseries } from "./timeseries";

export interface TSWithVisualizationVector extends SingleTimeseries {
  visualization_vector: Array<number>;
}

export interface ChartDatum {
  vector: Array<number>;
  index: number;
}
