import React, { Component } from 'react';
import { render } from 'react-dom';
import Moment from 'react-moment';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

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

import Button from '@material-ui/core/Button';

import CloudOffIcon from '@material-ui/icons/CloudOffOutlined';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import NavigationBar from './Components/NavigationBar.jsx';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
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
        width: 20,
        whiteSpace: 'nowrap',
        padding: '14px 16px',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableTitle2: {
        width: '55%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableUrl2: {
        width: '45%',
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
    }
});

class Bookmarks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookMarks: [],
            privMarks: [],
            isExpanded: 'bookMarks',
            isOnline: true,
            isDialogOpened: false
        };
    }

    componentDidMount = () => {
        document.title = window.getLanguageFile().internalPages.navigationBar.bookmarks;

        window.getBookmarks(true).then((data1) => {
            this.setState({ privMarks: data1 });

            window.getBookmarks(false).then((data2) => {
                this.setState({ bookMarks: data2 });
            });
        });

        window.isOnline().then((result) => {
            this.setState({ isOnline: result });
        });
        setInterval(() => {
            window.isOnline().then((result) => {
                if (!this.state.isOnline && result) {
                    window.getBookmarks(true).then((data1) => {
                        this.setState({ privMarks: data1 });

                        window.getBookmarks(false).then((data2) => {
                            this.setState({ bookMarks: data2 });
                        });
                    });
                }

                this.setState({ isOnline: result });
            })
        }, 1000 * 5);
    }

    componentWillReceiveProps = () => {
        document.title = window.getLanguageFile().internalPages.navigationBar.bookmarks;
        
        window.getBookmarks(true).then((data1) => {
            this.setState({ privMarks: data1 });

            window.getBookmarks(false).then((data2) => {
                this.setState({ bookMarks: data2 });
            });
        });

        window.isOnline().then((result) => {
            this.setState({ isOnline: result });
        });
    }

    handleChange = (panel) => (e, isExpanded) => {
        this.setState({ isExpanded: isExpanded ? panel : false });
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.bookmarks.title} buttons={[<Button color="inherit" onClick={() => { this.setState({ isDialogOpened: true }); }}>{window.getLanguageFile().internalPages.bookmarks.clear}</Button>]}>
                {this.state.isOnline ?
                    window.navigator.userAgent.indexOf('PrivMode') !== -1 ?
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
                                                    <TableCell className={classes.tableIcon2}></TableCell>
                                                    <TableCell className={classes.tableTitle2}>{window.getLanguageFile().internalPages.bookmarks.table.title}</TableCell>
                                                    <TableCell className={classes.tableUrl2}>{window.getLanguageFile().internalPages.bookmarks.table.url}</TableCell>
                                                    <TableCell className={classes.tableDate2}>{window.getLanguageFile().internalPages.bookmarks.table.date}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.privMarks.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === 'flast:' ? 'flast-file:///public.svg' : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
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
                                                    <TableCell className={classes.tableIcon2}></TableCell>
                                                    <TableCell className={classes.tableTitle2}>{window.getLanguageFile().internalPages.bookmarks.table.title}</TableCell>
                                                    <TableCell className={classes.tableUrl2}>{window.getLanguageFile().internalPages.bookmarks.table.url}</TableCell>
                                                    <TableCell className={classes.tableDate2}>{window.getLanguageFile().internalPages.bookmarks.table.date}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.bookMarks.map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === 'flast:' ? 'flast-file:///public.svg' : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
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
                        <Paper className={classes.root}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.tableIcon2}></TableCell>
                                        <TableCell className={classes.tableTitle2}>{window.getLanguageFile().internalPages.bookmarks.table.title}</TableCell>
                                        <TableCell className={classes.tableUrl2}>{window.getLanguageFile().internalPages.bookmarks.table.url}</TableCell>
                                        <TableCell className={classes.tableDate2}>{window.getLanguageFile().internalPages.bookmarks.table.date}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.bookMarks.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === 'flast:' ? 'flast-file:///public.svg' : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                            <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                            <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                            <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    :
                    <div className={classes.topImage} style={{ display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', height: 'calc(100vh - 75%)' }}>
                        <div style={{
                            display: 'flex',
                            flexFlow: 'column nowrap',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <CloudOffIcon color="action" style={{ fontSize: 140, marginBottom: 10 }} />
                            <Typography variant="h6">オフライン</Typography>
                            <Typography variant="subtitle1">現在オフラインです。ブックマークを表示することはできません。</Typography>
                        </div>
                    </div>
                }
                <Dialog
                    open={this.state.isDialogOpened}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">ブックマークの削除</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            これまで登録したブックマークをすべて削除します。<br />
                            <b>続行</b>を押すとブックマークが削除されます。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose} style={{ marginRight: 5 }}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { this.setState({ isDialogOpened: false }); window.clearBookmarks(true); window.location.reload(); }}>
                            続行
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

Bookmarks.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withStyles(styles)(Bookmarks);

render(
    <Page />,
    document.getElementById('app')
);