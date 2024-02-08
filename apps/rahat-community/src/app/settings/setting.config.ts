const app: {
  name: string;
  settings: [];
} = {
  name: 'Rumsan App',
  settings: [],
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
  if (!found || !found.value || !found.value.data) {
    return null;
  }
  return found.value.data;
};
