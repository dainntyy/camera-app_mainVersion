import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import * as ImagePicker from 'expo-image-picker';
import i18n from './utils/i18n';

import { getLogFileContent, logFileUri } from '../components/utils/logger';

export default function ReportBugScreen() {
  const [steps, setSteps] = useState('');
  const [systemInfo, setSystemInfo] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [sending, setSending] = useState(false);

  const pickScreenshots = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      setScreenshots(prev => [...prev, ...result.assets]);
    }
  };

  const clearScreenshots = () => setScreenshots([]);

  const sendReport = async () => {
    try {
      setSending(true);
      const log = await getLogFileContent();
      const body = `${i18n.t('rb_system_info')}:\n${systemInfo}\n\n${i18n.t('rb_steps')}:\n${steps}\n\nLogs:\n${log}`;
      const attachments = [logFileUri, ...screenshots.map(s => s.uri)];

      await MailComposer.composeAsync({
        recipients: ['daria.zakharchenko@student.sumdu.edu.ua'],
        subject: 'Bug Report - Camera App',
        body,
        attachments,
      });

      Alert.alert(i18n.t('rb_sent_title'), i18n.t('rb_sent_msg'));
      setSteps('');
      setSystemInfo('');
      setScreenshots([]);
    } catch (error) {
      Alert.alert(i18n.t('rb_fail_title'), error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>{i18n.t('rb_system_info')}</Text>
      <Text style={styles.placeholder}>{i18n.t('rb_system_info_ph')}</Text>
      <TextInput
        multiline
        placeholder={i18n.t('rb_system_info_ph')}
        style={styles.input}
        value={systemInfo}
        onChangeText={setSystemInfo}
      />

      <Text style={styles.label}>{i18n.t('rb_steps')}</Text>
      <Text style={styles.placeholder}>{i18n.t('rb_steps_ph')}</Text>
      <TextInput
        multiline
        placeholder={i18n.t('rb_steps_ph')}
        style={styles.input}
        value={steps}
        onChangeText={setSteps}
      />

      <Button title={i18n.t('rb_attach_btn')} onPress={pickScreenshots} />
      <ScrollView horizontal style={styles.imageScroll}>
        {screenshots.map((img, index) => (
          <Image key={index} source={{ uri: img.uri }} style={styles.imagePreview} />
        ))}
      </ScrollView>

      {screenshots.length > 0 && (
        <View style={styles.clearButtonContainer}>
          <Button title={i18n.t('rb_clear_btn')} onPress={clearScreenshots} color="#cc0000" />
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title={sending ? i18n.t('rb_sending_btn') : i18n.t('rb_send_btn')}
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
    fontWeight: '700',
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
    textAlignVertical: 'top',
    fontSize: 16,
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
  clearButtonContainer: {
    marginTop: 10,
  },
});
