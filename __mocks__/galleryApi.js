export const fetchGalleryImages = jest.fn(() =>
  Promise.resolve([{ uri: 'file://mock-image-1.jpg' }, { uri: 'file://mock-image-2.jpg' }])
);
