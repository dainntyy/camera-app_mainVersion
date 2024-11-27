import { toggleCameraType } from '../utils/cameraSettings';

describe('toggleCameraType', () => {
  it('should toggle the camera type from back to front', () => {
    const setTypeMock = jest.fn();
    toggleCameraType('back', setTypeMock);
    expect(setTypeMock).toHaveBeenCalledWith('front');
  });

  it('should toggle the camera type from front to back', () => {
    const setTypeMock = jest.fn();
    toggleCameraType('front', setTypeMock);
    expect(setTypeMock).toHaveBeenCalledWith('back');
  });
});
