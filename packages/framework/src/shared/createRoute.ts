export const createRoute = <T extends string>(path: T) => ({
  path,
  api(pathSuffix = "") {
    return `/api${path}${pathSuffix}`;
  }
});
