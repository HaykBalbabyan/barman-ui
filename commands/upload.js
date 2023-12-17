const ftp = require('basic-ftp');
const recursive = require('recursive-readdir');
const fs = require('fs');

const config = require('../FTP');

const tIndex = process.argv.indexOf('--t');

let task ='';
if (tIndex !== -1 && tIndex + 1 < process.argv.length && typeof process.argv[tIndex + 1] !== 'undefined' && process.argv[tIndex + 1]) {
    task = process.argv[tIndex + 1];
}

uploadFiles();

async function uploadFiles() {

    const client = new ftp.Client();

    if (task && typeof config.tasks[task] === 'undefined'){
        console.error(`Undefined Task '${task}'`);return;
    }

    let additionalDir = task ? config.tasks[task] : '';

    // console.log(additionalDir,additionalDir.length);

    try {
        await client.access({
            host: config.access.host,
            user:  config.access.user,
            password:  config.access.password,
            secure: false // set to true if FTPS is used
        });

        config.localDirectory = config.localDirectory + (config.localDirectory ? '/' : '') + additionalDir;


        const files = await recursive('./' + config.localDirectory);

        for (const file of files) {
            const relativePath = file.replace(/\\/g,'/');


            if (config.ignore.some(ignoreItem => relativePath.includes(ignoreItem))) {
                continue;
            }

            const remoteFilePath = `${config.serverDirectory}/${relativePath}`.replace(/\\/g,'/');

            // console.log(relativePath,remoteFilePath);continue;

            if (fs.lstatSync(file).isFile()) {
                await client.ensureDir(remoteFilePath.split('/').slice(0, -1).join('/')); // Ensure remote directory exists
                await client.uploadFrom(relativePath, remoteFilePath);
                console.log(`Uploaded /${relativePath} to ${remoteFilePath}`);
            }
        }

        console.log('All eligible files uploaded');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.close();
    }
}
