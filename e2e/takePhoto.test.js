describe('Camera App Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should take a photo', async () => {
    await element(by.id('capture-button')).tap(); // Замініть на ваш ID
    await expect(element(by.id('gallery-thumbnail'))).toBeVisible();
  });

  afterAll(async () => {
    await device.terminateApp();
  });
});
