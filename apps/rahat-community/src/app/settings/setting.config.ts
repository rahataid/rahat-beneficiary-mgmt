import { APP_SETTINGS } from '../../constants';

const app: {
  name: string;
  settings: [];
  dynamicCustomId: string;
} = {
  name: 'Rumsan App',
  settings: [],
  dynamicCustomId: '',
};

export const setSettings = (data: any) => {
  app.settings = data;
};

export const listSettings = () => app.settings;

export const getSetting = (name: string) => {
  if (!name) return null;
  name = name.toUpperCase().replace(' ', '-');
  const { settings } = app;
  if (!settings) return null;
  const found = (settings as { value?: { data?: any } }[]).find(
    (f: any) => f.name === name,
  );

  if (!found || !found.value) {
    return null;
  }
  return found.value.data;
};

export const getDynamicCustomID = () => {
  const getCustomID = getSetting(APP_SETTINGS.CUSTOM_ID);
  const value = Object.values(getCustomID)[0];
  if (typeof value === 'string') {
    app.dynamicCustomId = value;
  }

  return app.dynamicCustomId;
};
