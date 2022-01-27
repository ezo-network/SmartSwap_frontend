const filename = "system.log";
const SimpleLogger = require('simple-node-logger');
const logManager = new SimpleLogger({ errorEventName: 'error' });

process.on('error', (msg) => {
    console.log('Error event caught: ', JSON.stringify(msg));
});

logManager.createConsoleAppender();
logManager.createFileAppender({ logFilePath: filename });

export default logManager;