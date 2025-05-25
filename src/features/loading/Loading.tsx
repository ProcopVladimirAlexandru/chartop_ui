import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';

import { CircularProgressSizesType } from '../../types/ui';

function Loading({message, circularProgress=true, progressSize="lg", width="100%", border=1.618, borderRadius=7, borderColor="#ff9d25"}:
	{message: string; circularProgress?: boolean; progressSize?: CircularProgressSizesType; width?: string | number; border?: number; borderRadius?: number; borderColor?: string;}
) {
	return (
		<Sheet
			sx={{
				border: border,
			  borderRadius: borderRadius,
			  borderColor: borderColor,
			  width: width
			}}
		>
		<Stack
			justifyContent="center"
      alignItems="center"
      p={3}
    >
			{circularProgress &&
				<CircularProgress variant="solid" size={progressSize}>
				</CircularProgress>
			}
			{
				message?
				<Typography sx={{wordBreak: "break-word"}} noWrap={false} level="h4" pt={2}>{message}</Typography>:<></>
			}
		</Stack>
		</Sheet>
	);
}

export default Loading;