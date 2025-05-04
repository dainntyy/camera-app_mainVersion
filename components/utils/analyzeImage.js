//analyzeImage.js

/**
 *
 * @param userUri
 * @param refUri
 */
const analyzeImage = async (userUri, refUri) => {
  console.log('[DEBUG] analyzeImage() start');

  const formData = new FormData();
  formData.append('userImage', {
    uri: userUri,
    name: 'user.jpg',
    type: 'image/jpeg',
  });
  formData.append('referenceImage', {
    uri: refUri,
    name: 'reference.jpg',
    type: 'image/jpeg',
  });

  const response = await fetch('http://192.168.0.233:5000/analyze', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.statusText}`);
  }

  console.log('[DEBUG] Response status:', response.status);
  return await response.json(); // { similarity: ..., alignment: ... }
};

export default analyzeImage;
