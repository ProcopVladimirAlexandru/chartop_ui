import {useEffect} from 'react';
import { Chart } from 'react-google-charts';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/joy/styles';

import Loading from '../loading/Loading';
import { useWindowDimensions } from '../../utils/utils'

import { ChartopEntry, SingleTimeseries } from '../../types/timeseries';
import { GoogleChartData } from '../../types/ui';


function getChartDataFromServerData(entry: ChartopEntry) {
	const header: Array<String> = ["Timestamp"];
	for (let operand of entry.operands) {
		header.push(operand.metadata.unit || "Value");
	}
	const chartData: GoogleChartData = [header];
	if (entry.operands.length == 1) {
		for (let i = 0; i < entry.operands[0].timestamps.length; ++i) {
			chartData.push([new Date(entry.operands[0].timestamps[i]), entry.operands[0].values[i]]);
		}
		return chartData;
	}

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
				chartData.push([new Date(iTs), entry.operands[0].values[i], null]);
				++i;
				continue;
			}
			else {
				if (iTs === jTs) {
					chartData.push([new Date(iTs), entry.operands[0].values[i], entry.operands[1].values[j]]);
					++i;
					++j;
					continue;
				}
				else if (iTs < jTs) {
					chartData.push([new Date(iTs), entry.operands[0].values[i], null]);
					++i;
					continue;
				}
				else {
					chartData.push([new Date(jTs), null, entry.operands[1].values[j]]);
					++j;
					continue;
				}
			}
		}
		else {
			chartData.push([new Date(jTs), null, entry.operands[1].values[j]]);
			++j;
			continue;
		}
	}
	return chartData;
}

function GoogleTSChart({entry, width, height, onChartReady}: {
		entry: ChartopEntry;
		width: string | number;
		height: string | number;
		onChartReady: Function;

	}) {
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

	const windowDimensions = useWindowDimensions();
	const windowWidth = windowDimensions.width;
	const windowHeight = windowDimensions.height;
	const theme: { colorSchemes: Record<string, any> } = useTheme();
	// @ts-ignore
	const { mode }: {mode: string} = useColorScheme();
	var style = getComputedStyle(document.body)
	const smallScreen: boolean = ((windowWidth < 640) || (windowHeight < 640));

	const chartData: GoogleChartData = getChartDataFromServerData(entry);
	if ((chartData.length || 0) <= 1) {
		return (<Loading message="Sorry, data is missing." circularProgress={false} border={0}/>);
	}

	const colors: Array<string> = ["#0866be"];
	if (entry.operands.length > 1) {
		colors.push("#ff3333");
	}
	const googleChartOptions = {
		colors: colors,
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
    	title: entry.operands.map(op => op.metadata.unit).join(" and\n"),
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
			graphID={entry.operands.map(op => op.metadata.uid.toString()).join(",")}
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