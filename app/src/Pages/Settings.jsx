import React, { Component, forwardRef } from 'react';
import ReactDOM, { render } from 'react-dom';
import { BrowserRouter, Route, Link as RouterLink, Switch as RouterSwitch } from 'react-router-dom';
import { SnackbarProvider, withSnackbar } from 'notistack';
import { ChromePicker } from 'react-color';
import MaterialTable from 'material-table';

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import Popover from '@material-ui/core/Popover';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';

import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';

import PaletteIcon from '@material-ui/icons/PaletteOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';
import RestoreIcon from '@material-ui/icons/RestoreOutlined';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ReloadIcon from '@material-ui/icons/RefreshOutlined';
import ExpandLessIcon from '@material-ui/icons/ExpandLessOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreOutlined';

import VideoCameraIcon from '@material-ui/icons/VideocamOutlined';
import MicroPhoneIcon from '@material-ui/icons/MicNoneOutlined';
import GeolocationIcon from '@material-ui/icons/LocationOnOutlined';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import RadioIcon from '@material-ui/icons/RadioOutlined';
import LockIcon from '@material-ui/icons/LockOutlined';
import FullscreenIcon from '@material-ui/icons/FullscreenOutlined';
import LaunchIcon from '@material-ui/icons/LaunchOutlined';

import SyncIcon from '@material-ui/icons/SyncOutlined';
import ArrowBackIcon from '@material-ui/icons/ArrowBackOutlined';

import AddBoxIcon from '@material-ui/icons/AddBox';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CheckIcon from '@material-ui/icons/Check';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import FilterListIcon from '@material-ui/icons/FilterList';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import RemoveIcon from '@material-ui/icons/Remove';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import SearchIcon from '@material-ui/icons/Search';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';

