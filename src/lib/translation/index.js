/*
import lang from './lang.json';


export const config = {
  translations: {
    en: { lang },
    fr: { lang },
  },
  loaders: [
    {
      locale: 'en',
      key: 'home',
      loader: async () => (await import('./en/home.json')).default,
    },
    {
      locale: 'en',
      key: 'login',
      loader: async () => (await import('./en/login.json')).default,
    },
    {
      locale: 'en',
      key: 'repository',
      loader: async () => (await import('./en/repository.json')).default,
    },
    {
      locale: 'fr',
      key: 'home',
      loader: async () => (await import('./fr/home.json')).default,
    },
    {
      locale: 'fr',
      key: 'login',
      loader: async () => (await import('./fr/login.json')).default,
    },
    {
      locale: 'fr',
      key: 'repository',
      loader: async () => (await import('./fr/repository.json')).default,
    },
  ],
};

export const { t, loading, locales, locale, loadTranslations } = new i18n(config);

loading.subscribe(($loading) => $loading && console.log('Loading translations...'));
*/