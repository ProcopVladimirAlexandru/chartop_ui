import Grid from '@mui/joy/Grid';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import ButtonGroup from '@mui/joy/ButtonGroup';
import FirstPage from '@mui/icons-material/FirstPage';
import NavigateBefore from '@mui/icons-material/NavigateBefore';
import NavigateNext from '@mui/icons-material/NavigateNext';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import { useSelector, useDispatch } from 'react-redux';

import BorderedSheet from '../bordered_sheet/BorderedSheet';
import { useWindowDimensions } from '../../utils/utils'
import { selectPage, selectPerPageCount, setPage, setPerPageCount } from '../../redux/tsFiltersSlice';
import { fetchTS } from '../../redux/tsSlice';
import { AppDispatch } from '../../redux/store';


const PER_PAGE_COUNT_OPTIONS = [3, 5, 10];


function TSPagination({ lastPage }: {lastPage: boolean}) {
	const dispatch = useDispatch<AppDispatch>();
	const page = useSelector(selectPage) || 0;
  const perPageCount = useSelector(selectPerPageCount);
  const { width } = useWindowDimensions();

  const navigationChangeWidthLimit: number = 550;
	const perPageCountButtons = PER_PAGE_COUNT_OPTIONS.map( (count) => {
		return (
			<Button
				key={count}
				onClick={() => {dispatch(setPerPageCount(count)); dispatch(fetchTS());}}
				disabled={perPageCount === count}
			>
				{count}
			</Button>
		);
	}
	);

	return (
		<BorderedSheet>
		<Grid
			container
		  direction="row"
		  justifyContent="space-between"
		  alignItems="flex-start"
		>
	    <ButtonGroup>
	    { width < navigationChangeWidthLimit ?
			  <IconButton
			  	disabled={page === 0}
			  	onClick={() => {dispatch(setPage(0)); dispatch(fetchTS());}}
			  >
			  	<FirstPage sx={{fontSize: "xl"}}/>
			  </IconButton>:
			  <Button
			  	startDecorator={<FirstPage sx={{fontSize: "xl"}}/>}
			  	disabled={page === 0}
			  	onClick={() => {dispatch(setPage(0)); dispatch(fetchTS());}}
			  >
			  First</Button>
	  	}
			{ width < navigationChangeWidthLimit ?
				<IconButton
			  	disabled={page === 0}
			  	onClick={() => {dispatch(setPage(page - 1)); dispatch(fetchTS());}}
			  >
			  	<NavigateBefore sx={{fontSize: "xl"}}/>
			  </IconButton>:
				<Button
			  	startDecorator={<NavigateBefore sx={{fontSize: "xl"}}/>}
			  	disabled={page === 0}
			  	onClick={() => {dispatch(setPage(page - 1)); dispatch(fetchTS());}}
			  >
			  Previous</Button>
			}
			{ width < navigationChangeWidthLimit ?
				<IconButton
			  	disabled={lastPage}
			  	onClick={() => {dispatch(setPage(page + 1)); dispatch(fetchTS());}}
			  >
			  	<NavigateNext sx={{fontSize: "xl"}}/>
			  </IconButton>:
				<Button
			  	startDecorator={<NavigateNext sx={{fontSize: "xl"}}/>}
			  	disabled={lastPage}
			  	onClick={() => {dispatch(setPage(page + 1)); dispatch(fetchTS());}}
			  >
			  Next</Button>
			}
			  {/*TODO add backend support for negative pages: -1, -2 So that we can show Last Page button*/}
			  {/*<Button
			  	startDecorator={<LastPage />}
			  	disabled={lastPage}
			  	onClick={() => {onPageChange(totalPageCount - 1);}}
			  >
			  Last</Button>*/}
			</ButtonGroup>
			<ToggleButtonGroup variant="outlined">
			  {perPageCountButtons}
			</ToggleButtonGroup>
		</Grid>
    </BorderedSheet>
	);
}


export default TSPagination;
