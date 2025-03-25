export const toAbsoluteUrl = (pathname: string) => {
  if (pathname.startsWith('/')) {
    pathname = pathname.substring(1);
  }

  return import.meta.env.VITE_APP_FILE_URL + '/' +  pathname;
};
