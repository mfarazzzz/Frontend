// CMS Service — Single source of truth: Custom CMS (cms.rampurnews.com)
import type { CMSProvider, CMSConfig, CMSProviderType } from './provider';
import type { CMSArticle } from './types';
import { mockCMSProvider } from './mockProvider';
import { createCustomCmsProvider } from './customCmsProvider';

export * from './types';
export * from './provider';

// ─── Provider Instance ────────────────────────────────────────────────────────

const customProvider = createCustomCmsProvider();

let currentConfig: CMSConfig = {
  provider: 'custom',
  baseUrl: process.env.NEXT_PUBLIC_CUSTOM_CMS_URL || 'https://cms.rampurnews.com',
};

export const getCMSProvider = (): CMSProvider => {
  if (currentConfig.provider === 'mock') return mockCMSProvider;
  return customProvider;
};

export const getCMSConfig = (): CMSConfig => currentConfig;

export const configureCMS = (config: CMSConfig): void => {
  currentConfig = config;
};

export const registerCMSProvider = (_type: CMSProviderType, _provider: CMSProvider): void => {
  // No-op: only custom provider is supported
};

export const cms = {
  get provider() {
    return getCMSProvider();
  },
  configure: configureCMS,
  getConfig: getCMSConfig,
  register: registerCMSProvider,
};

export default cms;
