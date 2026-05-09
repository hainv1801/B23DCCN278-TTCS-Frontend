import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các file ngôn ngữ vừa tạo
import translationVI from '../locales/vi.json';
import translationEN from '../locales/en.json';

const resources = {
  vi: { translation: translationVI },
  en: { translation: translationEN }
};

i18n
  // Sử dụng detector để tự động nhớ ngôn ngữ user đã chọn (lưu vào localStorage)
  .use(LanguageDetector)
  // Kết nối với React
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định nếu không tìm thấy
    debug: false,
    interpolation: {
      escapeValue: false, // React đã tự động chống XSS nên không cần escape
    }
  });

export default i18n;