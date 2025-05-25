import {useEffect} from 'react';
import { Chart } from 'react-google-charts';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/joy/styles';

import Loading from '../loading/Loading';
import { useWindowDimensions } from '../../utils/utils'

import { SingleTimeseries } from '../../types/timeseries';
import { GoogleChartData } from '../../types/ui';


function getChartDataFromServerData(serverData: SingleTimeseries) {
	const chartData: GoogleChartData = [["Timestamp", serverData.metadata.unit || "Value"]];
	for (let i = 0; i < serverData.timestamps.length; ++i) {
		chartData.push([new Date(serverData.timestamps[i]), serverData.values[i]]);
	}
	return chartData;
}

function GoogleTSChart({ts, width, height, onChartReady}: {
		ts: SingleTimeseries;
		width: string | number;
		height: string | number;
		onChartReady: Function;

	}) {
	useEffect(() => {
		if (((ts.timestamps.length || 0) <= 1) && onChartReady) {onChartReady()}
	}, [ts]);

	const windowDimensions = useWindowDimensions();
	const windowWidth = windowDimensions.width;
	const windowHeight = windowDimensions.height;
	const theme: { colorSchemes: Record<string, any> } = useTheme();
	// @ts-ignore
	const { mode }: {mode: string} = useColorScheme();
	var style = getComputedStyle(document.body)
	const smallScreen: boolean = ((windowWidth < 640) || (windowHeight < 640));

	const chartData: GoogleChartData = getChartDataFromServerData(ts);
	if ((chartData.length || 0) <= 1) {
		return (<Loading message="Sorry, data is missing." circularProgress={false} border={0}/>);
	}

	const googleChartOptions = {
		colors: ["#0866be"],
		title: smallScreen?undefined:"Select area to zoom in. Right click to zoom out.",
		titlePosition: "in",
		titleTextStyle: {
			color: theme.colorSchemes[mode].chart.title,
			fontSize: 15,
			bold: false,
			italic: true
		},
		enableInteractivity: !smallScreen,
		hAxis: {
			viewWindowMode: "pretty",
			viewWindow: {
	    	min: smallScreen?chartData[Math.max(chartData.length - 50, 1)][0]:null,
	      max: smallScreen?chartData[chartData.length - 1][0]:null
			},
			titleTextStyle: {
				color: theme.colorSchemes[mode].chart.hAxis.title
			},
			textStyle: {
				color: theme.colorSchemes[mode].chart.hAxis.textStyle
			},
			gridlines: {
				count: 16,  //  TODO asta nu afecteaza ticks, trebuie sa fie alta optiune
				color: theme.colorSchemes[mode].chart.hAxis.gridlines,
				units: {
					// months: {format: ["MM"]}, // does NOT work for july stuff
				},
			},
		},
    vAxis: {
    	title: ts.metadata.unit,
    	titleTextStyle: {
	      fontSize: 17,
	      color: theme.colorSchemes[mode].chart.vAxis.title
	    },
	    textStyle: {
				color: theme.colorSchemes[mode].chart.vAxis.textStyle
			},
    	gridlines: {
				minSpacing: 32,
				color: theme.colorSchemes[mode].chart.vAxis.gridlines,
			},
      format: "short"
    },
	  explorer: {
	  	axis: "horizontal",
	  	keepInBounds: !smallScreen,
	  	maxZoomIn: smallScreen?undefined:0.05,
	  	maxZoomOut: smallScreen?undefined:1,
	  	actions: smallScreen?['dragToPan', 'rightClickToReset']:['dragToZoom', 'rightClickToReset']
	  },
	  curveType: "none",
	  legend: {position: "none", textStyle: {color: theme.colorSchemes[mode].chart.legend}},
	  chartArea: {
	  	left:smallScreen?"20%":"10%", top: "10%",
	  	width:smallScreen?'70%':'80%', height:'80%',
	  	backgroundColor: "white"
	  },
	  axisTitlesPosition: "out",
	  backgroundColor: style.getPropertyValue(theme.colorSchemes[mode].palette.background.body),
	};

	return (
		<Chart
			graphID={ts.metadata.uid.toString()}
		  chartType="LineChart"
		  options={googleChartOptions}
		  data={chartData}
		  width={width}
	  	height={height}
	  	chartEvents={[
	  	{
				eventName: "ready",
      	callback: ({ chartWrapper: _chartWrapper }) => {
	      	if (onChartReady) {onChartReady()};
	      }
	    }]}
		/>
	);
}

export default GoogleTSChart;