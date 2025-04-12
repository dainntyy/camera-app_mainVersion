/**
 * @file ReferenceImageScreen.js
 * @description Screen that allows users to select a reference image from preloaded templates or their gallery.
 * @description[uk] Екран, що дозволяє користувачам вибрати референтне зображення з шаблонів або своєї галереї.
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

/**
 * Screen component that allows the user to select a reference image
 * either from predefined templates or from their photo gallery.
 * Selected image is passed to the Camera screen for further processing.
 *
 * @component
 * @description[uk] Екранний компонент, який дозволяє користувачеві вибрати референсне зображення із попередньо визначених шаблонів або з їхньої фотогалереї. Вибране зображення передається на екран камери для подальшої обробки.
 * @returns {JSX.Element} Component render
 */
function ReferenceImageScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);
  const navigation = useNavigation();

  const templateImages = [
    require('./templatePictures/image1.jpeg'),
    require('./templatePictures/image2.jpg'),
  ];

  useEffect(() => {
    /**
     * Requests media library permission
     * @function
     * @async
     * @description Requests access to media library and fetches images if granted
     * @description[uk] Запитує доступ до медіатеки та завантажує зображення при отриманні дозволу
     */
    const getPermission = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        fetchGalleryImages();
      } else {
        setHasPermission(false);
      }
    };

    getPermission();
  }, []);

  /**
   * Fetches the latest 21 photo assets from the device's media library
   * and stores their URIs in the component state.
   *
   * @async
   * @function fetchGalleryImages
   * @description Gets latest 21 photos from device gallery
   * @description[uk] Отримує останні 21 фото з галереї пристрою і зберігає їх URL в стані компонента
   * @returns {Promise<void>}
   */
  const fetchGalleryImages = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: 'photo',
      first: 21,
    });
    const galleryUris = await Promise.all(
      media.assets.map(async asset => {
        if (asset.uri.startsWith('ph://')) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
          return assetInfo.localUri || assetInfo.uri;
        }
        return asset.uri;
      })
    );
    setGalleryImages(galleryUris);
  };

  // TODO: fix template pictures choosing

  /**
   * Opens the device's image library to let the user pick an image.
   * If successful, navigates to the Camera screen with the selected image as reference.
   *
   * @async
   * @function pickImage
   * @description Launches image picker and navigates to Camera with selected image
   * @description[uk] Відкриває бібліотеку зображень пристрою, щоб користувач міг вибрати зображення. У разі успіху переходить на екран камери з вибраним зображенням як шаблоном.
   * @returns {Promise<void>}
   */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      let uri = asset.uri;

      if (uri.startsWith('ph://')) {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.uri);
        uri = assetInfo.localUri || assetInfo.uri;
      }

      navigation.navigate('Camera', { referencePhotoUri: uri });
    }
  };

  /**
   * Navigates to the Camera screen with the selected reference image URI.
   *
   * @function handleConfirmSelection
   * @param {string|number} uri - The URI of the selected reference image.
   * @description Navigates to Camera screen with selected image
   * @description[uk] Переходить на екран камери з обраним зображенням
   */
  const handleConfirmSelection = uri => {
    navigation.navigate('Camera', { referencePhotoUri: uri });
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText} testID="permission-text">
          We need permission to access your photos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} testID="screen-title">
        Select Reference Image
      </Text>

      <View style={styles.templateSection}>
        <Text style={styles.sectionTitle} testID="template-section-title">
          Template Images
        </Text>
        <FlatList
          horizontal
          data={templateImages}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedImage(item)}
              style={styles.imageContainer}
              testID={`template-image-${index}`}
            >
              <Image source={item} style={styles.templateImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>

      <View style={styles.gallerySection}>
        <Text style={styles.sectionTitle} testID="gallery-section-title">
          Your Gallery
        </Text>
        <FlatList
          data={galleryImages}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedImage(item)}
              style={styles.imageContainer}
              testID={`gallery-image-${index}`}
            >
              <Image source={{ uri: item }} style={styles.galleryImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
        />
      </View>

      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image
            source={typeof selectedImage === 'string' ? { uri: selectedImage } : selectedImage}
            style={styles.previewImage}
            testID="preview-image"
          />

          <TouchableOpacity
            onPress={() => handleConfirmSelection(selectedImage)}
            style={styles.confirmButton}
            testID="confirm-button"
          >
            <Text style={styles.buttonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={pickImage} style={styles.button} testID="open-gallery-button">
        <Text style={styles.buttonText}>Open Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  templateSection: {
    marginBottom: 20,
  },
  gallerySection: {
    flex: 1,
  },
  imageContainer: {
    margin: 5,
  },
  templateImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#083e68',
    padding: 10,
    marginBottom: 20,
    height: 50,
  },
  button: {
    backgroundColor: '#083e68',
    padding: 10,
    marginTop: 20,
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default ReferenceImageScreen;
