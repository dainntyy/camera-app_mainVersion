import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function ReferenceImageScreen() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [hasPermission, setHasPermission] = useState(false);
    const navigation = useNavigation();

    const templateImages = [
        require('./templatePictures/image1.jpeg'),
        require('./templatePictures/image2.jpg'),
    ];

    useEffect(() => {
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

    const fetchGalleryImages = async () => {
        const media = await MediaLibrary.getAssetsAsync({
            sortBy: MediaLibrary.SortBy.creationTime,
            mediaType: 'photo',
            first: 21,
        });
        const galleryUris = await Promise.all(
            media.assets.map(async (asset) => {
                if (asset.uri.startsWith('ph://')) {
                    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
                    return assetInfo.localUri || assetInfo.uri;
                }
                return asset.uri;
            })
        );
        setGalleryImages(galleryUris);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    const handleConfirmSelection = (uri) => {
        navigation.navigate('Camera', { referencePhotoUri: uri });
    };

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>We need permission to access your photos.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Reference Image</Text>

            <View style={styles.templateSection}>
                <Text style={styles.sectionTitle}>Template Images</Text>
                <FlatList
                    horizontal
                    data={templateImages}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setSelectedImage(item)} style={styles.imageContainer}>
                            <Image source={item} style={styles.templateImage} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>

            <View style={styles.gallerySection}>
                <Text style={styles.sectionTitle}>Your Gallery</Text>
                <FlatList
                    data={galleryImages}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedImage(item)}
                            style={styles.imageContainer}
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
                    <Image source={typeof selectedImage === 'string' ? { uri: selectedImage } : selectedImage} style={styles.previewImage} />

                    <TouchableOpacity onPress={() => handleConfirmSelection(selectedImage)} style={styles.confirmButton}>
                        <Text style={styles.buttonText}>Confirm Selection</Text>
                    </TouchableOpacity>

                </View>
            )}

            <TouchableOpacity onPress={pickImage} style={styles.button}>
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
        backgroundColor: '#2196F3',
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        marginTop: 20,
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
