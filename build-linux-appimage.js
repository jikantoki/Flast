const { build, Platform } = require('electron-builder');
const fs = require('fs');
const pkg = require('app/package.json');

const platform = Platform.LINUX;

build({
    targets: platform.createTarget(),
    config: {
        appId: pkg.flast_package_id,
        productName: pkg.name,
        copyright: `Copyright 2019 ${pkg.author.name}. All rights reserved.`,
        icon: './static/icon.png',
        asar: true,
        directories: {
            output: `dist/${pkg.flast_channel}/${platform.name}`,
            buildResources: 'static'
        },
        publish: {
            provider: 'github',
            repo: pkg.name,
            owner: pkg.author.name
        },
        fileAssociations: [
            {
                name: 'Document',
                description: pkg.name,
                role: 'Viewer',
                ext: ['html', 'htm', 'php']
            }
        ],
        linux: {
            category: 'Network',
            icon: './static/icon.png',
            target: {
                target: 'AppImage',
                arch: ['ia32', 'x64']
            }
        }
    }
});