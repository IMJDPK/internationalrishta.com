import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {getRequestConfig as getRequestConfigCore} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ur'];

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default
  };
});
