const pkg = require(`${__dirname}/../package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

module.exports = {
    main: {
        yes: 'Yes',
        no: 'No',
        file: {
            label: 'File',
            newTab: 'New tab',
            newWindow: 'New window',
            openPrivateWindow: 'Open Private window',
            savePage: 'Save page',
            print: 'Print'
        },
        edit: {
            label: 'Edit',
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            delete: 'Delete',
            selectAll: 'Select All',
            find: 'Find on page'
        },
        view: {
            label: 'View',
            fullScreen: 'Toggle Full Screen',
            viewSource: 'View source',
            devTool: 'Developer Tool',
            devToolWindow: 'Developer Tool (Window)',
        },
        navigate: {
            label: 'Navigation',
            back: 'Go back',
            forward: 'Go forward',
            reload: 'Reload',
            reloadIgnoringCache: 'Reload (Clear Cache)',
            home: 'Home page',
            history: 'History',
            downloads: 'Downloads',
            bookmarks: 'Bookmarks'
        }
    },
    window: {
        titleBar: {
            tab: {
                media: {
                    audioPlaying: 'Playing in Media',
                    audioMuted: 'Muted tab'
                },
                close: 'Close this tab',
                new: 'Open a new tab'
            },
            buttons: {
                minimize: 'Minimize',
                maximize: {
                    maximize: 'Maximize',
                    restore: 'Restore (Shrink)'
                },
                close: 'Close'
            }
        },
        toolBar: {
            fullScreenExit: '全画面表示を終了 (F11)',
            back: 'Go back (Alt+Left)',
            forward: 'Go forward (Alt+Right)',
            reload: {
                reload: 'Reload (Ctrl+R)',
                stop: 'Stop loading'
            },
            home: 'Go to the home page',
            addressBar: {
                info: {
                    name: 'Information on this page',
                    clicked: {
                        internal: `Showing protected ${pkg.name} page`,
                        viewSource: 'Showing page source',
                        file: 'Viewing local or shared file',
                        secure: {
                            title: 'The connection to this site is secure',
                            description: 'The information you send to this site (passwords, credit card information, etc.) will not be seen by any third party.'
                        },
                        insecure: {
                            title: 'The connection to this site is not secure',
                            description: 'Do not enter sensitive information (such as passwords or credit card information) on this site. Malicious users can steal information.'
                        }
                    }
                },
                permission: {
                    title: '{replace} is requesting permission',
                    description: 'Permission: {replace}',
                    buttons: {
                        yes: 'Yes',
                        no: 'No'
                    }
                },
                textBox: {
                    suggest: {
                        search: 'Search in {replace}',
                        open: 'Open Website'
                    }
                },
                translate: 'Translate this page',
                zoomDefault: 'Restore default size',
                bookmark: {
                    add: 'Add to bookmark',
                    remove: 'Remove from bookmark',
                    clicked: {
                        add: 'Added to bookmark',
                        remove: 'Removed from bookmark',
                        addPrivate: 'Added to private bookmark',
                        removePrivate: 'Removed from private bookmarks'
                    }
                },
            },
            extensions: {
                adBlock: 'Blocked {replace} ads',
                feedback: 'Send Feedback'
            },
            menu: {
                name: 'Menu',
                menus: {
                    userInfo: 'User Infomation',
                    newTab: 'New tab',
                    newWindow: 'New window',
                    openPrivateWindow: 'Open Private window',
                    zoom: {
                        name: 'Zoom',
                        zoomIn: 'Zoom in',
                        zoomOut: 'Zoom out',
                        zoomDefault: 'Default',
                        fullScreen: 'Full Screen'
                    },
                    edit: {
                        name: 'Edit',
                        cut: 'Cut',
                        copy: 'Copy',
                        paste: 'Paste'
                    },
                    bookmarks: 'Bookmarks',
                    history: 'History',
                    downloads: 'Downloads',
                    app: {
                        name: 'Application',
                        list: 'App list',
                        store: 'Flast Store',
                        install: 'Install {title}',
                        uninstall: 'Uninstall {title}',
                        run: 'Launch {title}'
                    },
                    print: 'Print',
                    find: 'Find on page',
                    otherTools: {
                        name: 'Other Tools',
                        savePage: 'Save page',
                        viewSource: 'View source',
                        devTool: 'Developer Tool',
                    },
                    settings: 'Settings',
                    help: 'Help',
                    close: 'Close'
                }
            }
        },
        view: {
            errorMessage: {
                UNDEFINED: {
                    title: '不明なエラーが発生しました', 
                    description: '不明なエラーが発生しました。エラーの説明等がまだ翻訳されていないときに表示されます。'
                },
                FILE_NOT_FOUND: {
                    title: 'ファイル・ディレクトリが見つかりませんでした',
                    description: '指定されたパスにファイル・ディレクトリが見つかりませんでした。\nパスが間違っていないかを確認してください。\n再試行するには、ページを再読み込みしてください。'
                },
                TIMED_OUT: {
                    title: 'タイムアウト',
                    description: 'タイムアウトで実行できませんでした。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_TOO_BIG: {
                    title: 'ファイルサイズが大きすぎます',
                    description: '指定されたパスのファイルが大きすぎます。\n再試行するには、ページを再読み込みしてください。'
                },
                ACCESS_DENIED: {
                    title: 'アクセスが拒否されました',
                    description: '指定されたパスへのアクセスが拒否されました。\nアクセス設定が正しいかを確認してください。\n再試行するには、ページを再読み込みしてください。'
                },
                NOT_IMPLEMENTED: {
                    title: 'この機能は実装されていません',
                    description: '実行しようとした機能は実装されていないため実行できませんでした。\nこのエラーはChromium側で発生することが多いのでFlast側では修正することができません。\nChromium側の更新をお待ちください。'
                },
                INSUFFICIENT_RESOURCES: {
                    title: '操作を完了するのに十分なリソースがありませんでした',
                    description: 'デバイスに負荷がかかっていないかを確かめてください。\n負荷がかかっている場合は負荷が軽減してから再試行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                OUT_OF_MEMORY: {
                    title: 'メモリの割り当てに失敗しました',
                    description: 'メモリの割り当てに失敗しました。メモリが足りていない可能性があります。\nデバイスに負荷がかかっていないかを確かめてください。\n負荷がかかっている場合は負荷が軽減してから再試行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                UPLOAD_FILE_CHANGED: {
                    title: 'ファイルのアップロードに失敗しました',
                    description: 'ファイルのアップロード時間が予想と異なるためファイルのアップロードができませんでした。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_EXISTS: {
                    title: 'ファイルがすでに存在しています',
                    description: 'ファイルがすでに存在しているため実行できませんでした。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_PATH_TOO_LONG: {
                    title: 'ファイル名・パスが長すぎます',
                    description: 'ファイル名・パスが長すぎます。\nファイル名・パスを短くしてから実行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_NO_SPACE: {
                    title: 'ディスクに十分な空きがありません',
                    description: 'ディスクに十分な空きがありませんでした。\n使用していないファイルは削除するなどして、ディスクに十分な空きを作ってから実行してください。\n再試行するには、ページを再読み込みしてください。'
                },
                FILE_VIRUS_INFECTED: {
                    title: 'ファイルにウイルスがあります',
                    description: 'ファイルからウイルスが発見されました。\nそのファイルを実行することはできません。'
                }
            },
            contextMenu: {
                link: {
                    newTab: 'Open link in new tab',
                    newWindow: 'Open link in new window',
                    openPrivateWindow: 'Open link in private window',
                    copy: 'Copy link'
                },
                image: {
                    newTab: 'Open image in new tab',
                    saveImage: 'Save image as',
                    copyImage: 'Copy image',
                    copyLink: 'Copy image link'
                },
                editable: {
                    emotePalette: 'Emote Palette',
                    undo: 'Undo',
                    redo: 'Redo',
                    cut: 'Cut',
                    copy: 'Copy',
                    paste: 'Paste',
                    selectAll: 'Select all'
                },
                selection: {
                    copy: 'Copy',
                    textSearch: 'Search {name} for "{text}"',
                    textLoad: 'Go to {text}'
                },
                fullScreenExit: '全画面表示を終了',
                back: 'Back',
                forward: 'Forward',
                reload: {
                    reload: 'Reload',
                    stop: 'Stop loading'
                },
                media: {
                    audioMute: 'Mute tab',
                    audioMuteExit: 'Unmute tab',
                    pictureInPicture: 'Picture in Picture'
                },
                savePage: 'Save page',
                print: 'Print',
                translate: 'Translate this page',
                floatingWindow: 'Floating Window (Beta)',
                viewSource: 'View source',
                devTool: 'Developer Tool'
            }
        }
    },
    internalPages: {
        navigationBar: {
            home: 'Home',
            bookmarks: 'Bookmarks',
            history: 'History',
            downloads: 'Downloads',
            app: 'Apps',
            settings: 'Settings',
            help: 'Help'
        },
        home: {
            bookmarks: {
                title: 'Bookmarks',
                table: {
                    title: 'Title',
                    url: 'URL',
                    date: 'Viewing date'
                }
            },
            history: {
                title: 'History',
                table: {
                    title: 'Title',
                    url: 'URL',
                    date: 'Add date'
                }
            },
            downloads: {
                title: 'Downloads',
                table: {
                    title: 'Title',
                    url: 'URL',
                    status: 'Status',
                    date: 'Start date'
                }
            },
        },
        history: {
            title: 'History',
            clear: {
                title: 'Clear browsing data'
            },
            table: {
                title: 'Title',
                url: 'URL',
                date: 'Viewing date'
            }
        },
        downloads: {
            title: 'Downloads',
            clear: {
                title: 'Clear download data'
            },
            table: {
                title: 'Title',
                url: 'URL',
                status: 'Status',
                date: 'Start date'
            }
        },
        bookmarks: {
            title: 'Bookmarks',
            clear: {
                title: 'Clear bookmarks'
            },
            table: {
                title: 'Title',
                url: 'URL',
                date: 'Add date'
            }
        },
        settings: {
            title: 'Settings',
            sections: {
                design: {
                    name: 'Design',
                    controls: {
                        homeButton: 'ホームボタンを表示する',
                        bookMarkBar: 'ブックマーク バーを表示する',
                        darkTheme: 'ダーク テーマを使用する',
                        titleBar: 'カスタム タイトルバーを使用する',
                        details: 'ウィンドウの詳細設定'
                    }
                },
                homePage: {
                    title: 'Homepage',
                    description: '現在、{replace} を使用しています。',
                    controls: {
                        homePage: 'ホーム ページ',
                        customPage: 'カスタムページ'
                    }
                }
            }
        }
    }
}