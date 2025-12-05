export const createRoute = (path) => ({
    path,
    api(pathSuffix = "") {
        return `/api${path}${pathSuffix}`;
    }
});
