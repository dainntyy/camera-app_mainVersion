import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

I18n.fallbacks = true;
I18n.translations = {
  en: {
    permission_camera: 'Permission to use camera was denied. Please allow it in settings.',
    permission_library: 'Permission to access media library was denied.',
    error_take_photo: 'Could not take photo. Please try again.',
    error_pick_image: 'Failed to open gallery. Try again later.',
    alert_ok: 'OK',
    alert_report: 'Report Problem',
    error_title: 'An error occurred',
  },
  uk: {
    permission_camera: 'Доступ до камери заборонено. Дозвольте в налаштуваннях.',
    permission_library: 'Доступ до медіатеки заборонено.',
    error_take_photo: 'Не вдалося зробити фото. Спробуйте ще раз.',
    error_pick_image: 'Не вдалося відкрити галерею.',
    alert_ok: 'Добре',
    alert_report: 'Повідомити про проблему',
    error_title: 'Сталася помилка',
  },
};

I18n.locale = Localization.getLocales() || 'en';

export default I18n;
