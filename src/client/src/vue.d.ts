declare module 'vue' {
  export function createApp(component: any): any;
}

declare module '*.vue' {
  const component: any;
  export default component;
}
