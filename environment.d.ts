declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      MONGODB_URI: string;
      MONGODB_DB: string;
      HOSTNAME: string;
      PORT: string;
      COOKIE_DOMAIN: string;
      ORIGIN_MAIN: string;
      ORIGIN_ADMIN: string;
      AUTH_ISSUER: string;
      AUTH_SUBJECT: string;
      AUTH_AUDIENCE: string;
      AUTH_SECRET: string;
      AUTH_ACCESS_LIFETIME_S: string;
      AUTH_REFRESH_LIFETIME_S: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
