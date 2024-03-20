import { APP_SETTINGS } from '../../constants';

const app: {
  name: string;
  settings: object;
  customId: string;
} = {
  name: 'Rumsan App',
  settings: {},
  customId: '',
};

export const setSettings = (data: any) => {
  app.settings = data;
};

export const listSettings = () => {
  return app.settings;
};

export const getSetting = (name: string) => {
  if (!name) return null;
  return app.settings[name];
};

export const getCustomUniqueId = () => {
  const data = getSetting(APP_SETTINGS.CUSTOM_ID);
  if (!data) return '';
  if (typeof data === 'string') app.customId = data;
  return app.customId;
};
