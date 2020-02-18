const pkg = require(`${__dirname}/../package.json`);
const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

module.exports = {
    main: {
        yes: 'はい',
        no: 'いいえ',
        file: {
            label: 'ファイル',
            newTab: '新しいタブ',
            newWindow: '新しいウィンドウ',
            openPrivateWindow: 'プライベート ウィンドウを開く',
            savePage: 'ページの保存',
            print: '印刷'
        },
        edit: {
            label: '編集',
            undo: '元に戻す',
            redo: 'やり直す',
            cut: '切り取り',
            copy: 'コピー',
            paste: '貼り付け',
            delete: '削除',
            selectAll: 'すべて選択',
            find: '検索'
        },
        view: {
            label: '表示',
            fullScreen: '全画面表示の切り替え',
            viewSource: 'ページのソースを表示',
            devTool: 'デベロッパー ツール',
            devToolWindow: 'デベロッパー ツール (ウィンドウ)',
        },
        navigate: {
            label: 'ナビゲーション',
            back: '前のページに戻る',
            forward: '次のページに進む',
            reload: '再読み込み',
            reloadIgnoringCache: '再読み込み (キャッシュの削除)',
            home: 'ホームページに移動',
            history: '履歴',
            downloads: 'ダウンロード',
            bookmarks: 'ブックマーク'
        },
        help: {
            label: 'ヘルプ',
            help: 'ヘルプ',
            feedback: 'フィードバックの送信',
            about: `${pkg.name} について`
        }
    },
    window: {
        titleBar: {
            tab: {
                media: {
                    audioPlaying: 'メディアの再生中',
                    audioMuted: 'メディアのミュート中'
                },
                close: 'このタブを閉じる',
                new: '新しいタブを開く'
            },
            buttons: {
                minimize: '最小化',
                maximize: {
                    maximize: '最大化',
                    restore: '元に戻す (縮小)'
                },
                close: '閉じる'
            }
        },
        toolBar: {
            fullScreenExit: '全画面表示を終了 (F11)',
            back: '前のページに戻る (Alt+Left)',
            forward: '次のページに進む (Alt+Right)',
            reload: {
                reload: '再読み込み (Ctrl+R)',
                stop: '読み込み中止'
            },
            home: 'ホームページに移動',
            addressBar: {
                info: {
                    name: 'このページの情報',
                    clicked: {
                        internal: `保護された ${pkg.name} ページを表示しています`,
                        viewSource: 'ページのソースを表示しています',
                        file: 'ローカル ファイルまたは共有ファイルを表示しています',
                        secure: {
                            title: 'このサイトへの接続は保護されています',
                            description: 'あなたがこのサイトに送信した情報 (パスワード、クレジット カード情報)などが第三者に見られることはありません。'
                        },
                        insecure: {
                            title: 'このサイトへの接続は保護されていません',
                            description: 'このサイトでは機密情報 (パスワード、クレジット カード情報など)を入力しないでください。悪意のあるユーザーに情報が盗まれる恐れがあります。'
                        }
                    }
                },
                permission: {
                    title: '{replace} が権限を要求しています',
                    description: '要求内容: {replace}',
                    buttons: {
                        yes: 'はい',
                        no: 'いいえ'
                    }
                },
                textBox: {
                    suggest: {
                        search: '{replace} で検索',
                        open: 'サイトを開く'
                    }
                },
                translate: 'このページを翻訳',
                zoomDefault: 'デフォルトのサイズに戻す',
                bookmark: {
                    add: 'ブックマークに追加',
                    remove: 'ブックマークから削除',
                    clicked: {
                        add: 'ブックマークに追加しました',
                        remove: 'ブックマークから削除しました',
                        addPrivate: 'プライベート ブックマークに追加しました',
                        removePrivate: 'プライベート ブックマークから削除しました'
                    }
                },
            },
            extensions: {
                adBlock: '{replace}個の広告をブロックしました',
                feedback: 'フィードバックの送信'
            },
            menu: {
                name: 'メニュー',
                menus: {
                    userInfo: 'ユーザー情報',
                    newTab: '新しいタブ',
                    newWindow: '新しいウィンドウ',
                    openPrivateWindow: 'プライベート ウィンドウを開く',
                    zoom: {
                        name: 'ズーム',
                        zoomIn: '拡大',
                        zoomOut: '縮小',
                        zoomDefault: 'デフォルト',
                        fullScreen: '全画面表示'
                    },
                    edit: {
                        name: '編集',
                        cut: '切り取り',
                        copy: 'コピー',
                        paste: '貼り付け'
                    },
                    bookmarks: 'ブックマーク',
                    history: '履歴',
                    downloads: 'ダウンロード',
                    app: {
                        name: 'アプリ',
                        list: 'アプリ リスト',
                        store: 'Flast Store',
                        install: '{title} をインストール',
                        uninstall: '{title} をアンインストール',
                        run: '{title} を起動'
                    },
                    print: '印刷',
                    find: '検索',
                    share: {
                        name: '共有',
                        linkCopy: 'リンクのコピー',
                        qrCode: 'QR コード'
                    },
                    otherTools: {
                        name: 'その他のツール',
                        savePage: 'ページの保存',
                        viewSource: 'ページのソースを表示',
                        devTool: 'デベロッパー ツール'
                    },
                    settings: '設定',
                    help: {
                        name: 'ヘルプ',
                        feedback: 'フィードバックの送信',
                        about: `${pkg.name} について`
                    },
                    close: '閉じる'
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
                    newTab: '新しいタブで開く',
                    newWindow: '新しいウィンドウで開く',
                    openPrivateWindow: 'プライベート ウィンドウで開く',
                    copy: 'リンクをコピー'
                },
                image: {
                    newTab: '新しいタブで画像を開く',
                    saveImage: '名前を付けて画像を保存',
                    copyImage: '画像をコピー',
                    copyLink: '画像アドレスをコピー'
                },
                editable: {
                    emotePalette: '絵文字パレット',
                    undo: '元に戻す',
                    redo: 'やり直す',
                    cut: '切り取り',
                    copy: 'コピー',
                    paste: '貼り付け',
                    selectAll: 'すべて選択'
                },
                selection: {
                    copy: 'コピー',
                    textSearch: '{name} で「{text}」を検索',
                    textLoad: '{text} に移動'
                },
                fullScreen: {
                    fullScreenExit: '全画面表示を終了',
                    toolBar: 'ツールバー表示の切り替え',
                },
                back: '戻る',
                forward: '進む',
                reload: {
                    reload: '再読み込み',
                    stop: '読み込み中止'
                },
                media: {
                    audioMute: 'タブをミュート',
                    audioMuteExit: 'タブのミュートを解除',
                    pictureInPicture: 'ピクチャー イン ピクチャー'
                },
                savePage: 'ページの保存',
                print: '印刷',
                translate: 'このページを翻訳',
                floatingWindow: 'Floating Window (Beta)',
                viewSource: 'ページのソースを表示',
                devTool: 'デベロッパー ツール'
            }
        }
    },
    internalPages: {
        navigationBar: {
            home: 'ホーム',
            bookmarks: 'ブックマーク',
            history: '履歴',
            downloads: 'ダウンロード',
            app: 'アプリ',
            settings: '設定',
            help: 'ヘルプ'
        },
        home: {
            bookmarks: {
                title: 'ブックマーク',
                table: {
                    title: 'タイトル',
                    url: 'URL',
                    date: '追加日時'
                }
            },
            history: {
                title: '履歴',
                table: {
                    title: 'タイトル',
                    url: 'URL',
                    date: '閲覧日時'
                }
            },
            downloads: {
                title: 'ダウンロード',
                table: {
                    title: 'タイトル',
                    url: 'URL',
                    status: 'ステータス',
                    date: '開始日時'
                }
            },
        },
        history: {
            title: '履歴',
            clear: '閲覧履歴を削除',
            table: {
                title: 'タイトル',
                url: 'URL',
                date: '閲覧日時'
            }
        },
        downloads: {
            title: 'ダウンロード',
            clear: 'ダウンロード履歴を削除',
            table: {
                title: 'タイトル',
                url: 'URL',
                status: 'ステータス',
                date: '開始日時'
            }
        },
        bookmarks: {
            title: 'ブックマーク',
            clear: 'ブックマークを削除',
            table: {
                title: 'タイトル',
                url: 'URL',
                date: '追加日時'
            }
        },
        settings: {
            title: '設定',
            sections: {
                user: {
                    title: 'ユーザー',
                    controls: {
                        login: 'ログイン',
                        logout: 'ログアウト'
                    }
                },
                design: {
                    title: 'デザイン',
                    controls: {
                        homeButton: {
                            name: 'ホームボタンを表示する',
                            controls: {
                                openWithHomePage: '{link}ホーム{/link} ページを開く',
                                openWithCustomPage: '特定のページを開く'
                            }
                        },
                        bookMarkBar: 'ブックマーク バーを表示する',
                        theme: {
                            name: 'テーマ',
                            controls: {
                                system: 'システム',
                                light: 'ライト',
                                dark: 'ダーク'
                            }
                        },
                        accentColor: {
                            name: 'タブのアクセントカラー',
                            controls: {
                                reset: 'リセット',
                                select: '色を選択'
                            }
                        },
                        titleBar: {
                            name: 'カスタム タイトルバーを使用する',
                            controls: {
                                restart: '再起動'
                            }
                        },
                        moreSettings: 'ウィンドウの詳細設定'
                    }
                },
                homePage: {
                    title: 'ホームページ',
                    controls: {
                        homePage: 'ホーム ページ',
                        customPage: 'カスタムページ'
                    }
                }
            }
        }
    }
}