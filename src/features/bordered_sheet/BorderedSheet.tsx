import {ReactNode} from 'react';
import Sheet from '@mui/joy/Sheet';

function BorderedSheet({children}: { children: Array<ReactNode> | ReactNode }) {
	return (
		<Sheet sx={{
			border: 1.618, //  maybe make it 2
			borderRadius: 7,
			borderColor: "#ff9d25"
		}}>
		{children}
		</Sheet>
	);
}

export default BorderedSheet;