import Typography from '@mui/joy/Typography';
import Autocomplete from '@mui/joy/Autocomplete';
import Grid from '@mui/joy/Grid';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import {useState} from 'react';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import { useSelector } from 'react-redux';
import { useColorScheme } from '@mui/joy/styles';
import { startCase as _startCase } from 'lodash';

import './Tags.css';

import { selectAllTags } from '../../redux/tagsSlice';

import { Tag } from '../../types/tags';
import { EventHandler } from '../../types/ui';


function Tags({onAddTag, onDeleteTag, onSelectAllOrAnyTags, selectedTags=[], allOrAny='any'}:
{
	onAddTag: Function;
	onDeleteTag: Function;
	onSelectAllOrAnyTags: EventHandler;
	selectedTags?: Array<Tag>;
	allOrAny: string;
}) {
	const allAvailableTags = useSelector(selectAllTags);
	const [tagValue, setTagValue] = useState(null);
	const [tagInputValue, setTagInputValue] = useState('');
	const { mode } = useColorScheme();

	const selectedTagsJSX = selectedTags.map( tag => { return (<Grid key={tag.uid}>
			<Chip
				title={tag.description}
				size="lg"
        variant="solid"
        sx={(theme) => {return {
        	// @ts-ignore
					bgcolor: theme.colorSchemes[mode].tagColor,
					borderRadius: 7,
					color: "#000000"
				}}}
        endDecorator={<ChipDelete
        onDelete={() => onDeleteTag(tag)}
        sx={{
					color: "#000000",
					bgcolor: "#ffffff",
					marginTop: 0.3,
					marginBottom: 0.3,
					marginLeft: 0.7,
					borderRadius: 7
				}}
        />}> {tag.name} </Chip> </Grid> );} );
	const availableTags = allAvailableTags.filter( (tag: Tag) => !(selectedTags.filter( selectedTag => selectedTag.uid === tag.uid ) ).length );

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
	   	Choose the tags that interest you:
  	</Typography>

	  {/*Select and Add Tags*/}
	  <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={1} sx={{boxShadow: 200}}>
	  <Grid xs={10}>
	  <Autocomplete
	  	getOptionLabel={(option: Tag) => option.name}
	  	placeholder='Select tag'
	  	options={availableTags.sort((a: Tag, b: Tag) => (a.category || 'Others').localeCompare(b.category || 'Others'))}
	  	clearOnBlur={false}
	  	startDecorator={<LabelImportantIcon />}
	  	// groupBy={(option) => option.category}
	  	value={tagValue}
	  	// @ts-ignore
	  	onChange={(_event, newValue) => {setTagValue(newValue);}} // TODO investigate TS error here
	  	inputValue={tagInputValue}
    	onInputChange={(_event, newInputValue) => {setTagInputValue(newInputValue);}}
    	isOptionEqualToValue={(option, value) => option.uid === value.uid}
	  ></Autocomplete></Grid>

	  <Grid xs={2} paddingBottom={0}>
	  <Button
	    // @ts-ignore
	  	disabled={!tagValue || (tagInputValue != tagValue.name)} // TODO investigate TS errors
	  	onClick={ () => {  onAddTag(tagValue); setTagValue(null); setTagInputValue('');} }
	  >Add</Button></Grid>
	  </Grid>

		{/*Display tags*/}
	  {(selectedTagsJSX?.length > 0) &&
	  <Grid
	  	container
	  	spacing={0.5}
	  	padding={0.5}
	  	sx={(theme) => {return {
	  		// @ts-ignore
					bgcolor: theme.colorSchemes[mode].tagBackgroundColor,
				}}}
	  	borderRadius={7}
	  >
			{selectedTagsJSX}
		</Grid>}

		{/*AND or OR*/}
		{(selectedTags.length > 1) &&
			<Box
			paddingTop={0.5}
			paddingBottom={0.5}
			>
			<Typography
				level="body-lg"
				component="span"
			>
	   	Display charts with
	   		<ToggleButtonGroup
	   			variant="soft"
	   			sx={{marginLeft: ".5em", marginRight: ".5em", display: "inline"}}
	   			size="sm"
	   			value={allOrAny}
	   	 		color="primary"
		   	 	onChange={onSelectAllOrAnyTags}
      	>
		      <Button value="all">ALL</Button>
		      <Button value="any">ANY</Button>
	    	</ToggleButtonGroup>
		   	 of the selected tags.
		   	</Typography>
	  	</Box>
	  }
		</Stack>
	);
}

export default Tags;