import Grid from '@mui/joy/Grid';
import { useEffect } from 'react';

import FilteredSearch from '../filtered_search/FilteredSearch';
import Loading from '../loading/Loading';
import TSSearchResults from '../ts_search_results/TSSearchResults';

import { useSelector, useDispatch } from 'react-redux';
import { selectTagsStatus, fetchTags } from '../../redux/tagsSlice';
import { selectMetricsStatus, fetchMetrics } from '../../redux/metricsSlice';
import { AppDispatch } from '../../redux/store';
import { useWindowDimensions } from '../../utils/utils';


function Top() {
  const dispatch = useDispatch<AppDispatch>();
  const tagsStatus = useSelector(selectTagsStatus);
  const metricsStatus = useSelector(selectMetricsStatus);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (tagsStatus === 'initial') {
      dispatch(fetchTags());
    }
  }, [dispatch, tagsStatus]);

  useEffect(() => {
    if (metricsStatus === 'initial') {
      dispatch(fetchMetrics());
    }
  }, [dispatch, metricsStatus]);

  // 95vw pana la 500px apoi liniar descrescator pana la 35vw la 1920px
  const maxFilteringWidth = 95;
  const minFilteringWidth = 40;
  const maxScreenWidth = 1600;
  const minScreenWidth = 500;
  let filteringWidth = "35vw";
  if (width <= minScreenWidth) {
    filteringWidth = "95vw";
  }
  else if (width >= maxScreenWidth) {
    filteringWidth = "35vw";
  }
  else {
    filteringWidth = (maxFilteringWidth - ( width - minScreenWidth )*(maxFilteringWidth-minFilteringWidth)/( maxScreenWidth - minScreenWidth )).toString() + "vw"
  }

  return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={0} // this makes the page go out of bounds ...
        mt={5}
        px={0.5}
        direction="column"
      >
      {(metricsStatus === 'success' && tagsStatus === 'success')?
      <>
      <Grid sx={{width: filteringWidth}}>
      <FilteredSearch/>
      </Grid>

      <Grid sx={{paddingTop: 5, paddingLeft: 3, paddingRight: 3}}>
      <TSSearchResults/>
      </Grid>
      </>:
      <Grid>
      <Loading message="Fetching tags and metrics ...">
      </Loading>
      </Grid>
    }
      </Grid>
  );
}


export default Top;
