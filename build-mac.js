const { build, Platform } = require('electron-builder');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./app/package.json', 'utf8'));

build({
    targets: Platform.MAC.createTarget(),
    config: {
        'appId': pkg.flast_package_id,
        'productName': pkg.name,
        'copyright': `Copyright 2019 ${pkg.author.name}. All rights reserved.`,
        'asar': true,
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
        'mac': {
            'target': 'dmg',
            'icon': './static/icon.png',
        },
    },
});