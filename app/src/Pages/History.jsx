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

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            historys: [],
            isOnline: true,
            isDialogOpened: false
        };
    }

    componentDidMount = () => {
        document.title = window.getLanguageFile().internalPages.navigationBar.history;

        window.getHistorys().then((data) => {
            this.setState({ historys: data });
        });

        window.isOnline().then((result) => {
            this.setState({ isOnline: result });
        })
        setInterval(() => {
            window.isOnline().then((result) => {
                if (!this.state.isOnline && result) {
                    window.getHistorys().then((data) => {
                        this.setState({ historys: data });
                    });
                }
                
                this.setState({ isOnline: result });
            })
        }, 1000 * 5);
    }

    componentWillReceiveProps = () => {
        document.title = window.getLanguageFile().internalPages.navigationBar.history;
        
        window.getHistorys().then((data) => {
            this.setState({ historys: data });
        });

        window.isOnline().then((result) => {
            this.setState({ isOnline: result });
        });
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.history.title} buttons={[<Button color="inherit" onClick={() => { this.setState({ isDialogOpened: true }); }}>{window.getLanguageFile().internalPages.history.clear}</Button>]}>
                {this.state.isOnline ?
                    <Paper className={classes.root}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.tableIcon2}></TableCell>
                                    <TableCell className={classes.tableTitle2}>{window.getLanguageFile().internalPages.history.table.title}</TableCell>
                                    <TableCell className={classes.tableUrl2}>{window.getLanguageFile().internalPages.history.table.url}</TableCell>
                                    <TableCell className={classes.tableDate2}>{window.getLanguageFile().internalPages.history.table.date}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.historys.map((item, i) => (
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
                            <Typography variant="subtitle1">現在オフラインです。履歴を表示することはできません。</Typography>
                        </div>
                    </div>
                }
                <Dialog
                    open={this.state.isDialogOpened}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">閲覧履歴の削除</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            これまで閲覧した閲覧履歴をすべて削除します。<br />
                            <b>続行</b>を押すと閲覧履歴が削除されます。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose} style={{ marginRight: 5 }}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { this.setState({ isDialogOpened: false }); window.clearHistorys(true); window.location.reload(); }}>
                            続行
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

History.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withStyles(styles)(History);

render(
    <Page />,
    document.getElementById('app')
);