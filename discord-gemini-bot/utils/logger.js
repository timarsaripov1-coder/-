const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeLog(level, message, data = null) {
    const logMessage = this.formatMessage(level, message, data);
    
    // Console output
    console.log(`[${new Date().toLocaleTimeString()}] ${level.toUpperCase()}: ${message}`);
    if (data) console.log(data);

    // File output
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  info(message, data = null) {
    this.writeLog('info', message, data);
  }

  warn(message, data = null) {
    this.writeLog('warn', message, data);
  }

  error(message, data = null) {
    this.writeLog('error', message, data);
  }

  debug(message, data = null) {
    if (process.env.LOG_LEVEL === 'debug') {
      this.writeLog('debug', message, data);
    }
  }
}

module.exports = new Logger();