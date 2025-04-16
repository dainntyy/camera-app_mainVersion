import { Alert } from 'react-native';

import logger from './logger';

ErrorUtils.setGlobalHandler((error, isFatal) => {
  const errorId = `ERR_${Date.now()}`;
  logger.error(`[${errorId}] Global error: ${error.message}`, {
    stack: error.stack,
    isFatal,
  });

  Alert.alert('Error oqqured', `Error code: ${errorId}\nPlease, reload app.`, [{ text: 'Ok' }]);
});
