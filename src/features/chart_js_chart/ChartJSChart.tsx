import {useEffect} from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/joy/styles';
import { Line } from 'react-chartjs-2';
import "chartjs-adapter-date-fns";
import * as zoomPlugin from 'chartjs-plugin-zoom';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin.default
);
import { max as _max } from 'lodash';

import Loading from '../loading/Loading';
import { ChartopEntry, SingleTimeseries } from '../../types/timeseries';
import { ChartJSData } from '../../types/ui';

const POINT_INTERVAL = 150;

function getChartDataFromServerData(entry: ChartopEntry): ChartJSData {
	const chartData: Array<ChartJSData> = [Array()];
	if (entry.operands.length < 2) {
		for (let i = 0; i < entry.operands[0].timestamps.length; ++i) {
			chartData[0].push({
				x: new Date(entry.operands[0].timestamps[i]),
				y: entry.operands[0].values[i]
			});
		}
		return chartData;
	}

	chartData.push(Array());
	let i: number = 0;
	let j: number = 0;
	while (true) {
		let iTs: number | null = null;
		if (i < entry.operands[0].timestamps.length) {
			iTs = entry.operands[0].timestamps[i];
		}

		let jTs: number | null = null;
		if (j < entry.operands[1].timestamps.length) {
			jTs = entry.operands[1].timestamps[j];
		}

		if (iTs === null && jTs === null) {
		  break;
		}

		if (iTs !== null) {
			if (jTs === null) {
				chartData[0].push(
				{
					x: new Date(entry.operands[0].timestamps[i]),
					y: entry.operands[0].values[i]
				});
				++i;
				continue;
			}
			else {
				if (iTs === jTs) {
					chartData[0].push(
					{
						x: new Date(entry.operands[0].timestamps[i]),
						y: entry.operands[0].values[i]
					});
					chartData[1].push(
					{
						x: new Date(entry.operands[1].timestamps[j]),
						y: entry.operands[1].values[j]
					});
					++i;
					++j;
					continue;
				}
				else if (iTs < jTs) {
					chartData[0].push(
					{
						x: new Date(entry.operands[0].timestamps[i]),
						y: entry.operands[0].values[i]
					});
					++i;
					continue;
				}
				else {
					chartData[1].push(
						{
							x: new Date(entry.operands[1].timestamps[j]),
							y: entry.operands[1].values[j]
						}
					);
					++j;
					continue;
				}
			}
		}
		else {
			chartData[1].push(
				{
					x: new Date(entry.operands[1].timestamps[j]),
					y: entry.operands[1].values[j]
				}
			);
			++j;
			continue;
		}
	}
	return chartData;
}


