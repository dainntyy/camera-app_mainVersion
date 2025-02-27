import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType } from 'expo-image-manipulator';
import flipCameraIcon from './icons/flip_camera.png';
import RefIcon from './icons/ref_icon.png';

export default function CameraScreen() {
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
    const [photoUri, setPhotoUri] = useState(null);
    const [referencePhoto, setReferencePhoto] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            requestMediaLibraryPermission(status === 'granted');
        })();
    }, [requestMediaLibraryPermission]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

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

    const takePicture = async () => {
        if (cameraRef.current) {
            let photo = await cameraRef.current.takePictureAsync();

            // Якщо фронтальна камера активна, віддзеркалити зображення
            if (type === CameraType.front) {
                const manipulatedImage = await manipulateAsync(
                    photo.uri,
                    [{ flip: FlipType.Horizontal }] // Дзеркальне відображення по горизонталі
                );
                setPhotoUri(manipulatedImage.uri);
                await MediaLibrary.saveToLibraryAsync(manipulatedImage.uri);
            } else {
                setPhotoUri(photo.uri);
                await MediaLibrary.saveToLibraryAsync(photo.uri);
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        
        if (!result.canceled) {
            setReferencePhoto(result.uri);  // Встановлюємо URI вибраного зображення як референсне фото
        } 
    };

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={type}
                ref={cameraRef}
            >
                <View style={styles.overlayContainer}>
                    {referencePhoto ? (
                        <Image source={{ uri: referencePhoto }} style={styles.overlayImage} />
                    ) : (
                        <Text style={styles.overlayText}>Select an image as reference</Text>
                    )}
                </View>
                <View style={styles.topControls}>
                    <TouchableOpacity onPress={toggleCameraType} style={styles.iconButton}>
                        <Image source={flipCameraIcon} style={styles.iconImage} />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomControlsContainer}>
                    <View style={styles.bottomControls}>
                        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                            <Image source={RefIcon} style={styles.iconImage} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                            <View style={styles.captureCircle} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Camera>
            {photoUri && (
                <Image
                    source={{ uri: photoUri }}
                    style={[styles.previewImage]}
                />
            )}
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayImage: {
        width: '100%',
        height: '100%',
        opacity: 0.3,
    },
    overlayText: {
        fontSize: 18,
        color: 'white',
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
    },
    topControls: {
        position: 'absolute',
        top: 50,
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
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
        position: 'absolute',
        bottom: 20,
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
    previewImage: {
        width: 100,
        height: 100,
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    iconImage: {
        width: 40,
        height: 40,
    },
});
