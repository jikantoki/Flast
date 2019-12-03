const { build, Platform } = require('electron-builder');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./app/package.json', 'utf8'));

build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
        'appId': pkg.flast_package_id,
        'productName': pkg.name,
        'copyright': `Copyright 2019 ${pkg.author.name}. All rights reserved.`,
        'asar': true,
        'directories': {
            'output': 'dist',
            'buildResources': 'static'
        },
        'publish': {
            'provider': 'generic',
            'url': `http://aoichaan0513.xyz/flast/${process.platform}/${process.arch}/${pkg.flast_channel}`,
            'channel': pkg.flast_channel
        },
        'fileAssociations': [
            {
                'name': 'Document',
                'description': pkg.name,
                'role': 'Viewer',
                'ext': 'html'
            }
        ],
        'appx': {
            'backgroundColor': '#f5f5f5',
            'languages': ['ja-JP', 'en-US']
        },
        'win': {
            'target': 'appx',
            'icon': './static/icon.ico',
        },
    },
});