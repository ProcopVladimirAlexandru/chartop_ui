import Link from '@mui/joy/Link';
// import Button from '@mui/joy/Button';  // for login
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import Grid from '@mui/joy/Grid';
// import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import AspectRatio from '@mui/joy/AspectRatio';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
// import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { SxProps } from '@mui/system';
import { useColorScheme } from '@mui/joy/styles';
// import DirectionsRunOutlinedIcon from '@mui/icons-material/DirectionsRunOutlined';  // for login
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';

import { useWindowDimensions } from '../../utils/utils'
import { Page } from '../../App';
import log_concentrated from '../../assets/log_concentrated.png';


// @ts-ignore
function Header({selectedPageUid, setSelectedPageUid, pages, sx}: {selectedPageUid: string; setSelectedPageUid: Function; pages: Array<Page>; sx: SxProps;}) {
  const { mode, setMode } = useColorScheme();
  const { width } = useWindowDimensions();

  const linkLevel = "body-md";
  const linkColorSelected = "#ffffff";
  const linkColorRest = "#ff9d25";

  function getSpreadLinks() {
    return (
      <Grid container justifyContent="center" alignItems="center">
      {pages.filter(page => !!page.headerLinkText).map(page =>
      <Grid key={page.uid}>
      <Link
        underline="none"
        component="button"
        level={linkLevel}
        onClick={() => setSelectedPageUid(page.uid)}
        sx={{paddingLeft:1, paddingRight:1}}>
        <Typography
          fontWeight="xl"
          level="body-lg"
          sx={{textUnderlineOffset: "5px", textDecoration: (page.uid===selectedPageUid)?"underline 0px none currentcolor":"none", color: (page.uid===selectedPageUid)?linkColorSelected:linkColorRest, borderRadius: 'md', marginLeft: 0}}>
          {/*{(page.uid===selectedPageUid)?<KeyboardArrowRightRoundedIcon sx={{color: linkColorSelected, padding: 0, margin: 0}}/>*/}
          {page.headerLinkText}
        </Typography>
      </Link>
      </Grid>
      )}</Grid>);
  }

  function getMenuLinks() {
    const linkColorSelected = mode==="dark"?"#ffffff":"#000000'"
    const menuItems = pages.filter(page => !!page.headerLinkText).map(page =>
      <MenuItem key={page.uid} variant="soft" onClick={() => setSelectedPageUid(page.uid)}>
        <Link
          component="button"
          level={linkLevel}
        >
          <Typography
            level="h4"
            sx={{color: (page.uid===selectedPageUid)?linkColorSelected:linkColorRest, borderRadius: 'md', marginLeft: 0}}>
            {page.headerLinkText}
          </Typography>
        </Link>
        </MenuItem>
        );
      return (
      <Dropdown>
        <MenuButton
          sx={{backgroundColor:"white"}}
          >
          <MenuIcon sx={{color:"#ff9d25"}}/>
        </MenuButton>
        <Menu
          variant="soft">
          {menuItems}
        </Menu>
      </Dropdown>)
  }

  let links;
  if (width < 700) {
    links = getMenuLinks();
  }
  else {
    links = getSpreadLinks();
  }

  return (
    <Sheet sx={{ p: 1, backgroundColor: '#3ca8de', top: 0, 'z-index': 1000, opacity: 1 }}>
      <Grid container direction="row" justifyContent="space-between">
        <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid>
        <Link onClick={() => setSelectedPageUid('top')}>
        <AspectRatio objectFit="fill" sx={{ width: 80 }} variant="plain">
          <img
            src={log_concentrated}
            alt="Logo is missing."
            onError={(_error)=>{console.error("Count not find logo :(");}}
          />
        </AspectRatio>
        </Link>
        </Grid>
        <Grid>
        {links}
        </Grid>
        </Grid>
        <Grid container direction="row" justifyContent="space-around" alignItems="center" spacing={0}>
        {/*<Grid>
        <Button
          variant="soft"
          sx={{background: linkColorSelected, color: linkColorRest, height: "100%"}}
          startDecorator={<DirectionsRunOutlinedIcon/>}
          onClick={() => setSelectedPageUid('login')}> Log In
        </Button>
        </Grid>*/}
        {/*<Switch
          size="lg"
          sx={{"--Switch-gap": "3px"}}
          endDecorator={
            <LightbulbRoundedIcon sx={{fontSize: "xlarge", color: "white"}}/>
          }
          checked={mode === "light"}
          onChange={(event) => setMode(event.target.checked?"light":"dark")}>
        </Switch>*/}
        {/*@ts-ignore*/}
        <Grid>
        <Dropdown>
        {/*@ts-ignore*/}
        <MenuButton variant={null} size="lg">
          <RestaurantOutlinedIcon sx={{color: "white"}}/>
        </MenuButton>
        <Menu variant="soft">
          <MenuItem key='buymeacoffee' variant="soft">
            <Link
              href="https://www.buymeacoffee.com/chartop"
              level="body-lg"
              startDecorator={<LocalCafeOutlinedIcon/>}>
              Buy Us a Tea!
            </Link>
          </MenuItem>
          <MenuItem key='paypal' variant="soft">
            <Link
              href="https://www.paypal.com/donate/?hosted_button_id=UL5HW39F72K5S"
              level="body-lg"
              startDecorator={<PaymentOutlinedIcon/>}>
              PayPal
            </Link>
          </MenuItem>
        </Menu>
        </Dropdown>
        </Grid>
        <Grid>
        {/*@ts-ignore*/}
        <IconButton size="lg" variant={null}>
          { mode === "light"?
            <NightsStayIcon sx={{color: "white"}} onClick={(_event) => setMode("dark")}/>:
            <WbSunnyIcon sx={{color: "white"}} onClick={(_event) => setMode("light")}/>
          }
        </IconButton>
        </Grid>
      </Grid>
      </Grid>
    </Sheet>
  );
}

export default Header;