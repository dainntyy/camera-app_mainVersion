import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import * as ImagePicker from 'expo-image-picker';

import { getLogFileContent, logFileUri } from '../components/utils/logger';

/**
 *
 */
export default function ReportBugScreen() {
  const [steps, setSteps] = useState('');
  const [systemInfo, setSystemInfo] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [sending, setSending] = useState(false);

  /**
   *
   */
  const pickScreenshots = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setScreenshots([...screenshots, ...result.assets]);
    }
  };
  /**
   *
   */
  const clearScreenshots = () => {
    setScreenshots([]);
  };

  /**
   *
   */
  const sendReport = async () => {
    try {
      setSending(true);
      const log = await getLogFileContent();

      const body = `System Info:\n${systemInfo}\n\nSteps to Reproduce:\n${steps}\n\nLogs:\n${log}`;
      const attachments = [logFileUri, ...screenshots.map(s => s.uri)];

      await MailComposer.composeAsync({
        recipients: ['daria.zakharchenko@student.sumdu.edu.ua'],
        subject: 'Bug Report - Camera App',
        body,
        attachments,
      });

      Alert.alert('✅ Report Sent', 'Thank you for your feedback!');
      setSteps('');
      setSystemInfo('');
      setScreenshots([]);
    } catch (error) {
      Alert.alert('❌ Failed to Send', error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>System Info</Text>
      <Text style={styles.placeholder}>Device info, OS version, app version...</Text>
      <TextInput
        multiline
        placeholder="Device info, OS version, app version..."
        style={styles.input}
        value={systemInfo}
        onChangeText={setSystemInfo}
        required
      />

      <Text style={styles.label}>Steps to Reproduce</Text>
      <Text style={styles.placeholder}>Describe steps to reproduce the issue...</Text>
      <TextInput
        multiline
        placeholder="Describe steps to reproduce the issue..."
        style={styles.input}
        value={steps}
        onChangeText={setSteps}
        required
      />

      <Button title="Attach Screenshots" onPress={pickScreenshots} />
      <ScrollView horizontal style={styles.imageScroll}>
        {screenshots.map((img, index) => (
          <Image key={index} source={{ uri: img.uri }} style={styles.imagePreview} />
        ))}
      </ScrollView>

      {screenshots.length > 0 && (
        <View style={styles.clearButtonContainer}>
          <Button title="Clear Screenshots" onPress={clearScreenshots} color="#cc0000" />
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title={sending ? 'Sending...' : 'Send Report'}
          onPress={sendReport}
          disabled={sending}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
    marginTop: 14,
  },
  placeholder: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: 'top', // ✅ для multiline
    fontSize: 16, // ✅ робить placeholder помітнішим
    color: '#000',
  },
  imageScroll: {
    marginTop: 10,
    marginBottom: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
  },
});