import NavigationBar from './Components/NavigationBar.jsx';

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const styles = (theme) => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15)
    },
    button: {
        margin: theme.spacing(1),
    },
    formRoot: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200,
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    textFieldDense: {
        marginTop: theme.spacing(2),
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    snackBarClose: {
        padding: theme.spacing(0.5),
    },
    avatar: {
        margin: 10,
    },
    dialogRoot: {
        margin: 0,
        padding: theme.spacing(2),
    },
    containerRoot: {
        position: 'relative',
        top: 32,
        height: 'calc(100% - 32px)',
        [theme.breakpoints.up('md')]: {
            top: 40,
            height: 'calc(100% - 40px)'
        }
    },
    paperRoot: {
        padding: theme.spacing(3, 2),
        borderRadius: 0,
        minHeight: '100%'
    },
    paperHeadingRoot: {
        paddingBottom: '0px !important'
    },
    paperHeading: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5)
    },
    itemDivider: {
        paddingTop: '0px !important',
        paddingBottom: '0px !important'
    },
    itemRoot: {
        padding: '8px 16px !important',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row',
            height: 60,
            padding: '2px 16px !important',
        }
    },
    itemTitleRoot: {
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            padding: '8px 0px !important',
        }
    },
    itemControlRoot: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto'
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    userInfoRoot: {
        padding: theme.spacing(1),
    },
    userInfoAvatarRoot: {
        display: 'flex',
        padding: theme.spacing(1),
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    bigAvatar: {
        width: 60,
        height: 60,
    },
});

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBoxIcon {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteIcon {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRightIcon {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAltIcon {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterListIcon {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPageIcon {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPageIcon {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRightIcon {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeftIcon {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <SearchIcon {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpwardIcon {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <RemoveIcon {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumnIcon {...props} ref={ref} />)
};

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,
            isExpanded: null,
            registerDisplayName: '',
            registerEmail: '',
            registerPassword: '',
            loginEmail: '',
            loginPassword: '',
        };
    }

    handleChange = (panel) => (e, isExpanded) => {
        this.setState({ isExpanded: isExpanded ? panel : false });
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{window.getLanguageFile().internalPages.settings.sections.user.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <Paper className={classes.userInfoRoot}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={2} lg={1}>
                                            <div className={classes.userInfoAvatarRoot}>
                                                <Avatar src={`${fileProtocolStr}:///background.jpg`} className={classes.bigAvatar} />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} md={10} lg={11} style={{ padding: 18 }}>
                                            <div style={{ display: 'flex' }}>
                                                <Typography variant="h6">
                                                    {!String(window.getCurrentUser().address).endsWith('@flast.com') ? window.getCurrentUser().name : 'ゲスト / Guest'}
                                                </Typography>
                                                <div style={{ marginLeft: 'auto' }}>
                                                    <Button variant="text" color="default" style={{ marginRight: 5 }} component={RouterLink} to="/sync">Sync</Button>
                                                    <Button variant="contained" color={!String(window.getCurrentUser().address).endsWith('@flast.com') ? 'default' : 'primary'} onClick={() => { this.setState({ isDialogOpened: !String(window.getCurrentUser().address).endsWith('@flast.com') ? 'logout' : 'login' }); }}>
                                                        {!String(window.getCurrentUser().address).endsWith('@flast.com') ? window.getLanguageFile().internalPages.settings.sections.user.controls.logout : window.getLanguageFile().internalPages.settings.sections.user.controls.login}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                {!String(window.getCurrentUser().address).endsWith('@flast.com') ? window.getCurrentUser().address : ''}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Dialog
                    open={this.state.isDialogOpened === 'register'}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">新規登録</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            variant="outlined"
                            label="表示名"
                            type="text"
                            fullWidth
                            required
                            value={this.state.registerDisplayName}
                            onChange={(e) => this.setState({ registerDisplayName: e.target.value })}
                        />
                        <Divider />
                        <TextField
                            autoFocus
                            margin="dense"
                            variant="outlined"
                            label="メールアドレス"
                            type="email"
                            fullWidth
                            required
                            value={this.state.registerEmail}
                            onChange={(e) => this.setState({ registerEmail: e.target.value })}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            variant="outlined"
                            label="パスワード"
                            type="password"
                            fullWidth
                            required
                            value={this.state.registerPassword}
                            onChange={(e) => this.setState({ registerPassword: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" style={{ marginRight: 'auto' }} onClick={() => { this.setState({ isDialogOpened: 'login' }); }}>
                            ログイン
                        </Button>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { window.updateAccount(this.state.registerEmail, this.state.registerPassword, this.state.registerDisplayName) }}>
                            登録
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.isDialogOpened === 'login'}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">ログイン</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            ログインして{window.getAppName()}を、便利に使いましょう。
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            variant="outlined"
                            label="メールアドレス"
                            type="email"
                            fullWidth
                            required
                            value={this.state.loginEmail}
                            onChange={(e) => this.setState({ loginEmail: e.target.value })}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            variant="outlined"
                            label="パスワード"
                            type="password"
                            fullWidth
                            required
                            value={this.state.loginPassword}
                            onChange={(e) => this.setState({ loginPassword: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" style={{ marginRight: 'auto' }} onClick={() => { this.setState({ isDialogOpened: 'register' }); }}>
                            新規登録
                        </Button>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { window.loginAccount(this.state.loginEmail, this.state.loginPassword) }}>
                            ログイン
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.isDialogOpened === 'logout'}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">ログアウト</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            本当にログアウトしますか？<br />
                            クラウド上に保存されている履歴・ブックマークはこのデバイスでは利用できなくなります。<br />
                            なお、再度ログインをすることで、履歴・ブックマークが利用できるようになります。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { window.logoutAccount() }}>
                            ログアウト
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsSyncPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,
            code: '',
            codeInput: '',

            // Snackbar
            isShowingSnackbar: false,
            snackBarDuration: 1000 * 3,
            snackBarText: ''
        };
    }

    componentDidMount = () => {
        document.title = window.getLanguage() === 'ja' ? `同期 - 設定` : `Sync - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (e, reason) => {
        if (reason === 'clickaway')
            return;

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <div style={{ display: 'flex', height: 30, marginBottom: 4 }}>
                                    <IconButton size="small" component={RouterLink} to="/">
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Typography variant="h6" className={classes.paperHeading}>同期</Typography>
                                </div>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ padding: '8px 16px' }}>
                                <div style={{ display: 'flex' }}>
                                    <Typography variant="subtitle2">
                                        右のボタンをクリックして同期用のコードを作成するか、<br />
                                        下の入力欄に同期元のデバイスで表示されたコードを入力してください。
                                    </Typography>
                                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                                        <div style={{ display: this.state.code !== '' ? 'flex' : 'none', alignItems: 'center', margin: '0px 10px' }}>
                                            <Typography variant="subtitle2">同期用コード:</Typography>
                                            <Typography variant="subtitle2" style={{ marginLeft: 5 }}>{this.state.code}</Typography>
                                        </div>
                                        <Button variant="outlined" color="primary" onClick={() => { window.syncAccount().then((code) => this.setState({ code })); }}>Sync</Button>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl variant="outlined">
                                    <InputLabel htmlFor="sync-code">同期用コード</InputLabel>
                                    <OutlinedInput
                                        value={this.state.codeInput}
                                        onChange={(e) => { this.setState({ codeInput: e.target.value }); }}
                                        autoFocus
                                        id="sync-code"
                                        fullWidth
                                        required
                                        variant="outlined"
                                        labelWidth={95}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={() => {
                                                    window.syncAccount(this.state.codeInput);
                                                    this.setState({ isShowingSnackbar: true, snackBarText: '同期しました。適用するには再起動が必要です。' });
                                                }}>
                                                    <SyncIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.isShowingSnackbar}
                    autoHideDuration={this.state.snackBarDuration}
                    onClose={this.handleSnackbarClose}
                    message={this.state.snackBarText}
                    action={
                        <React.Fragment>
                            <Button color="secondary" size="small" onClick={() => { window.restart(); }}>
                                再起動
                            </Button>
                            <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackbarClose}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </React.Fragment>
                    }
                />
            </NavigationBar>
        );
    }
}

SettingsSyncPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsDesignPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,
            colorPickerAnchorEl: null,

            // Design
            isHomeButton: false,
            isBookmarkBar: false,
            theme: -1,
            tabAccentColor: '#0a84ff',
            isCustomTitlebar: false,
            isCustomTitlebar2: false,

            // HomePage
            isDefaultHomePage: false,
            homePage: 'None',

            // TextInput
            homePageValue: '',

            // Snackbar
            isShowingSnackbar: false,
            snackBarDuration: 1000 * 3,
            snackBarText: ''
        };
    }

    componentDidMount = () => {
        this.setState({
            // Design
            isHomeButton: window.getHomeButton(),
            isBookmarkBar: window.getBookmarkBar(),
            theme: window.getTheme(),
            tabAccentColor: window.getTabAccentColor(),
            isCustomTitlebar: window.getCustomTitlebar(),
            isCustomTitlebar2: window.getCustomTitlebar(),

            // HomePage
            isDefaultHomePage: window.getButtonDefaultHomePage(),
            homePage: window.getButtonStartPage(false),

            homePageValue: window.getButtonStartPage(false)
        });

        document.title = window.getLanguage() === 'ja' ? `デザイン - 設定` : `Design - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (e, reason) => {
        if (reason === 'clickaway')
            return;

        this.setState({ isShowingSnackbar: false });
    }

    handleColorPicker = (e) => {
        this.setState({ colorPickerAnchorEl: e.currentTarget });
    }

    handleColorPickerClose = () => {
        this.setState({ colorPickerAnchorEl: null });
    }

    handleColorPickerChangeComplete = (color) => {
        this.setState({ tabAccentColor: color.hex });
        window.setTabAccentColor(color.hex);

        this.props.enqueueSnackbar('設定を変更しました。', {
            variant: 'success',
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{window.getLanguageFile().internalPages.settings.sections.design.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{window.getLanguageFile().internalPages.settings.sections.design.controls.homeButton.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Switch
                                        checked={this.state.isHomeButton}
                                        onChange={(e) => {
                                            this.setState({ ...this.state, isHomeButton: e.target.checked });
                                            window.setHomeButton(e.target.checked);
                                        }}
                                        color="primary"
                                        value="isHomeButton"
                                    />
                                </div>
                            </Grid>
                            {this.state.isHomeButton ?
                                <Grid item xs={12} style={{ padding: '0px 14px 8px' }}>
                                    <div className={classes.formRoot}>
                                        <FormControl component="fieldset" className={classes.formControl}>
                                            <RadioGroup
                                                onChange={(e) => {
                                                    this.setState({ ...this.state, isDefaultHomePage: (e.target.value === 'default') });
                                                    window.setButtonDefaultHomePage(e.target.value === 'default');
                                                }}
                                                value={this.state.isDefaultHomePage ? 'default' : 'custom'}
                                            >
                                                <FormControlLabel value="default" control={<Radio color="primary" />} label={<span><Link href="flast://home/">ホーム</Link> ページを開く</span>} />
                                                <FormControlLabel value="custom" control={<Radio color="primary" />} label={window.getLanguageFile().internalPages.settings.sections.design.controls.homeButton.controls.openWithCustomPage} />
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                    <TextField
                                        id="standard-full-width"
                                        style={{ width: '-webkit-fill-available', margin: 8 }}
                                        label="URL を入力"
                                        className={clsx(classes.textField, classes.dense)}
                                        margin="dense"
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        value={this.state.homePageValue}
                                        onChange={(e) => { this.setState({ ...this.state, homePageValue: e.target.value }); }}
                                        onKeyDown={(e) => {
                                            if (e.key != 'Enter') return;

                                            if (window.isURL(this.state.homePageValue) && !this.state.homePageValue.includes('://')) {
                                                window.setButtonStartPage(`http://${this.state.homePageValue}`);
                                            } else if (!this.state.homePageValue.includes('://')) {
                                                window.setButtonDefaultHomePage(true);
                                                window.setButtonStartPage('flast://home');
                                                this.props.enqueueSnackbar('値が空かURLではないためデフォルトホーム ページが設定されました。', {
                                                    variant: 'warning',
                                                });
                                            } else {
                                                window.setButtonStartPage(this.state.homePageValue);
                                            }
                                        }}
                                    />
                                </Grid>
                                :
                                null
                            }
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{window.getLanguageFile().internalPages.settings.sections.design.controls.bookMarkBar}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Switch
                                        checked={this.state.isBookmarkBar}
                                        onChange={(e) => {
                                            this.setState({ ...this.state, isBookmarkBar: e.target.checked });
                                            window.setBookmarkBar(e.target.checked);
                                        }}
                                        color="primary"
                                        value="isBookmarkBar"
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{window.getLanguageFile().internalPages.settings.sections.design.controls.theme.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 120 }}>
                                            <Select
                                                value={this.state.theme}
                                                onChange={(e) => {
                                                    this.setState({ theme: e.target.value });
                                                    window.setTheme(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'theme',
                                                    id: 'theme',
                                                }}
                                            >
                                                <MenuItem value={-1}>{window.getLanguageFile().internalPages.settings.sections.design.controls.theme.controls.system}</MenuItem>
                                                <MenuItem value={0}>{window.getLanguageFile().internalPages.settings.sections.design.controls.theme.controls.light}</MenuItem>
                                                <MenuItem value={1}>{window.getLanguageFile().internalPages.settings.sections.design.controls.theme.controls.dark}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{window.getLanguageFile().internalPages.settings.sections.design.controls.accentColor.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Tooltip title={window.getLanguageFile().internalPages.settings.sections.design.controls.accentColor.controls.reset}>
                                        <IconButton size="small" style={{ marginRight: 5 }}
                                            onClick={() => {
                                                this.setState({ tabAccentColor: '#0a84ff' });
                                                window.setTabAccentColor('#0a84ff');
                                            }}
                                        >
                                            <RestoreIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Button variant="contained" color="primary" startIcon={<PaletteIcon />} onClick={this.handleColorPicker}>{window.getLanguageFile().internalPages.settings.sections.design.controls.accentColor.controls.select}</Button>
                                    <Popover
                                        id={Boolean(this.state.colorPickerAnchorEl) ? 'colorPickerPopOver' : undefined}
                                        open={Boolean(this.state.colorPickerAnchorEl)}
                                        anchorEl={this.state.colorPickerAnchorEl}
                                        onClose={this.handleColorPickerClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                    >
                                        <ChromePicker
                                            color={this.state.tabAccentColor}
                                            onChangeComplete={this.handleColorPickerChangeComplete} />
                                    </Popover>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{window.getLanguageFile().internalPages.settings.sections.design.controls.titleBar.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    {this.state.isCustomTitlebar2 !== window.getCustomTitlebar() && <Button variant="outlined" size="small" className={classes.button} onClick={() => { window.restart(); }}>{window.getLanguageFile().internalPages.settings.sections.design.controls.titleBar.controls.restart}</Button>}
                                    <Switch
                                        checked={this.state.isCustomTitlebar}
                                        onChange={(e) => {
                                            this.setState({ ...this.state, isCustomTitlebar: e.target.checked });
                                            window.setCustomTitlebar(e.target.checked);
                                        }}
                                        color="primary"
                                        value="isCustomTitlebar"
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{window.getLanguageFile().internalPages.settings.sections.design.controls.moreSettings}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Button variant="outlined" size="small">変更</Button>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.isShowingSnackbar}
                    autoHideDuration={this.state.snackBarDuration}
                    onClose={this.handleSnackbarClose}
                    ContentProps={{ 'aria-describedby': 'message-id' }}
                    message={<span id="message-id">{this.state.snackBarText}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleSnackbarClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </NavigationBar>
        );
    }
}

SettingsDesignPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsAdBlockPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // AdBlock
            isAdBlock: false,
            filters: [],

            // Snackbar
            isShowingSnackbar: false,
            snackBarDuration: 1000 * 3,
            snackBarText: ''
        };
    }

    componentDidMount = () => {
        this.setState({
            // AdBlock
            isAdBlock: window.getAdBlock(),
            filters: window.getFilters()
        });

        /*
        window.getFilters().forEach((item, i) => {
            this.setState(state => { return { filters: [...state.filters, item] }; });
        });
        */

        document.title = window.getLanguage() === 'ja' ? `広告ブロック - 設定` : `Ad Block - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (e, reason) => {
        if (reason === 'clickaway')
            return;

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>広告ブロック</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">広告ブロックを使用する</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Switch
                                        checked={this.state.isAdBlock}
                                        onChange={(e) => {
                                            this.setState({ ...this.state, isAdBlock: e.target.checked });
                                            window.setAdBlock(e.target.checked);
                                        }}
                                        color="primary"
                                        value="isAdBlock"
                                    />
                                </div>
                            </Grid>
                            {this.state.isAdBlock && (
                                <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 2 }}>
                                    <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                                    {this.state.filters.map((item, i) => {
                                        return (
                                            <Grid item xs={12} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }} key={i}>
                                                <div className={classes.itemTitleRoot}>
                                                    <Typography variant="body2" title={item.url}>{item.name}</Typography>
                                                </div>
                                                <div className={classes.itemControlRoot}>
                                                    <Switch
                                                        checked={item.isEnabled}
                                                        onChange={(e) => {
                                                        }}
                                                        color="primary"
                                                        value={i}
                                                    />
                                                </div>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemControlRoot}>
                                    <Button variant="outlined" size="small"
                                        onClick={() => {
                                            window.updateFilters();

                                            this.props.enqueueSnackbar('定義ファイルのアップデートと再読み込みをしています…', {
                                                variant: 'info',
                                            });
                                        }}>
                                        定義ファイルのアップデート・再読み込み
                                </Button>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.isShowingSnackbar}
                    autoHideDuration={this.state.snackBarDuration}
                    onClose={this.handleSnackbarClose}
                    ContentProps={{ 'aria-describedby': 'message-id' }}
                    message={<span id="message-id">{this.state.snackBarText}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleSnackbarClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </NavigationBar>
        );
    }
}

SettingsAdBlockPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsHomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // HomePage
            isDefaultHomePage: false,
            homePage: 'None',

            // TextInput
            homePageValue: '',

            // HomePage Settings
            homePageBackgroundType: 0,

            // Snackbar
            isShowingSnackbar: false,
            snackBarDuration: 1000 * 3,
            snackBarText: ''
        };
    }

    componentDidMount = () => {
        this.setState({
            // HomePage
            isDefaultHomePage: window.getNewTabDefaultHomePage(),
            homePage: window.getNewTabStartPage(false),

            homePageValue: window.getNewTabStartPage(false),

            homePageBackgroundType: window.getHomePageBackgroundType()
        });

        document.title = window.getLanguage() === 'ja' ? `ホームページ - 設定` : `Home Page - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (e, reason) => {
        if (reason === 'clickaway')
            return;

        this.setState({ isShowingSnackbar: false });
    }

    handleChangeFile = (e) => {
        let file = e.target.files[0];
        window.copyHomePageBackgroundImage(file.path);
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>ホームページ</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">新しいタブ を開いたときに表示されるページ</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} style={{ padding: '0px 14px 8px' }}>
                                <div className={classes.formRoot}>
                                    <FormControl component="fieldset" className={classes.formControl}>
                                        <RadioGroup
                                            aria-label="Gender"
                                            onChange={(e) => {
                                                this.setState({ ...this.state, isDefaultHomePage: (e.target.value === 'default') });
                                                window.setNewTabDefaultHomePage(e.target.value === 'default');
                                            }}
                                            value={this.state.isDefaultHomePage ? 'default' : 'custom'}
                                        >
                                            <FormControlLabel value="default" control={<Radio color="primary" />} label={<span><Link href="flast://home/">ホーム</Link> ページを開く</span>} />
                                            <FormControlLabel value="custom" control={<Radio color="primary" />} label="特定のページを開く" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <TextField
                                    id="standard-full-width"
                                    style={{ width: '-webkit-fill-available', margin: 8 }}
                                    label="URL を入力"
                                    className={clsx(classes.textField, classes.dense)}
                                    margin="dense"
                                    variant="outlined"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.homePageValue}
                                    onChange={(e) => { this.setState({ ...this.state, homePageValue: e.target.value }); }}
                                    onKeyDown={(e) => {
                                        if (e.key != 'Enter') return;

                                        if (window.isURL(this.state.homePageValue) && !this.state.homePageValue.includes('://')) {
                                            window.setNewTabStartPage(`http://${this.state.homePageValue}`);
                                        } else if (!this.state.homePageValue.includes('://')) {
                                            window.setNewTabDefaultHomePage(true);
                                            window.setNewTabStartPage('flast://home');
                                            this.props.enqueueSnackbar('値が空かURLではないためデフォルトホーム ページが設定されました。', {
                                                variant: 'warning',
                                            });
                                        } else {
                                            window.setNewTabStartPage(this.state.homePageValue);
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2"><Link href="flast://home/">ホーム</Link> ページの背景設定</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl}>
                                            <Select
                                                value={this.state.homePageBackgroundType}
                                                onChange={(e) => {
                                                    this.setState({ homePageBackgroundType: e.target.value });
                                                    window.setHomePageBackgroundType(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'homePageBackgroundType',
                                                    id: 'homePageBackgroundType',
                                                }}
                                            >
                                                <MenuItem value={-1}>無効</MenuItem>
                                                <MenuItem value={0}>有効 (日替わり)</MenuItem>
                                                <MenuItem value={1}>有効 (指定した画像)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2"><Link href="flast://home/">ホーム</Link> ページの背景を変更</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id="imageUpload"
                                        style={{ display: 'none' }}
                                        onChange={this.handleChangeFile.bind(this)}
                                    />
                                    <label htmlFor="imageUpload">
                                        <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} component="span">アップロード</Button>
                                    </label>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.isShowingSnackbar}
                    autoHideDuration={this.state.snackBarDuration}
                    onClose={this.handleSnackbarClose}
                    ContentProps={{ 'aria-describedby': 'message-id' }}
                    message={<span id="message-id">{this.state.snackBarText}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleSnackbarClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </NavigationBar>
        );
    }
}

SettingsHomePage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsStartUpPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // HomePage
            isDefaultHomePage: false,
            startUpPagesTableData: [],

            // TextInput
            homePageValue: '',

            startUpPagesTableColumns: [
                {
                    title: '',
                    editable: 'never',
                    render: rowData => {
                        const pageUrl = rowData != undefined ? rowData.pageUrl : `${protocolStr}://home`;
                        const parsed = new URL(pageUrl);
                        return <Avatar src={pageUrl.startsWith(`${protocolStr}://`) || pageUrl.startsWith(`${fileProtocolStr}://`) ? undefined : `https://www.google.com/s2/favicons?domain=${parsed.protocol}//${parsed.hostname}`} style={{ width: 20, height: 20, margin: 10 }} />;
                    }
                },
                { title: 'URL', field: 'pageUrl' }
            ]
        };
    }

    componentDidMount = () => {
        this.setState({
            // HomePage
            isDefaultHomePage: window.getDefaultHomePage()
        });

        window.getStartPages(false).forEach((item, i) => {
            this.setState(state => { return { startUpPagesTableData: [...state.startUpPagesTableData, { pageUrl: item }] }; });
        });

        document.title = window.getLanguage() === 'ja' ? `起動時 - 設定` : `Start Up - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>起動時</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ padding: '8px 14px' }}>
                                <div className={classes.formRoot}>
                                    <FormControl component="fieldset" className={classes.formControl}>
                                        <RadioGroup
                                            aria-label="Gender"
                                            onChange={(e) => {
                                                this.setState({ ...this.state, isDefaultHomePage: (e.target.value === 'default') });
                                                window.setDefaultHomePage(e.target.value === 'default');
                                            }}
                                            value={this.state.isDefaultHomePage ? 'default' : 'custom'}
                                        >
                                            <FormControlLabel value="default" control={<Radio color="primary" />} label={<span><Link href="flast://home/">ホーム</Link> ページを開く</span>} />
                                            <FormControlLabel value="custom" control={<Radio color="primary" />} label="特定のページかページセットを開く" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                {!this.state.isDefaultHomePage ?
                                    <MaterialTable
                                        title="スタートアップ ページ"
                                        icons={tableIcons}
                                        columns={this.state.startUpPagesTableColumns}
                                        data={this.state.startUpPagesTableData}
                                        editable={{
                                            onRowAdd: newData =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.startUpPagesTableData];
                                                        data.push(newData);
                                                        this.setState({ ...this.state, startUpPagesTableData: data });

                                                        let list = [];
                                                        this.state.startUpPagesTableData.map((item, i) => {
                                                            list.push(item.pageUrl);
                                                        });
                                                        window.setStartPages(this.state.startUpPagesTableData.length > 0 ? list : ['flast://home']);
                                                    }, 600);
                                                }),
                                            onRowUpdate: (newData, oldData) =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.startUpPagesTableData];
                                                        data[data.indexOf(oldData)] = newData;
                                                        this.setState({ ...this.state, startUpPagesTableData: data });

                                                        let list = [];
                                                        this.state.startUpPagesTableData.map((item, i) => {
                                                            list.push(item.pageUrl);
                                                        });
                                                        window.setStartPages(this.state.startUpPagesTableData.length > 0 ? list : ['flast://home']);
                                                    }, 600);
                                                }),
                                            onRowDelete: oldData =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.startUpPagesTableData];
                                                        data.splice(data.indexOf(oldData), 1);
                                                        this.setState({ ...this.state, startUpPagesTableData: data });

                                                        let list = [];
                                                        this.state.startUpPagesTableData.map((item, i) => {
                                                            list.push(item.pageUrl);
                                                        });
                                                        window.setStartPages(this.state.startUpPagesTableData.length > 0 ? list : ['flast://home']);
                                                    }, 600);
                                                }),
                                        }}
                                    />
                                    :
                                    null
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsStartUpPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsSearchEnginePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Search Engine
            searchEngine: 'None',
            searchEngines: []
        };
    }

    componentDidMount = () => {
        this.setState({
            // Search Engine
            searchEngine: window.getSearchEngine().name
        });

        window.getSearchEngines().forEach((item, i) => {
            this.setState(state => { return { searchEngines: [...state.searchEngines, item] }; });
        });

        document.title = window.getLanguage() === 'ja' ? `検索エンジン - 設定` : `Search Engine - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>検索エンジン</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">アドレスバーと<Link href="flast://home/">ホーム</Link> ページで使用される検索エンジン</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl}>
                                            <Select
                                                value={this.state.searchEngine}
                                                onChange={(e) => {
                                                    this.setState({ searchEngine: e.target.value });
                                                    window.setSearchEngine(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'searchEngine',
                                                    id: 'searchEngine',
                                                }}
                                            >
                                                {this.state.searchEngines.map((item, i) => {
                                                    return (
                                                        <MenuItem key={i} value={item.name}>{item.name}</MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsSearchEnginePage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsPageSettingsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Page Settings
            isVideoCamera: -1,
            isMicroPhone: -1,
            isGeolocation: -1,
            isNotifications: -1,
            isMidiSysex: -1,
            isPointerLock: -1,
            isFullScreen: -1,
            isOpenExternal: -1,

            // Snackbar
            isShowingSnackbar: false,
            snackBarDuration: 1000 * 3,
            snackBarText: ''
        };
    }

    componentDidMount = () => {
        this.setState({
            // Page Settings
            isVideoCamera: window.getVideoCamera(),
            isMicroPhone: window.getMicroPhone(),
            isGeolocation: window.getGeolocation(),
            isNotifications: window.getNotifications(),
            isMidiSysex: window.getMidiSysex(),
            isPointerLock: window.getPointerLock(),
            isFullScreen: window.getFullScreen(),
            isOpenExternal: window.getOpenExternal()
        });

        document.title = window.getLanguage() === 'ja' ? `ページ設定 - 設定` : `Page Settings - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>ページ設定</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <VideoCameraIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>ビデオ</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isVideoCamera}
                                                onChange={(e) => {
                                                    this.setState({ isVideoCamera: e.target.value });
                                                    window.setVideoCamera(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'videoCamera',
                                                    id: 'videoCamera',
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <MicroPhoneIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>マイク</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isMicroPhone}
                                                onChange={(e) => {
                                                    this.setState({ isMicroPhone: e.target.value });
                                                    window.setMicroPhone(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'microPhone',
                                                    id: 'microPhone',
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <GeolocationIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>位置情報の使用</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isGeolocation}
                                                onChange={(e) => {
                                                    this.setState({ isGeolocation: e.target.value });
                                                    window.setGeolocation(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'geolccation',
                                                    id: 'geolocation',
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <NotificationsIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>通知の送信</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isNotifications}
                                                onChange={(e) => {
                                                    this.setState({ isNotifications: e.target.value });
                                                    window.setNotifications(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'notifications',
                                                    id: 'notifications',
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <RadioIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>MIDI デバイスへのアクセス</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isMidiSysex}
                                                onChange={(e) => {
                                                    this.setState({ isMidiSysex: e.target.value });
                                                    window.setMidiSysex(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'midiSysex',
                                                    id: 'midiSysex',
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <LockIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>マウス カーソルの固定</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isPointerLock}
                                                onChange={(e) => {
                                                    this.setState({ isPointerLock: e.target.value });
                                                    window.setPointerLock(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'pointerLock',
                                                    id: 'pointerLock',
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <FullscreenIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>全画面表示</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isFullScreen}
                                                onChange={(e) => {
                                                    this.setState({ isFullScreen: e.target.value });
                                                    window.setFullScreen(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'fullScreen',
                                                    id: 'fullScreen'
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <LaunchIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>外部リンクを開く</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 240 }}>
                                            <Select
                                                value={this.state.isOpenExternal}
                                                onChange={(e) => {
                                                    this.setState({ isOpenExternal: e.target.value });
                                                    window.setOpenExternal(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'openExternal',
                                                    id: 'openExternal'
                                                }}
                                            >
                                                <MenuItem value={-1}>デフォルト (毎回確認する)</MenuItem>
                                                <MenuItem value={0}>ブロック</MenuItem>
                                                <MenuItem value={1}>許可</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.isShowingSnackbar}
                    autoHideDuration={this.state.snackBarDuration}
                    onClose={this.handleSnackbarClose}
                    ContentProps={{ 'aria-describedby': 'message-id' }}
                    message={<span id="message-id">{this.state.snackBarText}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleSnackbarClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </NavigationBar>
        );
    }
}

SettingsPageSettingsPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsAboutPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            updateStatus: 'checking',

            isDialogOpened: false,

            // Snackbar
            isShowingSnackbar: false,
            snackBarDuration: 1000 * 3,
            snackBarText: ''
        };
    }

    componentDidMount = () => {
        window.getUpdateStatus().then((result) => {
            this.setState({ updateStatus: result });
        });
        setInterval(() => {
            this.setState({ updateStatus: 'checking' });
            window.getUpdateStatus().then((result) => {
                this.setState({ updateStatus: result });
            });
        }, 1000 * 30);

        document.title = window.getLanguage() === 'ja' ? `${window.getAppName()} について - 設定` : `About ${window.getAppName()} - Settings`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" className={classes.paperHeading}>{window.getAppName()} について</Typography>
                                <Divider />
                            </Grid>
                            <Grid item style={{ width: 190, padding: '0px 16px' }}>
                                <img src={`${protocolStr}://resources/icons/logo_${window.getThemeType() ? 'dark' : 'light'}.png`} width="173" />
                            </Grid>
                            <Grid item style={{ padding: '0px 16px' }} alignItems="center">
                                <Typography variant="subtitle1" gutterBottom>{window.getAppName()}</Typography>
                                {(() => {
                                    if (this.state.updateStatus === 'checking') {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>アップデートを確認しています…</Typography>
                                        );
                                    } else if (this.state.updateStatus === 'available') {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>アップデートが見つかりました</Typography>
                                        );
                                    } else if (this.state.updateStatus === 'not-available') {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>{window.getAppName()} は最新版です</Typography>
                                        );
                                    } else if (this.state.updateStatus === 'error') {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>アップデートをが確認できませんでした</Typography>
                                        );
                                    } else if (this.state.updateStatus === 'downloading') {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>アップデートをダウンロードしています…</Typography>
                                        );
                                    } else if (this.state.updateStatus === 'downloaded') {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>再起動して {window.getAppName()} のアップデートを適用してください</Typography>
                                        );
                                    } else {
                                        return (
                                            <Typography variant="subtitle2" gutterBottom>アップデートを確認しています…</Typography>
                                        );
                                    }
                                })()}
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    バージョン: {window.getAppVersion()} (<b>{window.getAppChannel()}</b>, Electron: {window.getElectronVersion()}, Chromium: {window.getChromiumVersion()})
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ padding: '0px 16px' }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom style={{ marginBottom: '0.8em' }}>
                                    {window.getAppName()}<br />
                                    {window.getAppDescription()}<br />
                                    Copyright 2019 Aoichaan0513. All rights reserved.
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    {window.getAppName()} はChromiumやその他の<Link href="flast://credits/">オープンソース ソフトウェア</Link>によって実現しました。
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ display: 'flex', padding: '0px 14px' }} direction="column" alignItems="flex-end">
                                <Button variant="outlined" size="small" onClick={() => { this.setState({ isDialogOpened: 'reset' }); }}>リセット</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Dialog
                    open={this.state.isDialogOpened === 'reset'}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">データのリセット</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            本当にデータをリセットしてよろしいですか？<br />
                            <b>続行</b>を押すとデータのリセット後アプリが再起動します。
                            <Divider />
                            <Typography variant="subtitle2" gutterBottom>削除されるデータ</Typography>
                            <ul>
                                <li>履歴</li>
                                <li>ブックマーク (プライベート ブックマークも含む)</li>
                                <li>キャッシュ</li>
                                <li>Cookieとサイトデータ</li>
                                <ul>
                                    <li>ログイン情報</li>
                                </ul>
                            </ul>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose} style={{ marginRight: 5 }}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { window.clearBrowserData(true); window.restart(); }}>
                            続行
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={this.state.isShowingSnackbar}
                    autoHideDuration={this.state.snackBarDuration}
                    onClose={this.handleSnackbarClose}
                    ContentProps={{ 'aria-describedby': 'message-id' }}
                    message={<span id="message-id">{this.state.snackBarText}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.handleSnackbarClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </NavigationBar>
        );
    }
}

SettingsAboutPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withSnackbar(withStyles(styles)(Settings));

render(
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <BrowserRouter>
            <div>
                <Route exact path='/' component={Page} />
                <Route path='/sync' component={withStyles(styles)(SettingsSyncPage)} />
                <Route path='/design' component={withStyles(styles)(SettingsDesignPage)} />
                <Route path='/adBlock' component={withStyles(styles)(SettingsAdBlockPage)} />
                <Route path='/homePage' component={withStyles(styles)(SettingsHomePage)} />
                <Route path='/startUp' component={withStyles(styles)(SettingsStartUpPage)} />
                <Route path='/search' component={withStyles(styles)(SettingsSearchEnginePage)} />
                <Route path='/pageSettings' component={withStyles(styles)(SettingsPageSettingsPage)} />
                <Route path='/about' component={withStyles(styles)(SettingsAboutPage)} />
            </div>
        </BrowserRouter>
    </SnackbarProvider>,
    document.getElementById('app')
);