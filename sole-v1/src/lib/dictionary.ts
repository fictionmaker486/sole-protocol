import type { Locale } from './i18n-config';

// 定義翻譯字典的導入邏輯
// 使用動態 import 可確保用戶只下載當前語系的 JSON，優化載入速度
const dictionaries = {
  // src/lib -> src -> 根目錄 -> message
  en: () => import('../../message/en.json').then((module) => module.default),
  'zh-TW': () => import('../../message/zh-TW.json').then((module) => module.default),
};

/**
 * 根據語系獲取對應的翻譯字典
 * @param locale 當前語系 (en 或 zh-TW)
 */
export const getDictionary = async (locale: Locale) => {
  // 檢查請求的語系是否存在於字典定義中
  const loader = dictionaries[locale as keyof typeof dictionaries];

  if (!loader) {
    console.warn(`Locale "${locale}" not found, falling back to default (en).`);
    return dictionaries.en();
  }

  try {
    return await loader();
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    return dictionaries.en();
  }
};