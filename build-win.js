const { build, Platform } = require('electron-builder');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./app/package.json', 'utf8'));

build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
        'appId': pkg.flast_package_id,
        'productName': pkg.name,
        'copyright': `Copyright 2019 ${pkg.author.name}. All rights reserved.`,
        'icon': './static/icon.png',
        'asar': true,
        'directories': {
            'output': `dist/${pkg.flast_channel}/${process.platform}`,
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
                'ext': ['html', 'htm', 'php']
            }
        ],
        'nsis': {
            'include': 'static/installer.nsh',
            'installerIcon': 'static/icon.ico',
            'uninstallerIcon': 'static/icon.ico'
        },
        'nsisWeb': {
            'include': 'static/installer.nsh',
            'installerIcon': 'static/icon.ico',
            'uninstallerIcon': 'static/icon.ico'
        },
        'win': {
            'icon': 'static/icon.ico',
            'target': {
                'target': 'nsis',
                'arch': ['ia32', 'x64']
            }
        },
    },
});