// components/utils/logger.js
import { logger } from 'react-native-logs';
import * as FileSystem from 'expo-file-system';

const logFilePath = FileSystem.documentDirectory + 'logs.txt';
const MAX_LOG_SIZE = 500000;

const config = {
  severity: process.env.LOG_LEVEL || 'debug',
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

export const log = logger.createLogger(config);

// ✅ Запис логів у файл
/**
 *
 * @param message
 */
export const logToFile = async message => {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${message}\n`;
  await FileSystem.writeAsStringAsync(logFilePath, formatted, {
    encoding: FileSystem.Encoding.UTF8,
    append: true,
  });
};

// ✅ Ротація логів за розміром
/**
 *
 */
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

// ✅ Читання вмісту лог-файлу (для перегляду/відправки)
/**
 *
 */
export const getLogFileContent = async () => {
  try {
    const info = await FileSystem.getInfoAsync(logFilePath);
    if (info.exists) {
      return await FileSystem.readAsStringAsync(logFilePath);
    }
    return 'Log file is empty.';
  } catch (error) {
    return `Failed to read log file: ${error.message}`;
  }
};

// ✅ Шлях до лог-файлу (можна прикріпити)
export const logFileUri = logFilePath;

// ✅ Готова функція логування помилки з контекстом
/**
 *
 * @param message
 * @param context
 */
export const logError = async (message, context = {}) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ERROR: ${message}\nContext: ${JSON.stringify(context)}\n\n`;
  log.error(message, context);
  await FileSystem.writeAsStringAsync(logFilePath, entry, {
    encoding: FileSystem.Encoding.UTF8,
    append: true,
  });
};
