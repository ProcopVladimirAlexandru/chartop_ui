import {useState} from 'react';
import Sheet from '@mui/joy/Sheet';
import Grid from '@mui/joy/Grid';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import Link from '@mui/joy/Link';
import Table from '@mui/joy/Table';
import AccordionGroup from '@mui/joy/AccordionGroup';
import Accordion from '@mui/joy/Accordion';
import AccordionSummary from '@mui/joy/AccordionSummary';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AssessmentIcon from '@mui/icons-material/Assessment';
import "./OneTimeseries.css";
import GoogleTSChart from '../google_ts_chart/GoogleTSChart';
import ChartJSChart from '../chart_js_chart/ChartJSChart';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/joy/styles';

import Loading from '../loading/Loading';
import { useWindowDimensions } from '../../utils/utils'

import { selectAllTags } from '../../redux/tagsSlice';
import { selectAllMetrics } from '../../redux/metricsSlice';
import { selectMetric } from '../../redux/tsFiltersSlice';

import { SingleTimeseries, SingleTimeseriesMetadataMetric } from '../../types/timeseries';
import { Tag } from '../../types/tags';
import { Metric } from '../../types/metrics';
import { FRED_DATA_SOURCE_UID, BASE_FRED_LINK } from '../../utils/utils';


function getCitationJSX(ts: SingleTimeseries) {
	const source: string = ts.metadata.source_uid;
	const uidFromSource: string = ts.metadata.uid_from_source;
	if (source === FRED_DATA_SOURCE_UID) {
		const fredHref = `${BASE_FRED_LINK}/${uidFromSource}`;
		const linkJSX = <Link href={fredHref}>{fredHref}</Link>;
		return (
		<Grid padding={0.5} margin={0.5} sx={(theme) => {return {
		  		// @ts-ignore
					bgcolor: theme.colorSchemes['light'].tagBackgroundColor,
					borderRadius: 7,
					border: 1, borderColor: "#ff9d25"
				}}}>
			<Typography sx={{color: "black", wordBreak: "break-word"}} noWrap={false}>
				<Typography noWrap={false} fontWeight="xl" sx={{wordBreak: "break-word"}}>Citation: </Typography>
				This data was obtained from the Federal Reserve FRED database. Visit {linkJSX} for the original source.
			</Typography>
		</Grid>);
	}
}

function getAllMetricsJSX(ts: SingleTimeseries, metrics: Array<Metric>, accordion=false, mode="light") {
	if (!ts.metadata.metrics) {
		return <></>;
	}
	const titleJSX = (
		<Grid key="title" sx={{borderBottom: accordion?0:1, borderColor: "#ff9d25"}}>
			<Typography sx={{wordBreak: "break-word"}} noWrap={false} startDecorator={<AssessmentIcon sx={{color:"#ff9d25"}}/>} component="span" level="h2">Metrics</Typography>
		</Grid>
	);
	const uidToMetric = Object.fromEntries(metrics.map(metric => [metric.uid, metric]));

	// LIST
	// for (const tsToMetric of ts.metadata.metrics) {
	// 	jsx.push(
	// 		<Grid key={tsToMetric.uid}>
	// 			<Grid container={1} direction="row" spacing={1} justifyContent="space-between">
	// 				<Grid xs={9}>
	// 					<Typography component="p">{uidToMetric[tsToMetric.uid].name}</Typography>
	// 				</Grid>
	// 				<Grid xs={3} sx={{paddingRight: 1}}>
	// 					<Typography component="p" sx={{color: tsToMetric.color}}>{tsToMetric.formattedValue}</Typography>
	// 				</Grid>
	// 			</Grid>
	// 		</Grid>
	// 	);
	// }

	// OLD LIST
	// for (let i = 0; i < 100; ++i) {
	// 	jsx.push(
	// 		<Grid key={i+100}>
	// 			<Grid container={1} direction="row" spacing={1} justifyContent="space-between">
	// 				<Grid xs={9}>
	// 					<Typography component="p">{uidToMetric[ts.metadata.metrics[0].uid].name + ": "}</Typography>
	// 				</Grid>
	// 				<Grid xs={3}>
	// 					<Typography component="p">{ts.metadata.metrics[0].formattedValue}</Typography>
	// 				</Grid>
	// 			</Grid>
	// 		</Grid>);
	// }

	// TABLE
	const tableJSX = (
	<Table hoverRow key="table" sx={{ '& tr > *:not(:first-child)': { textAlign: 'right' } }}>
		<thead></thead>
		<tbody>
		{
			ts.metadata.metrics.map( (tsMetric) => {
				return <tr key={tsMetric.uid}>
				<td style={{ width: '75%' }}>{uidToMetric[tsMetric.uid].name}</td>
				
				<td><Typography sx={(theme)=> {
					// @ts-ignore
					return {color: theme.colorSchemes[mode].metricValue[tsMetric.color]}}}>{tsMetric.formattedValue}</Typography></td>
				</tr>
			}
			)
		}
		</tbody>
	</Table>);

	if (accordion) {
		return (
		<AccordionGroup size="lg" transition={{
  initial: "0.3s ease-out",
  expanded: "0.3s ease",
}}>
			<Accordion variant="plain">
				<AccordionSummary sx={{borderTop: 1, borderColor: "#ff9d25"}}>{titleJSX}</AccordionSummary>
				<AccordionDetails>{tableJSX}</AccordionDetails>
			</Accordion>
		</AccordionGroup>);
	}
	return [titleJSX, tableJSX];
}

