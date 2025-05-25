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

import Loading from '../loading/Loading';
import { SingleTimeseries } from '../../types/timeseries';
import { ChartJSData } from '../../types/ui';

const POINT_INTERVAL = 150;

function getChartDataFromServerData(serverData: SingleTimeseries): ChartJSData {
	const chartData: ChartJSData = [];
	for (let i = 0; i < serverData.timestamps.length; ++i) {
		chartData.push({x: new Date(serverData.timestamps[i]), y: serverData.values[i]});
	}
	return chartData;
}


function ChartJSChart({ts, width, height, onChartReady}: {ts: SingleTimeseries; width: string | number; height: string | number; onChartReady?: Function}) {
	useEffect(() => {
		if (((ts.timestamps.length || 0) <= 1) && onChartReady) {onChartReady()}
	}, [ts]);
	const theme: { colorSchemes: Record<string, any> } = useTheme();
	// @ts-ignore
	const { mode }: {mode: string} = useColorScheme();

	const chartData: ChartJSData = getChartDataFromServerData(ts);
	if ((chartData.length || 0) <= 1) {
		return (<Loading message="Sorry, data is missing." circularProgress={false} border={0}/>);
	}

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
	      display: false,
	      text: ts.metadata.name,
	    },
	    zoom: {
			  limits: {
			    x: {
			    	// min: new Date( chartData[0].x.getTime() - 30 * 24 * 60 * 60 * 1000 ),  // nu asta cauzeaza socul cand atingi
			    	max: chartData[chartData.length - 1].x,  // nu asta cauzeaza socul cand atingi
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
	  		min: chartData[ Math.max(0, chartData.length - POINT_INTERVAL) ].x,
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
	  			display: true,
	  			text: ts.metadata.unit,
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

	const data = {
	  // labels: [chartData.labels[0], chartData.labels[chartData.labels.length - 1]],
	  datasets: [
	    {
	    	// clip: {left: -20, top: false, right: -20, bottom: 0},
	      data: chartData,
	      borderColor: theme.colorSchemes[mode].chart.line.color,
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
	    }
	  ],
	};
	// @ts-ignore
  return (<Line width={width} height={height} options={options} data={data} />);
}

export default ChartJSChart;