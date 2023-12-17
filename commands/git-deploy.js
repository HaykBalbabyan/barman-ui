const { exec } = require('child_process');
const fs = require('fs');

const tIndex = process.argv.indexOf('-m');

let message = '';
const changeVersion = process.argv.indexOf('--change-version') >= 0;
if (tIndex !== -1 && tIndex + 1 < process.argv.length && typeof process.argv[tIndex + 1] !== 'undefined' && process.argv[tIndex + 1]) {
    message = process.argv[tIndex + 1];
}

deploy();

async function deploy() {
    try {
        if (changeVersion) {
            await incrementVersion();
        }

        await command('gulp build');

        await command('git add .');
        await command('git status');
        await command(`git commit -m "${message}"`);
        await command(`git push`);

        console.log('PROJECT SUCCESSFULLY PUSHED!')
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

function command(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            console.log('> ' + cmd);

            if (error) {
                console.error('error: ' + error);
                reject(error); // Reject the promise if there's an error
                return;
            }
            console.log('output: ' + stdout);
            resolve(); // Resolve the promise if the command succeeds
        });
    });
}

function incrementVersion() {
    const filePath = './package.json'; // Replace this with your actual file path

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            const packageJson = JSON.parse(data);

            if (!packageJson.hasOwnProperty('version')) {
                console.error('The "version" field does not exist in package.json.');
                return;
            }

            let currentVersion = packageJson['version'];
            const versionParts = currentVersion.split('.').map(Number);

            if (versionParts.length !== 3) {
                console.error('Invalid version format in package.json. Expected "x.y.z".');
                return;
            }

            if (versionParts[2] < 99) {
                versionParts[2]++;
            } else if (versionParts[1] < 99) {
                versionParts[1]++;
                versionParts[2] = 0;
            } else {
                versionParts[0]++;
                versionParts[1] = 0;
                versionParts[2] = 0;
            }

            const newVersion = versionParts.join('.');

            packageJson['version'] = newVersion;

            const updatedPackageJson = JSON.stringify(packageJson, null, 2);

            fs.writeFile(filePath, updatedPackageJson, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to the file:', err);
                    return;
                }
                console.log(`Incremented package.json version to ${newVersion}`);
            });
        } catch (error) {
            console.error('Error parsing JSON data:', error);
        }
    });
}