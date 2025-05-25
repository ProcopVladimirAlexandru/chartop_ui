import Typography from '@mui/joy/Typography';
import SortIcon from '@mui/icons-material/Sort';
import Autocomplete from '@mui/joy/Autocomplete';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import { useSelector } from 'react-redux';
import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import FormControl from '@mui/joy/FormControl';
import { useWindowDimensions } from '../../utils/utils'

import { selectAllMetrics } from '../../redux/metricsSlice';

import { Metric } from '../../types/metrics';
import { EventHandler } from '../../types/ui';


function Sorting({onSelectMetric, onSelectAscOrDesc, onSetAscOrDesc, selectedMetric, ascOrDesc}:
	{
		onSelectMetric: Function;
		onSelectAscOrDesc: EventHandler;
		onSetAscOrDesc: ((value: string) => void);
		selectedMetric: Metric | null;
		ascOrDesc: string;
	}) {
	const availableMetrics = useSelector(selectAllMetrics);
	const { width } = useWindowDimensions();

	return (
		<Stack
		  border={2}
		  borderRadius={7}
		  borderColor="#ff9d25"
		  spacing={1}
		  paddingLeft={1}
		  paddingRight={1}
		  paddingBottom={1}
		  paddingTop={1}
		>

		{/*Title*/}
		<Typography level="h3">
	   	Choose the metric by which to sort the charts:
  	</Typography>

  	{/*Dropdown selection*/}
  	<FormControl error={!selectedMetric}>
  	<Autocomplete
	  	getOptionLabel={option => option.name}
	  	placeholder='Select metric'
	  	options={availableMetrics.toSorted((a: Metric, b: Metric) => (a.category || 'Others').localeCompare(b.category || 'Others'))}
	  	clearOnBlur={false}
	  	startDecorator={<SortIcon />}
	  	groupBy={(option) => option.category || 'Others'}
	  	value={selectedMetric}
	  	onChange={(_event, newValue) => {
	  		onSelectMetric(newValue);
				if(newValue?.default_order) {
					onSetAscOrDesc(newValue.default_order);
				}
			}
			}
	  	isOptionEqualToValue={(option, value) => option.uid === value.uid}
	  ></Autocomplete>
	  {/*{!selectedMetric && <FormHelperText>We need a metric</FormHelperText>}*/}
	  </FormControl>

  	{/*Order*/}
  	{ (!!selectedMetric) &&
  		<Box
  			sx={{paddingBottom: 0.5, paddingTop: 0.5}}
			>
  		<Typography
  			level="body-lg"
  			component="span"
  		>
		   	Display the charts in 
   		<ToggleButtonGroup
   			variant="soft"
   			sx={{marginLeft: ".5em", marginRight: ".5em", display: "inline"}}
   			size="sm"
   			value={ascOrDesc}
   	 		color="primary"
	   	 	onChange={onSelectAscOrDesc}
    	>
	      <Button value="asc" endDecorator={<NorthIcon sx={{p: 0, m: 0, fontSize: "sm"}}/>}>{width < 500?"ASC":"ASCENDING"}</Button>
	      <Button value="desc" endDecorator={<SouthIcon sx={{p: 0, m: 0, fontSize: "sm"}}/>}>{width < 500?"DESC":"DESCENDING"}</Button>
    	</ToggleButtonGroup>
		   	 order.
	  	</Typography>
	  </Box>}
		</Stack>
	);
}

export default Sorting;