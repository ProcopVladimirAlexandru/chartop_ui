import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import {useState, MouseEvent} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWindowDimensions } from '../../utils/utils'

import Tags from '../tags/Tags';
import Sorting from '../sorting/Sorting';

import { set as setTSFilters, selectFilters } from '../../redux/tsFiltersSlice';
import { fetchTS, selectTSStatus, clearSingleTSCache } from '../../redux/tsSlice';
import { AppDispatch } from '../../redux/store';

import { Tag } from '../../types/tags';
import { Metric } from '../../types/metrics';


function FilteredSearch() {
	const dispatch = useDispatch<AppDispatch>();
	const stateFilters = useSelector(selectFilters);
	const tsStatus = useSelector(selectTSStatus);

	const [selectedTags, setSelectedTags] = useState(stateFilters.tags || []);
  const [allOrAny, setAllOrAny] = useState(stateFilters.allOrAnyTags || 'any');

  const [selectedMetric, setSelectedMetric] = useState(stateFilters.metric || null);
  const [ascOrDesc, setAscOrDesc] = useState(stateFilters.ascOrDesc || (selectedMetric?.default_order || "desc"));
  const { height, width } = useWindowDimensions();

	function onAddTag(tag: Tag) {
		const newSelectedTags = selectedTags.slice();
		newSelectedTags.push(tag);
		setSelectedTags(newSelectedTags);
	}
	function onDeleteTag(deletedTag: Tag) {
		const newSelectedTags = selectedTags.filter( (tag: Tag) => tag.uid != deletedTag.uid );
		setSelectedTags(newSelectedTags);
	}
	function onSelectAllOrAnyTags(_event: MouseEvent, newValue: any) {
		if (newValue) { 
			setAllOrAny(newValue);
		}
	}
	function onSelectMetric(metric: Metric) {
		setSelectedMetric(metric);
	}
	function onSelectAscOrDesc(_event: MouseEvent, newValue: any) {
		if (newValue) { 
			setAscOrDesc(newValue);
		}
	}
	function enableSearchButton() {
		if (!selectedMetric) {
			return false;
		}
		if (tsStatus === 'initial') {
			return true;
		}

		if (selectedMetric.uid !== stateFilters.metric?.uid) {
			return true;
		}
		if (allOrAny !== stateFilters.allOrAnyTags) {
			return true;
		}
		if (ascOrDesc !== stateFilters.ascOrDesc) {
			return true;
		}
		const selectedTagUids = selectedTags.map((tag: Tag) => tag.uid);
		const stateTagUids = stateFilters.tags?.map((tag: Tag) => tag.uid) || [];
		if (selectedTagUids.length !== stateTagUids.length) {
			return true;
		}
		for (const uid of selectedTagUids) {
			if (!stateTagUids.includes(uid)) {
				return true;
			}
		}
		return false;
	}

	return (
		<Stack spacing={1}>
		<Stack
		  spacing={2}
		>
			<Tags
				selectedTags={selectedTags}
				onAddTag={onAddTag}
				onDeleteTag={onDeleteTag}
				allOrAny={allOrAny}
				onSelectAllOrAnyTags={onSelectAllOrAnyTags}
			></Tags>
			<Sorting
				ascOrDesc={ascOrDesc}
				onSelectAscOrDesc={onSelectAscOrDesc}
				onSetAscOrDesc={(newValue) => {if (newValue) {setAscOrDesc(newValue);}}}
				selectedMetric={selectedMetric}
				onSelectMetric={onSelectMetric}
			>
			</Sorting>
			</Stack>
			<Button
          variant="solid"
          disabled={!enableSearchButton()}
          onClick={() => {
          	dispatch(setTSFilters({
          		tags: selectedTags,
          		allOrAnyTags: allOrAny,
          		metric: selectedMetric,
          		ascOrDesc: ascOrDesc,
          		page: 0,
          		perPageCount: stateFilters.perPageCount || (((width < 640) || (height < 640))?3:5)
          	}));
          	dispatch(clearSingleTSCache({}));
          	dispatch(fetchTS());
          }}
        >Search</Button>
		</Stack>
	);
}

export default FilteredSearch;