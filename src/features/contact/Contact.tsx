import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';


function About() {
  return (
    <Card sx={{m: 2, borderColor: "#ff9d25"}}>
      <Typography level="h1">Contact Us</Typography>
      <Typography level="body-md" sx={{pb: 0, mb: 0}}>
      For a tailored Chartop deployment that reveals the most interesting aspects of your data, please reach out at:
      </Typography>
      <List sx={{pt: 0, mt: 0}}>
        {/*<ListItem sx={{pt: 0, mt: 0}}><ListItemDecorator><EmailOutlinedIcon sx={{color: 'orange'}}/></ListItemDecorator>
        <ListItemContent>
        <Link href="mailto:chartop@gmail.com" underline="hover">chartop@gmail.com</Link>
        </ListItemContent>
        </ListItem>*/}
        <ListItem><ListItemDecorator><EmailOutlinedIcon sx={{color: 'orange'}}/></ListItemDecorator>
        <ListItemContent>
        <Link href="mailto:chartop@protonmail.com" underline="hover">chartop-app@protonmail.com</Link>
        </ListItemContent>
        </ListItem>
      </List>
      <Typography level="body-md" sx={{pb: 0, mb: 0}}>
      Any questions regarding the web application, API or dataset are also welcome.<br></br>
      Thank you!
      </Typography>
    </Card>
  );
}

export default About;