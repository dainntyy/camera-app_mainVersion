// utilities.ts (створюємо окремий файл для утиліт)
export const getNextFlashMode = (currentFlashMode: string): string => {
  switch (currentFlashMode) {
    case 'off':
      return 'on';
    case 'on':
      return 'auto';
    default:
      return 'off';
  }
};