function OneTimeseries({ts, index}: {ts: SingleTimeseries; index: number}) {
	const { height, width } = useWindowDimensions();
	const tags = useSelector(selectAllTags);
	const metrics = useSelector(selectAllMetrics);
	const selectedMetric = useSelector(selectMetric);
	if (!selectedMetric) {
		return <></>;
	}
	const [isChartReady, setIsChartReady] = useState(false);
	const theme: { colorSchemes: Record<string, any> } = useTheme();
	// @ts-ignore
	const h1Title = useMediaQuery(theme.breakpoints.up('md'));
	// @ts-ignore
	const { mode }: {mode: string} = useColorScheme();
	const smallScreen: boolean = ((width < 640) || (height < 640));

	const accordionMetrics = width < 1024;

	const tsTagUIDs = (ts.metadata.tags || []).map(tag => tag.uid);
	const tsTags = tags.filter( (tag: Tag) => tsTagUIDs.includes(tag.uid) );
	const tsTagsJSX = tsTags.map( (tag: Tag) => { return ( <Grid key={tag.uid}>
			<Chip
				size="lg"
        variant="solid"
				sx={(theme) => {return {
					// @ts-ignore
					bgcolor: theme.colorSchemes[mode].tagColor,
					borderRadius: 7,
					color: "#000000",
					wordBreak: "break-word"
				}}}
        > {tag.name} </Chip> </Grid> );} );

	const allMetricsJSX = getAllMetricsJSX(ts, metrics, accordionMetrics, mode);
	const selectedTSToMetric = (ts.metadata.metrics || []).find( (metric: SingleTimeseriesMetadataMetric) => metric.uid  === selectedMetric.uid );
	if (!selectedTSToMetric) {
		// TODO better handle these weird cases
		return <></>;
	};

	return (
		<Grid container={true} direction="row" spacing={2} columns={12} justifyContent="space-between">
		{/*Info and chart to the left*/}
		<Grid xs={accordionMetrics?12:8}>
			<Sheet sx={{border: 2, borderColor: "#ff9d25", borderRadius: 7}}>
				<Grid container={true} direction="column">
					<Grid>{/*necesar*/}
						<Grid container={true} direction="row" spacing={0} justifyContent="space-between" sx={{p: 2}} alignItems="flex-start">
						<Grid xs={8}>
							<Typography level="h2" component="span" sx={{wordBreak: "break-word"}} noWrap={false}>
							<Typography level="h1" component="span" sx={{wordBreak: "break-word"}} noWrap={false}>{(index + 1).toString() + ". "}</Typography>
							{selectedMetric.name + ": " } </Typography>
						</Grid>
						
						<Grid xs={4}>
						<Typography level={h1Title?"h1":"h2"} component="span" noWrap={false}
						sx={(theme)=> {
							return {
								wordBreak: "break-word",
								// @ts-ignore
								color: theme.colorSchemes[mode].metricValue[selectedTSToMetric.color]}}}>
						{selectedTSToMetric.formattedValue}
						</Typography>
						</Grid>

						</Grid>
					</Grid>

					<Grid sx={{borderTop: 1, borderColor: "#ff9d25"}}>
						<Grid container={true} direction="column">
							{/*Title*/}
							<Grid padding={0.5} margin={0.5}>
								<Typography level={h1Title?"h1":"h2"} sx={{wordBreak: "break-word"}} noWrap={false}>
									{ts.metadata.name}
								</Typography>
							</Grid>

							<Grid padding={0.5} margin={0.5} sx={(theme) => {return {
							  		border: 1, borderColor: "#ff9d25",
							  		// @ts-ignore
										bgcolor: theme.colorSchemes[mode].tagBackgroundColor,
									}}}
							  	borderRadius={7}>
							{(ts.timestamps.length > 0 && ts.values.length > 0) &&
							<Typography sx={{wordBreak: "break-word"}} noWrap={false}>
							<Typography level="h3" component="span" sx={{wordBreak: "break-word"}} noWrap={false}>
									Last recorded value was {Intl.NumberFormat('en-US', {
									notation: "compact",
									maximumFractionDigits: 2
								}).format(ts.values.at(-1) || 0.0)} {ts.metadata.unit} on 
								</Typography>
							<Typography level="h3" component="span" sx={{wordBreak: "break-word"}} noWrap={false}>
								{" "} {(new Date(ts.timestamps.at(-1) || new Date().getTime())).toLocaleString()}
							</Typography>
							</Typography>}
							</Grid>

							{/*Tags*/}
							{ (!!tsTagsJSX.length) && <Grid padding={0.5} margin={0.5}>
								<Grid
							  	container={true}
							  	direction="row"
							  	spacing={1}
							  	sx={(theme) => {return {
							  		border: 1, borderColor: "#ff9d25",
							  		// @ts-ignore
										bgcolor: theme.colorSchemes[mode].tagBackgroundColor,
									}}}
							  	borderRadius={7}
							  >
									{tsTagsJSX}
								</Grid>
							</Grid>}

							{/*Description*/}
							{(ts.metadata.description && (ts.metadata.description.length > 0)) &&
							<Grid padding={0.5} margin={0.5} sx={(_theme) => {return {
							  		border: 1, borderColor: "#ff9d25",
							  		maxHeight: '7em', overflowY: 'scroll'
									}}}
							  	borderRadius={7}>
									<Typography level="h4" noWrap={false} component="span" sx={{wordBreak: "break-word"}}>
									Description:
									</Typography>
									<Typography level="body-md" noWrap={false} component="span" sx={{wordBreak: "break-word"}}>
									{ts.metadata.description}
									</Typography>
							</Grid>}
						</Grid>
					</Grid>

					{/*Chart*/}
					<Grid>
					{smallScreen?
					<ChartJSChart
						width="100%"
		      	height="250vh"
						ts={ts}
					/>:
					<GoogleTSChart
						ts={ts}
					  width="100%"
		      	height="32em"
		      	onChartReady={() => {setIsChartReady(true)}}
					/>}
					{!smallScreen && !isChartReady && <Loading message="Building Chart" circularProgress={!smallScreen} border={0}/>}
					</Grid>
					{getCitationJSX(ts)}
				</Grid>

				{/*Inside and below metrics*/}
				{accordionMetrics && <Grid sx={{maxHeight: '30em', overflowY: 'scroll'}}>
				<Grid container={true} direction="column" spacing={1} disableEqualOverflow={true} sx={{paddingRight: 0, paddingLeft: 1, paddingTop: 1}}>
					{allMetricsJSX}
				</Grid>
				</Grid>}
			</Sheet>
		</Grid>


		{/*Metrics to the right*/}
		{!accordionMetrics && <Grid xs={4}>
					<Sheet sx={{border: 2, maxHeight: '50em', overflowY: 'scroll', borderColor: "#ff9d25", borderRadius: 7}}>
						<Grid container={true} direction="column" spacing={1} disableEqualOverflow={true} sx={{paddingRight: 0, paddingLeft: 1, paddingTop: 1}}>
							{allMetricsJSX}
						</Grid>
					</Sheet>
				</Grid>}
		</Grid>
	);
}

export default OneTimeseries;