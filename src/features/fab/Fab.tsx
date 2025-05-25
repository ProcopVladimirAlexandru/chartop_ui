import { useState, useEffect } from 'react';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';

function Fab() {
	const [show, setShow] = useState(false);
	const handleScroll = () => {
    setShow(window.pageYOffset > 50);
	};
	useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
	}, []);

	return (
		<Sheet sx={{display: show?'flex':'none', borderRadius: 100, position: 'fixed', backgroundColor: '#3ca8de', top: '90%', left: '90%', 'z-index': 1000, opacity: 1 }}>
		{/*@ts-ignore*/}
		<Dropdown variant={null}>
		<MenuButton sx={{p: 2, border: 0}} size="lg">
			<RestaurantOutlinedIcon sx={{color: "white"}}/>
		</MenuButton>
		<Menu
      variant="soft">
      <MenuItem key='paypal' variant="soft">
          <Link
            component="button"
            level="body-md"
            startDecorator={<PaymentOutlinedIcon/>}
          >
            <Typography
              level="body-lg"
              sx={{borderRadius: 'md', marginLeft: 0}}>
              PayPal
            </Typography>
          </Link>
          </MenuItem>
    </Menu>
		</Dropdown>
		</Sheet>
	);
}

export default Fab;