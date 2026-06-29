import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'ur'];

export default getRequestConfig(async ({requestLocale}) => {
  // `[locale]` segment for /en/* and /ur/*; undefined for routes like /admin/*
  let locale = await requestLocale;

  if (!locale) {
    locale = 'en';
  }

  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default
  };
});
