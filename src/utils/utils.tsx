import { useState, useEffect } from 'react';


export function getDimensions(): {width: number; height: number;} {
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

export function useWindowDimensions() {
	const [ windowDimensions, setWindowDimensions ] = useState(getDimensions());
	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getDimensions());
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	return windowDimensions;
}

export const FRED_DATA_SOURCE_UID = "federal_reserve";
export const BASE_FRED_LINK = "https://fred.stlouisfed.org/series";