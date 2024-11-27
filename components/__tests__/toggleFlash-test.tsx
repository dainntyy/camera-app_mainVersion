import { toggleFlash } from '../utils/cameraSettings';

describe('toggleFlash', () => {
  it('should toggle flash from off to on', () => {
    const setFlashMock = jest.fn();
    toggleFlash('off', setFlashMock);
    expect(setFlashMock).toHaveBeenCalledWith('on');
  });

  it('should toggle flash from on to off', () => {
    const setFlashMock = jest.fn();
    toggleFlash('on', setFlashMock);
    expect(setFlashMock).toHaveBeenCalledWith('off');
  });
});
