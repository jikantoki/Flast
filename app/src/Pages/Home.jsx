import React, { Component } from 'react';
import { render } from 'react-dom';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import Moment from 'react-moment';
import throttle from 'lodash/throttle';
import PrettyScroll from 'pretty-scroll';

import PropTypes from 'prop-types';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import Container from '@material-ui/core/Container';
import { Grid } from '@material-ui/core';

import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

import SearchIcon from '@material-ui/icons/Search';
import SendIcon from '@material-ui/icons/Send';

import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import HomeIcon from '@material-ui/icons/HomeOutlined';
import HistoryIcon from '@material-ui/icons/HistoryOutlined';
import DownloadsIcon from '@material-ui/icons/GetAppOutlined';
import BookmarksIcon from '@material-ui/icons/BookmarksOutlined';
import AppsIcon from '@material-ui/icons/AppsOutlined';
import ShopIcon from '@material-ui/icons/ShopOutlined';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import HelpIcon from '@material-ui/icons/HelpOutlineOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';

// import cssStyles from './Style.scss';

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

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

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    pageHeaderLight: {
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        marginBottom: '0.4rem',
        borderBottom: '1px solid #dee2e6',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    pageHeaderDark: {
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        marginBottom: '0.4rem',
        borderBottom: '1px solid rgba(81, 81, 81, 1)',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    topImage: {
        minHeight: '100%',
        backgroundSize: 'cover !important',
        backgroundAttachment: 'fixed !important',
        backgroundRepeat: 'no-repeat !important'
    },
    table: {
        tableLayout: 'fixed',
        whiteSpace: 'nowrap'
    },
    tableIcon: {
        width: 20,
        whiteSpace: 'nowrap',
        padding: '14px 16px',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableTitle: {
        width: '55%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableUrl: {
        width: '45%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableDate: {
        width: 150,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableIcon2: {
        width: '4%',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableTitle2: {
        width: '45%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableUrl2: {
        width: '35%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableStatus2: {
        width: '16%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableDate2: {
        width: 150,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    button: {
        margin: theme.spacing(1),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
});

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookMarks: [],
            privMarks: [],
            historys: [],
            downloads: [],
            topImageId: 1,
            inputText: '',
            inputType: false,
            isExpanded: 'bookMarks',
            isDialogOpened: false,
            scrollTop: 0
        };

        window.addEventListener('scroll', throttle((e) => {
            this.setState({
                scrollTop: document.documentElement.scrollTop
            });
        }, 100));
    }

    componentDidMount = () => {
        let now = new Date();
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = now - start;
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);
        if (day > 100 && day) {
            day = day.toString().slice(1, 3);
            this.setState({ topImageId: parseInt(day) });
        }

        window.getBookmarks(true).then((data1) => {
            this.setState({ privMarks: data1 });

            window.getBookmarks(false).then((data2) => {
                this.setState({ bookMarks: data2 });
            });
        });

        window.getHistorys().then((data) => {
            this.setState({ historys: data });
        });

        window.getDownloads().then((data) => {
            this.setState({ downloads: data });
        });

        document.title = window.getLanguageFile().internalPages.navigationBar.home;
    }

    handleChange = (panel) => (e, isExpanded) => {
        this.setState({ isExpanded: isExpanded ? panel : false });
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleKeydown = (e) => {
        let text = String(this.state.inputText);

        if (text.length === 0 || text == '') return;

        if (e.keyCode === 13) {
            if (this.isURL(text) && !text.includes('://')) {
                window.location.href = `http://${text}`;
            } else if (!text.includes('://')) {
                window.location.href = window.getSearchEngine().url.replace('%s', encodeURIComponent(text));
            } else {
                const pattern = /^(file:\/\/\S.*)\S*$/;

                if (pattern.test(text)) {
                    this.setState({ inputText: '' });
                } else {
                    window.location.href = text;
                }
            }
        } else {
            if (this.isURL(text) && !text.includes('://')) {
                this.setState({ inputType: true });
            } else if (!text.includes('://')) {
                this.setState({ inputType: false });
            } else {
                this.setState({ inputType: true });
            }
        }
    }

    isURL = (input) => {
        const pattern = /^((?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)|flast:\/\/\S.*)\S*$/;

        if (pattern.test(input)) {
            return true;
        }
        return pattern.test(`http://${input}`);
    }

    render() {
        const { classes } = this.props;

        return (
            <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                <main className="container" style={{ margin: 0, padding: 0, boxSizing: 'border-box', color: window.getThemeType() ? '#fff' : '#000000de', backgroundColor: window.getThemeType() ? '#303030' : '#fafafa' }}>
                    <div className={classes.topImage} style={{ display: window.getHomePageBackgroundType() !== -1 ? 'flex' : 'none', flexFlow: 'column nowrap', justifyContent: 'space-between', height: '100vh', background: `url(${window.getHomePageBackgroundType() === 0 ? `${protocolStr}://resources/photos/${this.state.topImageId}.jpg` : window.getHomePageBackgroundImage()})` }}>
                        <div style={{
                            display: 'flex',
                            margin: 15,
                            flexFlow: 'column nowrap',
                            justifyContent: 'center',
                            alignItems: 'flex-end'
                        }}>
                            <ButtonGroup variant="outlined" size="small" style={{ backgroundColor: window.getThemeType() ? '#303030' : '#fafafa', color: window.getThemeType() ? 'white' : 'black' }}>
                                <Button startIcon={<BookmarksIcon />} onClick={(e) => { window.location.href = `${protocolStr}://bookmarks`; }}>{window.getLanguageFile().internalPages.navigationBar.bookmarks}</Button>
                                <Button startIcon={<HistoryIcon />} onClick={(e) => { window.location.href = `${protocolStr}://history`; }}>{window.getLanguageFile().internalPages.navigationBar.history}</Button>
                                <Button startIcon={<DownloadsIcon />} onClick={(e) => { window.location.href = `${protocolStr}://downloads`; }}>{window.getLanguageFile().internalPages.navigationBar.downloads}</Button>
                                <Button startIcon={<SettingsIcon />} onClick={(e) => { window.location.href = `${protocolStr}://settings`; }}>{window.getLanguageFile().internalPages.navigationBar.settings}</Button>
                            </ButtonGroup>
                        </div>
                        <div style={{
                            display: 'flex',
                            margin: '0 auto',
                            height: '40%',
                            flexFlow: 'column nowrap',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <TextField
                                id="outlined-full-width"
                                placeholder="検索またはアドレスを入力"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                style={{
                                    width: '70vw',
                                    margin: 8,
                                    backgroundColor: window.getThemeType() ? '#303030' : '#fafafa',
                                    boxShadow: '0 5px 10px -3px rgba(0,0,0,.15), 0 0 3px rgba(0,0,0,.1)',
                                    borderRadius: 5,
                                    color: '#000000de !important'
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={this.state.inputText}
                                onChange={(e) => { this.setState({ inputText: e.target.value }); }}
                                onKeyDown={this.handleKeydown}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" >
                                                {this.state.inputType ? <SendIcon /> : <SearchIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            margin: '0 auto',
                            height: '45%',
                            flexFlow: 'column nowrap',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Button variant="contained" color="primary" className={classes.button} onClick={() => { window.scrollTo(0, window.innerHeight); }}>
                                <ArrowDownwardIcon className={classes.leftIcon} />
                                Send
                            </Button>
                        </div>
                    </div>
                    <div className={classes.topImage} style={{ position: 'sticky', transform: window.getHomePageBackgroundType() !== -1 ? (this.state.scrollTop > window.innerHeight * 0.5 ? 'translate(0px, 0px)' : 'translate(0px, -75px)') : 'none', display: window.getHomePageBackgroundType() !== -1 ? (this.state.scrollTop > window.innerHeight * 0.4 ? 'block' : 'none') : 'block', opacity: window.getHomePageBackgroundType() !== -1 ? (this.state.scrollTop > window.innerHeight * 0.5 ? 1 : 0) : 1, transition: 'all 500ms ease 0s', top: 0, background: `url(${window.getHomePageBackgroundType() === 0 ? `${protocolStr}://resources/photos/${this.state.topImageId}.jpg` : window.getHomePageBackgroundImage()})` }}>
                        <div style={{
                            display: 'flex',
                            margin: '0 auto',
                            height: '50%',
                            flexFlow: 'column nowrap',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <TextField
                                id="outlined-full-width"
                                placeholder="検索またはアドレスを入力"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                style={{
                                    width: '70vw',
                                    margin: 8,
                                    backgroundColor: window.getThemeType() ? '#303030' : '#fafafa',
                                    boxShadow: '0 5px 10px -3px rgba(0,0,0,.15), 0 0 3px rgba(0,0,0,.1)',
                                    borderRadius: 5,
                                    color: '#000000de !important'
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={this.state.inputText}
                                onChange={(e) => { this.setState({ inputText: e.target.value }); }}
                                onKeyDown={this.handleKeydown}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" >
                                                {this.state.inputType ? <SendIcon /> : <SearchIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                    <Grid container style={{ padding: '30px 0px 50px 0px' }}>
                        <Grid item xs={1} />
                        <Grid item xs={10}>
                            {navigator.userAgent.indexOf('PrivMode') !== -1 ?
                                <div>
                                    <ExpansionPanel expanded={this.state.isExpanded === 'privMarks'} onChange={this.handleChange('privMarks')}>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="privMarks-content"
                                            id="privMarks-header"
                                        >
                                            <Typography className={classes.heading}>プライベート ブックマーク</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Paper className={classes.root}>
                                                <Table className={classes.table}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell className={classes.tableIcon} style={{ userSelect: 'none', pointerEvents: 'none' }}></TableCell>
                                                            <TableCell className={classes.tableTitle} style={{ userSelect: 'none', pointerEvents: 'none' }}>タイトル</TableCell>
                                                            <TableCell className={classes.tableUrl} style={{ userSelect: 'none', pointerEvents: 'none' }}>URL</TableCell>
                                                            <TableCell className={classes.tableDate} style={{ userSelect: 'none', pointerEvents: 'none' }}>追加日時</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {this.state.privMarks.map((item, i) => (
                                                            <TableRow key={i}>
                                                                <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === `${protocolStr}:` ? `${fileProtocolStr}:///public.svg` : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                                <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Paper>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                    <ExpansionPanel expanded={this.state.isExpanded === 'bookMarks'} onChange={this.handleChange('bookMarks')}>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="bookMarks-content"
                                            id="bookMarks-header"
                                        >
                                            <Typography className={classes.heading}>ブックマーク</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Paper className={classes.root}>
                                                <Table className={classes.table}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell className={classes.tableIcon} style={{ userSelect: 'none', pointerEvents: 'none' }}></TableCell>
                                                            <TableCell className={classes.tableTitle} style={{ userSelect: 'none', pointerEvents: 'none' }}>タイトル</TableCell>
                                                            <TableCell className={classes.tableUrl} style={{ userSelect: 'none', pointerEvents: 'none' }}>URL</TableCell>
                                                            <TableCell className={classes.tableDate} style={{ userSelect: 'none', pointerEvents: 'none' }}>追加日時</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {this.state.bookMarks.map((item, i) => (
                                                            <TableRow key={i}>
                                                                <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === `${protocolStr}:` ? `${fileProtocolStr}:///public.svg` : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                                <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Paper>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                </div>
                                :
                                <div>
                                    <Typography className={window.getThemeType() ? classes.pageHeaderDark : classes.pageHeaderLight} component="h4">{window.getLanguageFile().internalPages.home.bookmarks.title}</Typography>
                                    <Paper className={classes.root}>
                                        <Table className={classes.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell className={classes.tableIcon} style={{ userSelect: 'none', pointerEvents: 'none' }}></TableCell>
                                                    <TableCell className={classes.tableTitle} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.bookmarks.table.title}</TableCell>
                                                    <TableCell className={classes.tableUrl} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.bookmarks.table.url}</TableCell>
                                                    <TableCell className={classes.tableDate} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.bookmarks.table.date}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.bookMarks.map((item, i) => {
                                                    if (i < 10) {
                                                        return (
                                                            <TableRow key={i}>
                                                                <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === `${protocolStr}:` ? `${fileProtocolStr}:///public.svg` : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                                <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                })}
                                                {this.state.bookMarks.length > 10 &&
                                                    <TableRow>
                                                        <TableCell className={classes.tableIcon} />
                                                        <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={`${protocolStr}://bookmarks`} title={window.getLanguageFile().internalPages.home.bookmarks.title} color="inherit">{window.getLanguageFile().internalPages.home.bookmarks.title}</Link></TableCell>
                                                        <TableCell className={classes.tableUrl} />
                                                        <TableCell className={classes.tableDate} />
                                                    </TableRow>
                                                }
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                </div>
                            }

                            <Typography className={window.getThemeType() ? classes.pageHeaderDark : classes.pageHeaderLight} component="h4">{window.getLanguageFile().internalPages.home.history.title}</Typography>
                            <Paper className={classes.root}>
                                <Table className={classes.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className={classes.tableIcon} style={{ userSelect: 'none', pointerEvents: 'none' }}></TableCell>
                                            <TableCell className={classes.tableTitle} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.history.table.title}</TableCell>
                                            <TableCell className={classes.tableUrl} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.history.table.url}</TableCell>
                                            <TableCell className={classes.tableDate} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.history.table.date}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.historys.map((item, i) => {
                                            if (i < 10) {
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === `${protocolStr}:` ? `${fileProtocolStr}:///public.svg` : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                        <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                        <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                        <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        })}
                                        {this.state.historys.length > 10 &&
                                            <TableRow>
                                                <TableCell className={classes.tableIcon} />
                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={`${protocolStr}://history`} title={window.getLanguageFile().internalPages.home.history.title} color="inherit">{window.getLanguageFile().internalPages.home.history.title}</Link></TableCell>
                                                <TableCell className={classes.tableUrl} />
                                                <TableCell className={classes.tableDate} />
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </Paper>

                            <Typography className={window.getThemeType() ? classes.pageHeaderDark : classes.pageHeaderLight} component="h4">{window.getLanguageFile().internalPages.home.downloads.title}</Typography>
                            <Paper className={classes.root}>
                                <Table className={classes.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className={classes.tableIcon2} style={{ userSelect: 'none', pointerEvents: 'none' }}></TableCell>
                                            <TableCell className={classes.tableTitle2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.downloads.table.title}</TableCell>
                                            <TableCell className={classes.tableUrl2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.downloads.table.url}</TableCell>
                                            <TableCell className={classes.tableStatus2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.downloads.table.status}</TableCell>
                                            <TableCell className={classes.tableDate2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{window.getLanguageFile().internalPages.home.downloads.table.date}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.downloads.map((item, i) => {
                                            if (i < 10) {
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell className={classes.tableIcon2}><img src={new URL(item.url).protocol === `${protocolStr}:` ? `${fileProtocolStr}:///public.svg` : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                        <TableCell component="th" scope="row" title={item.path} className={classes.tableTitle2}>{item.name}</TableCell>
                                                        <TableCell title={item.url} className={classes.tableUrl2}>{item.url}</TableCell>
                                                        <TableCell title={item.status} className={classes.tableStatus2}>{item.status}</TableCell>
                                                        <TableCell className={classes.tableDate2}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        })}
                                        {this.state.downloads.length > 10 &&
                                            <TableRow>
                                                <TableCell className={classes.tableIcon2} />
                                                <TableCell component="th" scope="row" className={classes.tableTitle2}><Link href={`${protocolStr}://downloads`} title={window.getLanguageFile().internalPages.home.downloads.title} color="inherit">{window.getLanguageFile().internalPages.home.downloads.title}</Link></TableCell>
                                                <TableCell className={classes.tableUrl2} />
                                                <TableCell className={classes.tableStatus2} />
                                                <TableCell className={classes.tableDate2} />
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid>
                        <Grid item xs={1} />
                    </Grid>
                </main>
            </ThemeProvider>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
    container: PropTypes.object,
    theme: PropTypes.object.isRequired,
};

const Page = withStyles(styles, { withTheme: true })(Home);

render(
    <Page />,
    document.getElementById('app')
);