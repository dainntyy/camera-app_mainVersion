export const toggleCameraType = (currentType: 'back' | 'front', setType: (type: 'back' | 'front') => void): void => {
  const newType = currentType === 'back' ? 'front' : 'back';
  setType(newType);
};

export const toggleFlash = (currentFlash: 'on' | 'off', setFlash: (mode: 'on' | 'off') => void): void => {
  const newFlashMode = currentFlash === 'off' ? 'on' : 'off';
  setFlash(newFlashMode);
};

