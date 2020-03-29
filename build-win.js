const { build, Platform } = require('electron-builder');
const fs = require('fs');
const { flast_package_id, name, author, flast_channel, flast_url } = JSON.parse(fs.readFileSync('./app/package.json', 'utf8'));

const platform = Platform.WINDOWS;

build({
    targets: platform.createTarget(),
    config: {
        appId: flast_package_id,
        productName: name,
        copyright: `Copyright 2019 ${author.name}. All rights reserved.`,
        icon: './static/icon.png',
        asar: true,
        directories: {
            output: `dist/${flast_channel}/${platform.name}`,
            buildResources: 'static'
        },
        publish: {
            provider: 'generic',
            url: `https://${flast_url}/flast/${process.platform}/${flast_channel}`,
            channel: flast_channel
        },
        fileAssociations: [
            {
                name: 'Document',
                description: name,
                role: 'Viewer',
                ext: ['html', 'htm', 'php']
            }
        ],
        nsis: {
            include: 'static/installer.nsh',
            installerIcon: 'static/icon.ico',
            uninstallerIcon: 'static/icon.ico'
        },
        win: {
            icon: 'static/icon.ico',
            target: {
                target: 'nsis-web',
                arch: ['ia32', 'x64']
            }
        }
    }
});