function ChartJSChart({entry, width, height, onChartReady}: {entry: ChartopEntry; width: string | number; height: string | number; onChartReady?: Function}) {
	useEffect(() => {
		if (!onChartReady) {
			return;
		}
		for (let operand of entry.operands) {
			if (operand.timestamps.length > 1) {
				return;
			}
		}
		onChartReady();
	}, [entry]);
	const theme: { colorSchemes: Record<string, any> } = useTheme();
	// @ts-ignore
	const { mode }: {mode: string} = useColorScheme();

	const chartData: Array<ChartJSData> = getChartDataFromServerData(entry);
	if ((chartData.length || 0) == 0) {
		return (<Loading message="Sorry, data is missing." circularProgress={false} border={0}/>);
	}
	for (const points of chartData) {
		if ((points.length || 0) <= 1) {
			return (<Loading message="Sorry, data is missing." circularProgress={false} border={0}/>);
		}
	}
	const maxDate: Date = _max( chartData.map( data => data.at(-1).x ) );
	const initialMinDate: Date = _max(chartData.map( data => data[ Math.max(0, data.length - POINT_INTERVAL) ].x));

	const options = {
		aspectRatio: 0.2,
	  responsive: true,
	  maintainAspectRatio: false,
	  plugins: {
	    legend: {
	    	display: false,
	      position: 'top' as const,
	    },
	    title: {
	      display: true,
	      text: "Units: " + entry.operands.map(op => op.metadata.unit).join(" and ")
	      // text: entry.operands.map(op => op.metadata.name.toString()).join(","),
	    },
	    zoom: {
			  limits: {
			    x: {
			    	// min: new Date( chartData[0].x.getTime() - 30 * 24 * 60 * 60 * 1000 ),  // nu asta cauzeaza socul cand atingi
			    	max: maxDate,  // nu asta cauzeaza socul cand atingi
			    	minRange: POINT_INTERVAL
			    },
			  },
			  pan: {
			    enabled: true,  // nu asta cauzeaza socul cand atingi
			    mode: "x" as const,
			    threshold: 10
			  },
			  zoom: {  // nu asta cauzeaza socul cand atingi
			  	mode: 'x',
			    wheel: {
			      enabled: false
			    },
			    drag: {
			      enabled: false
			    },
			    pinch: {
			      enabled: true
			    }
			  }
			}
	  },
	  scales: {
	  	x: {
	  		type: "time" as const,
	  		display: true,
	  		stacked: false,
	  		min: initialMinDate,
	  		grid: {
	  			display: false,
	  		},
	  		ticks: {
	  			source: 'auto',
        	major: {
        		enabled: true
        	},
        	color: theme.colorSchemes[mode].chart.hAxis.textStyle,
        	minRotation: 20
	  		},
	  		time: {
	  			unit: 'month',
	  			displayFormats: {
	  				year: 'yyyy',
  					day: 'MMM dd'
	  			}
	  		},
	  		afterFit: (_axis: any) => {if (onChartReady) {onChartReady()}},
	  		afterTickToLabelConversion: (axis: any) => {
	  			if (!axis.ticks?.length) {
	  				return;
	  			}
	  			const maxDate: Date = new Date(axis.max);
	  			axis.ticks[axis.ticks.length - 1] = {
	  				value: axis.max,
	  				major: true,
	  				label: maxDate.toLocaleDateString("en-US")
	  			};
	  		}
	  	},
	  	y: {
	  		title: {
	  			display: false,
	  			text: entry.operands.map(op => op.metadata.unit).join(" and "),
	  			font: {
	  				size: 12,
	  				weight: "bolder"
	  			},
	  			color: theme.colorSchemes[mode].chart.vAxis.title
	  		},
	  		ticks: {
	  			color: theme.colorSchemes[mode].chart.vAxis.textStyle,
	  			callback: function(value: number, _index: number, _ticks: any) {
	  				return Intl.NumberFormat('en-US', {
		  				notation: "compact",
		  				maximumFractionDigits: 2}).format(value)
	  			}
	  		},
	  		type: 'linear',
	  		display: true,
	  		stacked: false
	  	}
	  }
	};
	const colors: Array<string> = ["#0866be"];
	if (entry.operands.length > 1) {
		colors.push("#ff3333");
	}

	const data = {
	  // labels: [chartData.labels[0], chartData.labels[chartData.labels.length - 1]],
	  datasets: chartData.map((data, i) => 
	  	{return {
	    	// clip: {left: -20, top: false, right: -20, bottom: 0},
	      data: data,
	      borderColor: colors[i],
	      backgroundColor: 'rgba(0, 0, 255, 0.3)',
	      fill: true,
	      pointBorderWidth: 0,
	      pointHitRadius: 0,
	      pointHoverBorderWidth: 0,
	      pointHoverRadius: 0,
	      pointRadius: 0,
	      pointStyle: 'circle',
	      showLine: true,
	      spanGaps: false,
	      stack: 'line',
	      stepped: false,
	      tension: 0
	    }}
	   )
	};
	// @ts-ignore
  return (<Line width={width} height={height} options={options} data={data} />);
}

export default ChartJSChart;