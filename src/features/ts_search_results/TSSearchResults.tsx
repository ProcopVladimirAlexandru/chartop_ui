import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Grid from '@mui/joy/Grid';
import {useEffect, useRef} from 'react';
import { useSelector } from 'react-redux';

import BorderedSheet from '../bordered_sheet/BorderedSheet';
import OneTimeseries from '../one_timeseries/OneTimeseries';
import TSPagination from '../ts_pagination/TSPagination';
import Loading from '../loading/Loading';
import AppError from '../errors/AppError';
import { selectFilteredChartopEntriesCache, selectTSStatus, selectTSResult } from '../../redux/tsSlice';
import { selectPage, selectPerPageCount } from '../../redux/tsFiltersSlice';


function TSSearchResults() {
  const fetchChartopResult = useSelector(selectFilteredChartopEntriesCache);
  const page = useSelector(selectPage);
  const perPageCount = useSelector(selectPerPageCount);
  const tsStatus = useSelector(selectTSStatus);
  const reduxResult = useSelector(selectTSResult);
  const paginationRef = useRef(null);

  useEffect(() => {
    if (paginationRef.current) {
      // @ts-ignore
      paginationRef.current.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }, [fetchChartopResult, page, perPageCount]);

  if ((!page && page != 0) || !perPageCount) {
    return <></>;
  }

  if (page === Number(import.meta.env.VITE_APP_MAX_ALLOWED_PAGE)) {
    const paginationElement = (<TSPagination lastPage={true}></TSPagination>);
    return (
      <Stack>
        {paginationElement}
        <BorderedSheet>
          <Typography p={2} level="h3">
            {`Only ${Number(import.meta.env.VITE_APP_MAX_ALLOWED_PAGE) + 1} pages of results are available for a search at this time.`}
          </Typography>
        </BorderedSheet>
      </Stack>);
  }

  if (tsStatus === 'error') {
    return (<AppError code={reduxResult?.code} message={reduxResult?.message}></AppError>);
  }
  else if (tsStatus === 'initial') {
    return (<></>);
  }  
  else if (tsStatus === 'loading') {
    return (<Loading message="Fetching charts ..."></Loading>);
  }

  const tsElementsJSX = [];
  const data = fetchChartopResult;
  if (!data || !Array.isArray(data.chartop_entries)) {
    return (<AppError message="Encountered unexpected data format. Something is wrong ..."></AppError>);
  }
  if (data.chartop_entries.length === 0 && page === 0) {
    return (
      <BorderedSheet>
        <Typography level="h4" p={2}>
          There were no results matching your search.
        </Typography>
      </BorderedSheet>);
  }

  // TODO integrate binary starting here at least
  // actually should be in the API call and resulting types BUT this is a good starting place to look
  for (let i = 0; i < data.chartop_entries.length; ++i) {
    tsElementsJSX.push((
      <Grid key={i}>
      <OneTimeseries
        index={page*perPageCount + i}
        entry={data.chartop_entries[i]}
      >
      </OneTimeseries>
      </Grid>
    ));
  }

  const paginationElement = ( 
    <TSPagination
      lastPage={tsElementsJSX?.length === 0}
    ></TSPagination>);

  if (tsElementsJSX.length === 0 && page > 0) {
    return (
      <Stack>
        {paginationElement}
        <BorderedSheet>
          <Typography p={2} level="h3">
            No more results to show
          </Typography>
        </BorderedSheet>
        {paginationElement}
      </Stack>);
  }
  return (
    <Grid
      container={true}
      spacing={2}
      direction="column"
      ref={paginationRef}
    >
      <Grid>
      {paginationElement}
      </Grid>
        {tsElementsJSX}
      <Grid>
      {paginationElement}
      </Grid>
    </Grid>);
}


export default TSSearchResults;
