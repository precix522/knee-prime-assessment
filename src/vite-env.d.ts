
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWILIO_ACCOUNT_SID: string;
  readonly VITE_TWILIO_AUTH_TOKEN: string;
  readonly VITE_TWILIO_SERVICE_SID: string;
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_VONAGE_API_KEY: string;
  readonly VITE_VONAGE_API_SECRET: string;
  readonly VITE_VONAGE_BRAND_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
