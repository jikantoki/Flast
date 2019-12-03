import React, { Component } from 'react';
import { BrowserRouter, Route, Link as RouterLink, Switch as RouterSwitch } from 'react-router-dom';

import PropTypes from 'prop-types';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import AppBar from '@material-ui/core/AppBar';
import CSSBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import PublicIcon from '@material-ui/icons/PublicOutlined';

import HomeIcon from '@material-ui/icons/HomeOutlined';
import HistoryIcon from '@material-ui/icons/HistoryOutlined';
import DownloadsIcon from '@material-ui/icons/GetAppOutlined';
import BookmarksIcon from '@material-ui/icons/BookmarksOutlined';
import AppsIcon from '@material-ui/icons/AppsOutlined';
import ShopIcon from '@material-ui/icons/ShopOutlined';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import HelpIcon from '@material-ui/icons/HelpOutlineOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';

import SupervisorAccountOutlinedIcon from '@material-ui/icons/SupervisorAccountOutlined';
import PaletteOutlinedIcon from '@material-ui/icons/PaletteOutlined';
import SecurityOutlinedIcon from '@material-ui/icons/SecurityOutlined';
import TabOutlinedIcon from '@material-ui/icons/TabOutlined';
import PowerSettingsNewOutlinedIcon from '@material-ui/icons/PowerSettingsNewOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import WebOutlinedIcon from '@material-ui/icons/WebOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import TranslateOutlinedIcon from '@material-ui/icons/TranslateOutlined';

const lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    },
});
const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    },
});

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('md')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('md')]: {
            zIndex: theme.zIndex.drawer + 1
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    title: {
        flexGrow: 1,
        userSelect: 'none',
        pointerEvents: 'none'
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    link: {
        color: 'inherit',
        textDecoration: 'none'
    },
    content: {
        width: `calc(100% - ${drawerWidth}px)`,
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    contentSettings: {
        width: `calc(100% - ${drawerWidth}px)`,
        height: '100vh',
        flexGrow: 1,
        paddingTop: theme.spacing(3),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
});

function ElevationScroll(props) {
    const { children, window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
        target: window ? window() : undefined,
    });

    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0,
    });
}

ElevationScroll.propTypes = {
    children: PropTypes.element.isRequired,
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window: PropTypes.func,
};

class NavigationBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            mobileOpen: false
        };
    }

    componentDidMount = () => {
        if ('settings' === window.location.host) {
            this.setState(state => ({ open: true }));
        }
    }

    handleNestedListClick = () => {
        this.setState(state => ({ open: !state.open }));
    }

    handleDrawerToggle = () => {
        this.setState(state => ({ mobileOpen: !state.mobileOpen }));
    }

    render() {
        const { classes, theme } = this.props;

        const drawer = (
            <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                <Hidden mdUp implementation="css">
                    <List>
                        <ListItem>
                            <ListItemIcon><PublicIcon /></ListItemIcon>
                            <ListItemText primary="Flast" style={{ userSelect: 'none', pointerEvents: 'none' }} />
                        </ListItem>
                    </List>
                    <Divider />
                </Hidden>
                <Hidden smDown implementation="css">
                    <div className={classes.toolbar} />
                </Hidden>
                {!window.location.href.startsWith('flast://settings/') ?
                    <div>
                        <List>
                            <a className={classes.link} href={window.getButtonStartPage()} >
                                <ListItem button selected={'flast://home/' === window.location.href}>
                                    <ListItemIcon><HomeIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.home} />
                                </ListItem>
                            </a>
                        </List>
                        <Divider />
                        <List>
                            <a className={classes.link} href="flast://bookmarks/">
                                <ListItem button selected={window.location.href.startsWith('flast://bookmarks/')}>
                                    <ListItemIcon><BookmarksIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.bookmarks} />
                                </ListItem>
                            </a>
                            <a className={classes.link} href="flast://history/">
                                <ListItem button selected={window.location.href.startsWith('flast://history/')}>
                                    <ListItemIcon><HistoryIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.history} />
                                </ListItem>
                            </a>
                            <a className={classes.link} href="flast://downloads/">
                                <ListItem button selected={window.location.href.startsWith('flast://downloads/')}>
                                    <ListItemIcon><DownloadsIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.downloads} />
                                </ListItem>
                            </a>
                        </List>
                        <Divider />
                        <List>
                            <a className={classes.link} href="flast://apps/">
                                <ListItem button selected={window.location.href.startsWith('flast://apps/')}>
                                    <ListItemIcon><AppsIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.app} />
                                </ListItem>
                            </a>
                            <a className={classes.link}>
                                <ListItem button disabled>
                                    <ListItemIcon><ShopIcon /></ListItemIcon>
                                    <ListItemText primary="Flast Store" />
                                </ListItem>
                            </a>
                        </List>
                        <Divider />
                        <List>
                            <a className={classes.link} href="flast://settings/">
                                <ListItem button selected={window.location.href.startsWith('flast://settings/') && window.location.href.endsWith('#about')}>
                                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.settings} />
                                </ListItem>
                            </a>
                            <a className={classes.link} href="flast://help/">
                                <ListItem button selected={window.location.href.startsWith('flast://help/')}>
                                    <ListItemIcon><HelpIcon /></ListItemIcon>
                                    <ListItemText primary={window.getLanguageFile().internalPages.navigationBar.help} />
                                </ListItem>
                            </a>
                        </List>
                        <Divider />
                        <List>
                            <a className={classes.link} href="flast://settings/about">
                                <ListItem button selected={'flast://settings/about' === window.location.href}>
                                    <ListItemIcon><InfoIcon /></ListItemIcon>
                                    <ListItemText primary={`${window.getAppName()} について`} />
                                </ListItem>
                            </a>
                        </List>
                    </div>
                    :
                    <div>
                        <List>
                            <RouterLink className={classes.link} to="/">
                                <ListItem button selected={window.location.href === 'flast://settings/'}>
                                    <ListItemIcon><SupervisorAccountOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="ユーザー" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link} to="/design">
                                <ListItem button selected={window.location.href === 'flast://settings/design'}>
                                    <ListItemIcon><PaletteOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="デザイン" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link} to="/adBlock">
                                <ListItem button selected={window.location.href === 'flast://settings/adBlock'}>
                                    <ListItemIcon><SecurityOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="広告ブロック" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link} to="/homePage">
                                <ListItem button selected={window.location.href === 'flast://settings/homePage'}>
                                    <ListItemIcon><TabOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="ホームページ" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link} to="/startUp">
                                <ListItem button selected={window.location.href === 'flast://settings/startUp'}>
                                    <ListItemIcon><PowerSettingsNewOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="起動時" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link} to="/search">
                                <ListItem button selected={window.location.href === 'flast://settings/search'}>
                                    <ListItemIcon><SearchOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="検索エンジン" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link}>
                                <ListItem button disabled>
                                    <ListItemIcon><LockOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="プライバシー" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link} to="/pageSettings">
                                <ListItem button selected={window.location.href === 'flast://settings/pageSettings'}>
                                    <ListItemIcon><WebOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="ページ設定" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link}>
                                <ListItem button disabled>
                                    <ListItemIcon><GetAppOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="ダウンロード" />
                                </ListItem>
                            </RouterLink>
                            <RouterLink className={classes.link}>
                                <ListItem button disabled>
                                    <ListItemIcon><TranslateOutlinedIcon /></ListItemIcon>
                                    <ListItemText primary="言語" />
                                </ListItem>
                            </RouterLink>
                        </List>
                        <Divider />
                        <List>
                            <RouterLink className={classes.link} to="/about">
                                <ListItem button selected={window.location.href === 'flast://settings/about'}>
                                    <ListItemIcon><InfoIcon /></ListItemIcon>
                                    <ListItemText primary={`${window.getAppName()} について`} />
                                </ListItem>
                            </RouterLink>
                        </List>
                    </div>
                }
            </ThemeProvider>
        );

        return (
            <React.Fragment>
                <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                    <div className={classes.root}>
                        <CSSBaseline />
                        <ElevationScroll {...this.props}>
                            <AppBar position="fixed" className={classes.appBar}>
                                <Toolbar>
                                    <IconButton
                                        color="inherit"
                                        aria-label="Open drawer"
                                        edge="start"
                                        onClick={this.handleDrawerToggle}
                                        className={classes.menuButton}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Typography variant="h6" noWrap className={classes.title}>{this.props.title}</Typography>
                                    {this.props.buttons ? <div>{this.props.buttons}</div> : null}
                                </Toolbar>
                            </AppBar>
                        </ElevationScroll>
                        <nav className={classes.drawer}>
                            <Hidden mdUp implementation="css">
                                <Drawer
                                    container={this.props.container}
                                    variant="temporary"
                                    open={this.state.mobileOpen}
                                    onClose={this.handleDrawerToggle}
                                    classes={{ paper: classes.drawerPaper }}
                                    ModalProps={{ keepMounted: true }}
                                >
                                    {drawer}
                                </Drawer>
                            </Hidden>
                            <Hidden smDown implementation="css">
                                <Drawer
                                    classes={{ paper: classes.drawerPaper }}
                                    variant="permanent"
                                    open
                                >
                                    {drawer}
                                </Drawer>
                            </Hidden>
                        </nav>
                        <main className={!window.location.href.startsWith('flast://settings/') ? classes.content : classes.contentSettings}>
                            {!window.location.href.startsWith('flast://settings/') ? <div className={classes.toolbar} /> : null}
                            <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                                {this.props.children}
                            </ThemeProvider>
                        </main>
                    </div>
                </ThemeProvider>
            </React.Fragment>
        );
    }
}

NavigationBar.propTypes = {
    classes: PropTypes.object.isRequired,
    container: PropTypes.object,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(NavigationBar);