/**
 * FocusGuard SaaS Core Configuration
 */

export const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5173'
  ? 'http://127.0.0.1:8787'
  : '';

export const DEFAULT_ENDPOINT = 'focusguard.trujillomingorance.com';

export const SAFE_PROVIDERS_PATTERNS = [
  'google', 'gstatic', 'googleapis', 'googleusercontent', 'youtube',
  'microsoft', 'msn', 'live.com', 'outlook', 'azure', 'office', 'windows', 'bing', 'xbox',
  'amazon', 'amazonaws', 'aws', 'twitch',
  'alibaba', 'aliexpress', 'alicdn', 'alipay', 'taobao', 'tmall',
  'x.com', 'twitter.com', 'twimg.com', 't.co',
  'whatsapp.com', 'whatsapp.net', 'web.whatsapp.com', 'wa.me',
  'facebook.com', 'fbcdn.net', 'messenger.com', 'fb.com', 'facebook.net',
  'telegram.org', 'telegram.me', 't.me', 'web.telegram.org', 'tdesktop.com',
  'reddit.com', 'redd.it', 'redditmedia.com', 'redditstatic.com',
  'openai.com', 'chatgpt.com', 'anthropic.com', 'claude.ai', 'perplexity.ai', 'deepseek.com', 'huggingface.co', 'midjourney.com',
  'steam', 'steampowered', 'steamcommunity', 'epicgames', 'discord', 'roblox', 'riotgames', 'playstation', 'ea.com', 'ubisoft',
  'supercell', 'clashofclans', 'clashroyale', 'brawlstars', 'hayday'
];

/** Substrings that sit on a safe brand (twitch, amazon, google, spotify CDN) but are ads/telemetry. */
export const AD_TRACKER_PATTERNS = [
  'google-analytics', 'googleadservices', 'doubleclick', 'googletagmanager', 'googletagservices',
  'googlesyndication', 'adservice.google', 'pagead', 'adtrafficquality.google', '2mdn.net',
  'imasdk.googleapis', 'analytics.google',
  'an.facebook', 'pixel.facebook', 'ads.facebook', 'advertising.facebook',
  'ads-twitter', 'ads-api.twitter', 'analytics.twitter', 'ads-api.x.com',
  'amazon-adsystem', 'advertising.amazon', 'fls-na.amazon', 'fls-eu.amazon', 'unagi.amazon',
  'bat.bing', 'ads.microsoft', 'bingads.microsoft',
  'iadsdk.apple', 'advertising.apple',
  'ads.yahoo', 'gemini.yahoo',
  'alb.reddit', 'events.reddit',
  'px.ads.linkedin', 'ads.linkedin',
  'ads.pinterest', 'analytics.pinterest', 'ct.pinterest', 'log.pinterest',
  'ads.snapchat', 'tr.snapchat', 'app-analytics.snapchat',
  'ads.tiktok', 'analytics.tiktok', 'ads-sg.tiktok', 'log.byteoversea',
  'mc.yandex', 'an.yandex', 'ads.yandex', 'cpro.baidu',
  'ads.twitch', 'ad.twitch.tv', 'ad-assets.cloud.twitch', 'countess.twitch',
  'adeventtracker.spotify', 'ads-fa.spotify', 'ads-sp-', 'audio-ads.spotify',
  'advertising.spotify', 'adstudio.spotify', 'ads.spotify.com',
  'video-fa.scdn', 'video-fa.cdn.spotify', 'video-fa.spotifycdn', 'video-akpcw.spotifycdn',
  'heads-fa.', 'heads-fab.spotify', 'audio-fa.spotify', 'audio-fab.spotify',
  'crashdump.spotify', 'pixel.spotify', 'pixel-static.spotify',
  'criteo', 'outbrain', 'taboola', 'adnxs', 'popads', 'coinhive',
  'imrworldwide', 'fwmrm.net', 'adswizz', 'stickyadstv',
  'scorecardresearch', 'quantserve', 'moatads',
  'trafficjunky', 'adtng.com', 'exoclick', 'juicyads',
  'adsrvr.org', 'omtrdc.net', 'demdex.net', 'everesttech',
  'branch.io', 'adjust.com', 'appsflyer', 'kochava', 'singular.net',
  'smartlook', 'luckyorange', 'mouseflow', 'fullstory', 'crazyegg',
  'clickadu', 'richpush', 'pushassist',
];

const MULTI_TLD = new Set(['co.uk', 'com.au', 'co.jp', 'com.br', 'co.in', 'com.mx', 'co.za', 'com.tr', 'co.kr']);

export function getRegistrableApex(host: string): string {
  const parts = host.toLowerCase().split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const last2 = parts.slice(-2).join('.');
  if (MULTI_TLD.has(last2)) return parts.slice(-3).join('.');
  return last2;
}

/** Popular sites that must stay reachable; only their ad/tracker hosts are filtered. */
export const TOP_SITE_APEXES = new Set([
  'google.com', 'youtube.com', 'youtu.be', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'wikipedia.org', 'amazon.com', 'reddit.com', 'yahoo.com', 'whatsapp.com', 'tiktok.com',
  'linkedin.com', 'netflix.com', 'microsoft.com', 'bing.com', 'apple.com', 'openai.com', 'chatgpt.com',
  'pornhub.com', 'xvideos.com', 'twitch.tv', 'discord.com', 'pinterest.com', 'zoom.us', 'spotify.com',
  'github.com', 'cnn.com', 'nytimes.com', 'bbc.com', 'bbc.co.uk', 'ebay.com', 'paypal.com',
  'theguardian.com', 'elpais.com', 'marca.com', 'duckduckgo.com', 'stackoverflow.com',
]);

const TOP_SITE_ENTRY_PREFIXES = new Set([
  'www', 'm', 'i', 'mobile', 'mail', 'maps', 'accounts', 'login', 'open', 'watch', 'player',
]);

export function isTopSiteEntryHost(domain: string): boolean {
  const apex = getRegistrableApex(domain);
  if (!TOP_SITE_APEXES.has(apex)) return false;
  if (domain === apex || domain === `www.${apex}` || domain === `m.${apex}`) return true;
  const sub = domain.slice(0, -(apex.length + 1));
  return TOP_SITE_ENTRY_PREFIXES.has(sub.split('.')[0]);
}
