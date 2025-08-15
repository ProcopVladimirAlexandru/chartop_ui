export interface SingleTimeseriesMetadataTag {
	uid: number;
}

export interface SingleTimeseriesMetadataMetric {
	uid: number;
	value: number;
	data?: any;
	color?: string;
	formattedValue?: string | number;
}

export interface SingleTimeseriesMetadata {
	timezone: number;
	uid: number;
  name: string;
  description?: string;
  unit?: string;
  source_uid: string;
  uid_from_source: string;
  successful_last_update_time: number;
  tags?: Array<SingleTimeseriesMetadataTag>;
  metrics?: Array<SingleTimeseriesMetadataMetric>;
}

export interface SingleTimeseries {
	timestamps: Array<number>;
  values: Array<number>;
  metadata: SingleTimeseriesMetadata;
}

export interface ChartopEntry {
	operands: Array<SingleTimeseries>
	order_by_metric_value: number
	color?: string;
	formattedValue?: string | number;
}