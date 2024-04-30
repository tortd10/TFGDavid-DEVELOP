const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

/**
 * Runs 'npm install' for cartridge
 */
function npmInstall(folder) {
    const cartridgeFolder = folder.split('cartridges')[0];
    const hasPackageJson = fs.existsSync(path.resolve(cartridgeFolder, 'package.json'));

    // Abort if there's no 'package.json' in this folder
    if (!hasPackageJson) {
        return;
    }

    childProcess.execSync('npm install', {
        cwd: cartridgeFolder, env: process.env, stdio: 'inherit', windowsHide: true,
    });
}

module.exports = {
    npmInstall,
};
