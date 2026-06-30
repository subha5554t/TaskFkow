/// <reference types="vite/client" />

// CSS modules
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

// Plain CSS side-effect imports
declare module '*.css' {
  const content: string;
  export default content;
}
