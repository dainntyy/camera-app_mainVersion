import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import PropTypes from 'prop-types';
//import ImageResizer from 'react-native-image-resizer';
// import * as ImageEditor from "@react-native-community/image-editor";
//import { launchImageLibrary } from 'react-native-image-picker';
import Slider from '@react-native-community/slider';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import flipCameraIcon from './icons/flip_camera.png';
import FlashOnIcon from './icons/flash_icon.png';
import FlashOffIcon from './icons/flash_off.png';
import RefIcon from './icons/ref_icon.png';
import RefOffIcon from './icons/ref_off_icon.png';

/**
 * CameraScreen is a React component that provides a custom camera interface
 * with support for flash, switching cameras, overlays, and saving photos
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.route - React Navigation route object
 * @param {Object} props.route.params - Parameters passed to this screen
 * @param {string} [props.route.params.referencePhotoUri] - URI of the reference image to overlay
 * @returns {React.ReactElement}
 */

export default function CameraScreen({ route }) {
  const navigation = useNavigation();
  const [type, setType] = useState('back'); // Резервне значення 'back'
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState('off');
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [lastPhotoUri, setLastPhotoUri] = useState(null);
  const [referencePhoto, setReferencePhoto] = useState(route.params?.referencePhotoUri || null);
  const [isFrontCamera, setIsFrontCamera] = useState(type === 'front');
  const [opacity, setOpacity] = useState(0.3);
  const cameraRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    setWindowWidth(width);
    setWindowHeight(height);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.referencePhotoUri) {
        setReferencePhoto(route.params.referencePhotoUri);
      }
    }, [route.params?.referencePhotoUri])
  );

  useEffect(() => {
    const getPermissionsAndAssets = async () => {
      if (!permission?.granted) {
        const newPermission = await requestPermission();
        if (!newPermission.granted) return;
      }

      if (!mediaLibraryPermission?.granted) {
        const newMediaPermission = await requestMediaLibraryPermission();
        if (!newMediaPermission.granted) return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        sortBy: MediaLibrary.SortBy.creationTime,
        mediaType: 'photo',
        first: 1,
      });

      if (media.assets.length > 0) {
        const lastAsset = media.assets[0];

        if (lastAsset.uri.startsWith('ph://')) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(lastAsset.id);
          if (assetInfo.localUri) {
            setLastPhotoUri(assetInfo.localUri);
          }
        } else {
          setLastPhotoUri(lastAsset.uri);
        }
      }
    };

    getPermissionsAndAssets();
  }, [permission, mediaLibraryPermission]);

  useEffect(() => {
    setIsFrontCamera(type === 'front');
  }, [type]);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // TODO: Remove inline styles

  if (!mediaLibraryPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to access media library</Text>
        <TouchableOpacity onPress={requestMediaLibraryPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Media Library Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**

    Captures a photo using the current camera reference.

    If the front camera is active, the image is mirrored.

    The photo is saved to the media library and updated in the component state.

    @async

    @function

    @returns {Promise<void>}
*/

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Зробити фото
        const photo = await cameraRef.current.takePictureAsync();

        let finalUri = photo.uri;

        // Якщо використовується фронтальна камера, віддзеркалити фото
        if (type === 'front') {
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ flip: ImageManipulator.FlipType.Horizontal }], // Дзеркальне відображення
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
          finalUri = manipulatedImage.uri;
        }

        setPhotoUri(finalUri);
        await MediaLibrary.saveToLibraryAsync(photoUri);
        setLastPhotoUri(finalUri);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  /**
   * Navigates to the ReferenceImageScreen where user can select a reference image.
   * @function
   * @returns {void}
   */
  const pickReferenceImage = () => {
    navigation.navigate('ReferenceImageScreen');
  };
  /**
   * Clears the currently set reference photo.
   *
   * @function
   * @returns {void}
   */
  const clearReferencePhoto = () => {
    setReferencePhoto(null);
  };
  /**

    Opens the gallery picker allowing the user to select an image from the media library.

    Logs the selected image URI or shows an alert if permission is not granted.

    @async

    @function

    @returns {Promise<void>} 
  */

  const openGallery = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Updated to use ImagePicker.MediaType
        quality: 1,
      });

      if (!result.canceled) {
        // Process the selected image
        console.log(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  /**

    Toggles between front and back cameras.

    Updates internal camera type state accordingly.

    @function

    @returns {void} 
  */

  function toggleCameraType() {
    setType(current => (current === 'back' ? 'front' : 'back'));
  }
  /**
   * Toggles between different flash modes: 'off' → 'on' → 'auto' → 'off'.
   *
   * @function
   * @returns {void}
   */
  function toggleFlash() {
    setFlashMode(prevFlashMode => {
      switch (prevFlashMode) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        default:
          return 'off';
      }
    });
  }

  CameraScreen.propTypes = {
    route: PropTypes.shape({
      params: PropTypes.shape({
        referencePhotoUri: PropTypes.string,
      }),
    }).isRequired,
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={type} ref={cameraRef} flash={flashMode}>
        <View style={styles.overlayContainer}>
          {referencePhoto ? (
            <Image
              source={{ uri: referencePhoto }}
              style={[
                styles.overlayImage,
                {
                  opacity: opacity,
                  width: windowWidth,
                  height: windowHeight,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
              ]}
            />
          ) : null}
        </View>
        <View style={styles.header} />
        <View style={styles.topControls}>
          <TouchableOpacity
            testID="toggle-camera-button"
            onPress={toggleCameraType}
            style={styles.iconButton}
            accessibilityLabel="Toggle camera"
          >
            <Image
              source={flipCameraIcon}
              style={styles.iconImage}
              accessible={false} // Image is decorative; label provided on TouchableOpacity
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="toggle-flash-button"
            onPress={toggleFlash}
            style={styles.iconButton}
            accessibilityLabel={`Flash ${flashMode === 'off' ? 'off' : 'on'}`}
          >
            <Image
              source={flashMode === 'off' ? FlashOffIcon : FlashOnIcon}
              style={styles.iconImage}
              accessible={false} // Image is decorative; label provided on TouchableOpacity
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={clearReferencePhoto}
            style={styles.iconButton}
            accessibilityLabel="Clear reference photo"
          >
            <Image
              source={RefOffIcon}
              style={styles.iconImage}
              accessible={false} // Image is decorative; label provided on TouchableOpacity
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControlsContainer}>
          <View style={styles.bottomControls}>
            <TouchableOpacity
              onPress={pickReferenceImage}
              style={styles.iconButton}
              accessibilityLabel="Select reference photo"
            >
              <Image source={RefIcon} style={styles.iconImage} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="capture-button"
              onPress={takePicture}
              style={styles.captureButton}
              accessibilityLabel="Capture photo"
            >
              <View style={styles.captureCircle} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="open-gallery-button"
              onPress={openGallery}
              style={styles.iconButton}
              accessibilityLabel="Open Galery"
            >
              {lastPhotoUri ? (
                <Image source={{ uri: lastPhotoUri }} style={styles.galleryImage} />
              ) : (
                <Text style={styles.iconPlaceholder}>Gallery</Text>
              )}
            </TouchableOpacity>
          </View>
          {referencePhoto && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Opacity</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={opacity}
                onValueChange={setOpacity}
              />
            </View>
          )}
          <View style={styles.footer} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  header: {
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 100,
  },
  topControls: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footer: {
    ...StyleSheet.absoluteFillObject, // Зробити фон абсолютним в межах контейнера
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Напівпрозорий фон
    zIndex: -1,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    position: 'absolute', // Позиціонування кнопок поверх фону
    bottom: 30,
  },
  iconButton: {
    padding: 10,
  },
  captureButton: {
    alignSelf: 'center',
  },
  captureCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'gray',
  },
  galleryImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  iconPlaceholder: {
    fontSize: 12,
    color: 'white',
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  permissionButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    bottom: 100,
  },
  sliderLabel: {
    color: 'white',
    marginBottom: 5,
  },
  slider: {
    width: '80%',
  },
});
