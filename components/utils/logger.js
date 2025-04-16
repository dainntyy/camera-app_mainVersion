// components/utils/logger.js
import { logger } from 'react-native-logs';
import * as FileSystem from 'expo-file-system';

const logFilePath = FileSystem.documentDirectory + 'logs.txt';
const MAX_LOG_SIZE = 500000;

const config = {
  severity: process.env.LOG_LEVEL || 'debug', //70%
  transport: console.log,
  transportOptions: {
    colors: true,
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4,
  },
};

export const readLogFile = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(logFilePath);
    if (!fileInfo.exists) {
      console.log('Log file does not exist yet.');
      return;
    }

    const content = await FileSystem.readAsStringAsync(logFilePath);
    console.log('[Log File Contents]:\n', content);
  } catch (error) {
    console.log('Failed to read log file:', error);
  }
};

export default logger.createLogger(config);

export const logToFile = async message => {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${message}\n`;
  await FileSystem.writeAsStringAsync(logFilePath, formatted, {
    encoding: FileSystem.Encoding.UTF8,
    append: true,
  });
};

export const rotateLogsIfNeeded = async () => {
  try {
    const info = await FileSystem.getInfoAsync(logFilePath);
    if (info.exists && info.size > MAX_LOG_SIZE) {
      const newPath = FileSystem.documentDirectory + `logs_${Date.now()}.txt`;
      await FileSystem.moveAsync({ from: logFilePath, to: newPath });
      await FileSystem.writeAsStringAsync(logFilePath, '', {
        encoding: FileSystem.Encoding.UTF8,
      });
    }
  } catch (e) {
    console.log('[Log Rotation Failed]', e.message);
  }
};
