export const redirectTo = (url: string) => {
  window.location.href = url;
};

export const reloadRoot = () => {
  redirectTo(window.location.origin);
};
