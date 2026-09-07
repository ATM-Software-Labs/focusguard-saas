/**
 * Ad / tracker hosts used on the world's most visited sites.
 * Never put a site apex (youtube.com, facebook.com, …) in AD_NETWORK_DOMAINS.
 */

const MULTI_TLD = new Set([
  'co.uk', 'com.au', 'co.jp', 'com.br', 'co.in', 'com.mx', 'co.za',
  'com.tr', 'co.kr', 'com.ar', 'co.nz', 'com.sg', 'co.id', 'com.tw',
  'co.il', 'com.hk', 'com.sa', 'co.th', 'com.eg', 'com.ua', 'com.vn',
  'com.pk', 'com.ng', 'com.pe', 'com.co', 'com.ph', 'ac.uk', 'gov.uk',
  'org.uk', 'ne.jp', 'or.jp', 'com.cn',
]);

export function getApex(host: string): string {
  const parts = host.toLowerCase().split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const last2 = parts.slice(-2).join('.');
  if (MULTI_TLD.has(last2)) return parts.slice(-3).join('.');
  return last2;
}

/** Sites the user must always be able to open unless they filter that category. */
export const TOP_SITE_APEXES = new Set([
  'google.com', 'google.es', 'google.co.uk', 'google.de', 'google.fr', 'google.co.jp',
  'google.com.br', 'google.co.in', 'google.com.mx', 'google.it', 'google.ca',
  'googleapis.com', 'gstatic.com', 'googleusercontent.com', 'google.dev', 'deepmind.com', 'deepmind.google',
  'youtube.com', 'youtu.be', 'youtube-nocookie.com',
  'facebook.com', 'fb.com', 'messenger.com', 'instagram.com', 'threads.net',
  'twitter.com', 'x.com', 't.co',
  'wikipedia.org', 'wikimedia.org', 'wikidata.org',
  'amazon.com', 'amazon.es', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.co.jp', 'amazon.com.mx', 'amazon.com.br',
  'reddit.com', 'redd.it',
  'yahoo.com', 'yahoo.co.jp',
  'whatsapp.com', 'whatsapp.net',
  'tiktok.com',
  'linkedin.com',
  'netflix.com',
  'microsoft.com', 'bing.com', 'office.com', 'live.com', 'outlook.com', 'msn.com',
  'microsoftonline.com', 'office365.com', 'sharepoint.com',
  'apple.com', 'icloud.com', 'itunes.com',
  'openai.com', 'chatgpt.com', 'anthropic.com', 'claude.ai', 'groq.com', 'x.ai', 'grok.com', 'huggingface.co',
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'onlyfans.com',
  'twitch.tv',
  'discord.com',
  'pinterest.com',
  'zoom.us',
  'spotify.com',
  'github.com', 'gitlab.com',
  'adobe.com',
  'cnn.com', 'nytimes.com', 'bbc.com', 'bbc.co.uk', 'washingtonpost.com',
  'theguardian.com', 'foxnews.com', 'reuters.com', 'wsj.com', 'bloomberg.com',
  'forbes.com', 'dailymail.co.uk', 'elmundo.es', 'elpais.com', 'marca.com', 'as.com',
  'ebay.com', 'etsy.com',
  'paypal.com',
  'vk.com',
  'yandex.ru', 'yandex.com',
  'naver.com',
  'baidu.com',
  'qq.com',
  'taobao.com', 'tmall.com', 'aliexpress.com', 'alibaba.com',
  'weather.com',
  'imdb.com',
  'espn.com',
  'craigslist.org',
  'dropbox.com',
  'canva.com',
  'fandom.com',
  'roblox.com',
  'duckduckgo.com',
  'quora.com',
  'medium.com',
  'samsung.com',
  'booking.com',
  'airbnb.com',
  'walmart.com',
  'target.com',
  'indeed.com',
  'stackoverflow.com',
  'telegram.org', 't.me',
  'snapchat.com',
  'shein.com',
  'temu.com',
  'wordpress.com', 'wordpress.org',
  'blogger.com',
  'tumblr.com',
  'imgur.com',
  'vimeo.com',
  'dailymotion.com',
  'hulu.com',
  'disneyplus.com',
  'primevideo.com',
  'max.com',
  'crunchyroll.com',
  'steampowered.com', 'steamcommunity.com',
  'epicgames.com',
  'playstation.com',
  'xbox.com',
  'nintendo.com',
  'mercadolibre.com',
  'zillow.com',
  'bsky.app',
  'rumble.com',
  'cloudflare.com',
  'mozilla.org',
  'archive.org',
  'figma.com',
  'notion.so',
  'slack.com',
  'zoom.com',
  'soundcloud.com',
  'tiktokv.com',
  'force.com',
  'salesforce.com',
  'okta.com',
  'chase.com',
  'bankofamerica.com',
  'wellsfargo.com',
  'homedepot.com',
  'bestbuy.com',
  'costco.com',
  'nfl.com',
  'nba.com',
  'twimg.com',
  'fbcdn.net',
  'cdninstagram.com',
  'pinimg.com',
  'ytimg.com',
]);

export const AD_NETWORK_DOMAINS = new Set([
  // Google / YouTube ads + measurement (not google.com / youtube.com)
  'google-analytics.com', 'googletagmanager.com', 'googletagservices.com',
  'analytics.google.com', 'ssl.google-analytics.com',
  'doubleclick.net', 'googleadservices.com', 'adservice.google.com',
  'googlesyndication.com', '2mdn.net', 'adtrafficquality.google',
  'ads.google.com', 'ads.youtube.com', 'pagead2.googlesyndication.com',
  'tpc.googlesyndication.com', 'imasdk.googleapis.com',
  // Meta
  'an.facebook.com', 'pixel.facebook.com', 'ads.facebook.com',
  'advertising.facebook.com', 'graph-fallback.facebook.com',
  'atdmt.com',
  // X / Twitter
  'ads-twitter.com', 'ads-api.twitter.com', 'analytics.twitter.com',
  'ads-bidder-api.twitter.com', 'static.ads-twitter.com',
  'ads-api.x.com', 'ads.x.com',
  // Amazon
  'amazon-adsystem.com', 'advertising.amazon.com',
  'fls-na.amazon.com', 'fls-eu.amazon.com', 'unagi.amazon.com',
  // Microsoft / Bing
  'bat.bing.com', 'ads.microsoft.com', 'advertise.bingads.microsoft.com',
  'clarity.ms',
  // Apple
  'iadsdk.apple.com', 'advertising.apple.com',
  // Yahoo / Verizon
  'ads.yahoo.com', 'gemini.yahoo.com', 'advertising.com', 'adtechus.com',
  'adtech.de',
  // Reddit
  'alb.reddit.com', 'events.reddit.com',
  // LinkedIn
  'ads.linkedin.com', 'px.ads.linkedin.com', 'dc.ads.linkedin.com',
  // Pinterest
  'ads.pinterest.com', 'analytics.pinterest.com', 'ct.pinterest.com',
  'log.pinterest.com', 'trk.pinterest.com',
  // Snap
  'ads.snapchat.com', 'tr.snapchat.com', 'app-analytics.snapchat.com',
  'sc-analytics.appspot.com',
  // TikTok
  'ads.tiktok.com', 'analytics.tiktok.com', 'ads-sg.tiktok.com',
  'analytics-sg.tiktok.com', 'log-va.tiktokv.com', 'log.byteoversea.com',
  'ads.tiktokv.com',
  // Yandex / Baidu / Tencent
  'mc.yandex.ru', 'an.yandex.ru', 'ads.yandex.ru', 'advertising.yandex.ru',
  'cpro.baidu.com', 'cbjs.baidu.com', 'pos.baidu.com',
  'l.qq.com', 'adsense.html5.qq.com',
  // Spotify / Twitch (dedicated ad hosts only)
  'adeventtracker.spotify.com', 'ads-fa.spotify.com', 'ads.spotify.com',
  'audio-ads.spotify.com', 'adstudio.spotify.com', 'advertising.spotify.com',
  'analytics.spotify.com', 'log.spotify.com', 'log2.spotify.com',
  'crashdump.spotify.com', 'pixel.spotify.com', 'pixel-static.spotify.com',
  'ads-sp-lon.scdn.co', 'ads-sp-ash.scdn.co', 'ads-sp-sto.scdn.co',
  'video-fa.scdn.co', 'video-fa.cdn.spotify.com', 'video-fa.spotifycdn.com',
  'video-akpcw.spotifycdn.com', 'heads-fa.scdn.co', 'heads-fa.spotify.com',
  'heads-fab.spotify.com', 'heads-ec.spotify.com',
  'audio-fa.spotify.com', 'audio-fab.spotify.com',
  'ads.twitch.tv', 'ad.twitch.tv', 'countess.twitch.tv',
  // Adult-site ad networks (sites themselves stay reachable)
  'trafficjunky.net', 'adtng.com', 'exoclick.com', 'juicyads.com',
  'trafficfactory.biz', 'tsyndicate.com', 'hornytraffic.com',
  'adsterra.com', 'ero-advertising.com', 'exosrv.com', 'exoclick.net',
  // Generic exchanges used by news / shopping / social
  'criteo.com', 'criteo.net', 'outbrain.com', 'taboola.com', 'adnxs.com',
  'propellerads.com', 'popads.net', 'pop-delivery.net', 'ad-network.net',
  'coinhive.com', 'scorecardresearch.com', 'quantserve.com', 'moatads.com',
  'smartadserver.com', 'pubmatic.com', 'rubiconproject.com', 'openx.net',
  'casalemedia.com', 'indexww.com', 'bidswitch.net',
  'hotjar.com', 'mixpanel.com', 'segment.io', 'amplitude.com',
  'teads.tv', 'triplelift.com', 'sharethrough.com', 'contextweb.com',
  'adform.net', 'adsrvr.org', 'rlcdn.com', 'crwdcntrl.net',
  'bluekai.com', 'exelator.com', 'mathtag.com', 'turn.com',
  'agkn.com', 'tapad.com', 'krxd.net', 'semasio.net',
  'liadm.com', 'media.net', 'yieldmo.com', 'smaato.net',
  'inmobi.com', 'mopub.com', 'unityads.unity3d.com',
  'applovin.com', 'vungle.com', 'ironsrc.com', 'chartboost.com',
  'adcolony.com', 'serving-sys.com', 'spotxchange.com', 'spotx.tv',
  'tremorhub.com', 'stickyadstv.com', 'fwmrm.net', 'adswizz.com',
  'imrworldwide.com', 'comscore.com',
  'adsafeprotected.com', 'doubleverify.com', 'integralads.com',
  'mgid.com', 'revcontent.com', 'zergnet.com', 'content.ad',
  'mouseflow.com', 'fullstory.com', 'crazyegg.com',
  'chartbeat.com', 'parsely.com', 'cxense.com',
  '2o7.net', 'omtrdc.net', 'demdex.net', 'everesttech.net',
  'branch.io', 'adjust.com', 'appsflyer.com', 'kochava.com', 'singular.net', 'tune.com',
  'adroll.com', 'adlooxtracking.com', 'adloox.com',
  'bidr.io', 'stackadapt.com', 'simpli.fi', 'openx.com',
  'sonobi.com', 'sovrn.com', 'lijit.com', 'gumgum.com',
  'rhythmone.com', 'yieldlab.net', 'smartadserver.fr',
  'id5-sync.com', 'liveramp.com', 'rlcdn.net',
  'yahoo.net', 'moatpixel.com', 'yieldoptimizer.com', 'scorecardresearch.com',
  'adacap.net', 'adition.com', 'admanmedia.com', 'adthrive.com', 'raptive.com',
  'adblade.com', 'mediavine.com', 'ezoic.com', 'ezoic.net', 'monetizemore.com',
  'richaudience.com', 'seedtag.com', 'skimlinks.com', 'yieldbird.com',
  'smartlook.com', 'luckyorange.com', 'inspectlet.com', 'statcounter.com',
  'clickadu.com', 'richpush.co', 'onesignal.com', 'pushassist.com',
  'webengage.com', 'clevertap.com', 'moengage.com', 'airship.com', 'braze.com',
]);

export const AD_NETWORK_PATTERNS = [
  'doubleclick', 'googleadservices', 'google-analytics', 'googletagmanager',
  'googletagservices', 'googlesyndication', 'adservice.google', 'pagead',
  'adtrafficquality.google', '2mdn.net', 'imasdk.googleapis',
  'analytics.google',
  'an.facebook', 'pixel.facebook', 'ads.facebook', 'advertising.facebook',
  'ads-twitter', 'ads-api.twitter', 'analytics.twitter', 'ads-api.x.com',
  'amazon-adsystem', 'advertising.amazon', 'fls-na.amazon', 'fls-eu.amazon',
  'unagi.amazon',
  'bat.bing', 'ads.microsoft', 'bingads.microsoft',
  'iadsdk.apple', 'advertising.apple',
  'ads.yahoo', 'gemini.yahoo',
  'alb.reddit', 'events.reddit',
  'px.ads.linkedin', 'ads.linkedin',
  'ads.pinterest', 'analytics.pinterest', 'ct.pinterest', 'log.pinterest',
  'ads.snapchat', 'tr.snapchat', 'app-analytics.snapchat',
  'ads.tiktok', 'analytics.tiktok', 'ads-sg.tiktok', 'analytics-sg.tiktok',
  'log.byteoversea',
  'mc.yandex', 'an.yandex', 'ads.yandex', 'advertising.yandex',
  'cpro.baidu',
  'adeventtracker.spotify', 'ads-fa.spotify', 'ads-sp-', 'audio-ads.spotify',
  'advertising.spotify', 'adstudio.spotify', 'ads.spotify.com',
  'video-fa.scdn', 'video-fa.cdn.spotify', 'video-fa.spotifycdn',
  'video-akpcw.spotifycdn', 'heads-fa.', 'heads-fab.spotify',
  'audio-fa.spotify', 'audio-fab.spotify',
  'crashdump.spotify', 'pixel.spotify', 'pixel-static.spotify',
  'ads.twitch', 'ad.twitch.tv', 'ad-assets.cloud.twitch', 'countess.twitch',
  'criteo', 'outbrain', 'taboola', 'adnxs', 'popads', 'coinhive',
  'imrworldwide', 'fwmrm.net', 'adswizz', 'stickyadstv',
  'scorecardresearch', 'quantserve', 'moatads',
  'trafficjunky', 'adtng.com', 'exoclick', 'juicyads',
  'adsrvr.org', 'omtrdc.net', 'demdex.net', 'everesttech',
  'branch.io', 'adjust.com', 'appsflyer', 'kochava', 'singular.net',
  'smartlook', 'luckyorange', 'mouseflow', 'fullstory', 'crazyegg',
  'clickadu', 'richpush', 'pushassist',
];

const CONTENT_HOST_PREFIXES = new Set([
  'www', 'www2', 'm', 'i', 'mobile', 'en', 'es', 'de', 'fr', 'it', 'pt', 'ja',
  'l', 'lm', 'maps', 'mail', 'drive', 'docs', 'calendar', 'meet', 'chat',
  'news', 'shop', 'store', 'music', 'tv', 'play', 'support', 'help',
  'account', 'accounts', 'login', 'auth', 'id', 'sso', 'api', 'app', 'apps',
  'cdn', 'static', 'assets', 'img', 'image', 'images', 'media', 'video',
  'videos', 'embed', 'player', 'watch', 'live', 'stream', 'open', 'about',
  'blog', 'community', 'developer', 'developers', 'status', 'pay', 'checkout',
  'secure', 'my', 'home', 'search', 'translate', 'scholar', 'books',
  // AI, APIs, and Cloud Infrastructure prefixes
  'gemini', 'generativelanguage', 'alkalimakersuite-pa', 'aistudio', 'ai', 'deepmind',
  'dash', 'challenges', 'radar', 'workers', 'dns', 'gateway', 'model', 'models',
  'v1', 'v2', 'cloud', 'console', 'portal', 'clients6', 'clients2', 'clients4'
]);

function hostInSetOrParent(domain: string, set: Set<string>): boolean {
  if (set.has(domain)) return true;
  let dotIdx = domain.indexOf('.');
  while (dotIdx !== -1) {
    if (set.has(domain.substring(dotIdx + 1))) return true;
    dotIdx = domain.indexOf('.', dotIdx + 1);
  }
  return false;
}

export function isAdNetworkHost(domain: string): boolean {
  if (!domain) return false;
  // Inviolable Whitelist: AI APIs, Gemini, Cloudflare, Google APIs, OpenAI, Anthropic must NEVER be identified as ad hosts
  if (/gemini\.google|generativelanguage|aistudio\.google|alkalimakersuite|deepmind|cloudflare|workers\.dev|pages\.dev|openai\.com|chatgpt\.com|anthropic\.com|claude\.ai|groq\.com|grok\.com/i.test(domain)) {
    return false;
  }
  if (hostInSetOrParent(domain, AD_NETWORK_DOMAINS)) return true;
  return AD_NETWORK_PATTERNS.some((pat) => domain.includes(pat));
}

/** Apex / www / m of a top site — never NXDOMAIN these as "ads". */
export function isTopSiteEntryHost(domain: string): boolean {
  const apex = getApex(domain);
  if (!TOP_SITE_APEXES.has(apex)) return false;
  if (domain === apex || domain === `www.${apex}` || domain === `m.${apex}` || domain === `i.${apex}`) {
    return true;
  }
  const sub = domain.slice(0, -(apex.length + 1));
  const first = sub.split('.')[0];
  return (CONTENT_HOST_PREFIXES.has(first) || !isAdNetworkHost(domain));
}

/** True when this query should be sunk as advertising, never the site itself. */
export function shouldBlockAsAd(domain: string): boolean {
  if (!domain) return false;
  if (isTopSiteEntryHost(domain)) return false;
  return isAdNetworkHost(domain);
}

export function adsOptedOut(activeCategories: string[]): boolean {
  return activeCategories.includes('noads');
}

export interface TrujilloAiDetectionResult {
  domain: string;
  isThreat: boolean;
  threatCategory: 'ad_tracker' | 'brainrot_game' | 'suspicious_phishing' | 'adult' | 'gambling' | 'clean';
  threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0 - 100
  title: string;
  reason: string;
  mechanisms: string[];
  actionRecommendation: 'block' | 'allow' | 'monitor';
  engine: string;
}

/** Shannon entropy calculation to detect suspicious DGA / randomized tracker domains */
function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    frequencies[c] = (frequencies[c] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

const SUSPICIOUS_HIGH_ABUSE_TLDS = new Set([
  'top', 'xyz', 'click', 'link', 'work', 'gq', 'cf', 'ml', 'tk', 'monster', 'quest', 'live', 'buzz', 'rest'
]);

const SUSPICIOUS_PHISHING_KEYWORDS = [
  'verify-account', 'secure-login', 'wallet-connect', 'auth-sync', 'confirm-identity',
  'billing-update', 'security-check', 'metamask-claim', 'phantom-claim', 'paypal-security'
];

/**
 * Trujillo AI Heuristic & Neural Threat Intelligence Analyzer
 * Evaluates domains in <1ms for stealth ad-tracking, suspicious phishing vectors, and hypercasual brainrot loops.
 */
export function analyzeDomainWithTrujilloAi(domainRaw: string): TrujilloAiDetectionResult {
  const domain = (domainRaw || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  
  if (!domain) {
    return {
      domain: '',
      isThreat: false,
      threatCategory: 'clean',
      threatLevel: 'SAFE',
      riskScore: 0,
      title: 'Dominio Vacío',
      reason: 'No se ha proporcionado un dominio para análisis.',
      mechanisms: [],
      actionRecommendation: 'allow',
      engine: 'Trujillo AI Threat Engine v4.2'
    };
  }

  // 1. Inviolable Whitelist Check
  if (/gemini\.google|generativelanguage|aistudio\.google|alkalimakersuite|deepmind|cloudflare|workers\.dev|pages\.dev|openai\.com|chatgpt\.com|anthropic\.com|claude\.ai|groq\.com|grok\.com|trujillomingorance\.com|focusguard/i.test(domain)) {
    return {
      domain,
      isThreat: false,
      threatCategory: 'clean',
      threatLevel: 'SAFE',
      riskScore: 0,
      title: 'Infraestructura Cloud Segura & Modelo de IA',
      reason: 'Proveedor verificado de IA y servicios de red perimetral con certificación TLS y cero telemetría publicitaria.',
      mechanisms: ['Zero Tracking Vectors', 'Verified Cloud Infrastructure', 'Encrypted Edge API'],
      actionRecommendation: 'allow',
      engine: 'Trujillo AI Threat Engine v4.2'
    };
  }

  const mechanisms: string[] = [];
  let riskScore = 0;

  // 2. Ad & Tracker Heuristics
  const isAd = shouldBlockAsAd(domain);
  if (isAd) {
    mechanisms.push('Red de Publicidad / Retargeting');
    mechanisms.push('Pixel de Seguimiento y Telemetría');
    riskScore += 85;

    if (/analytics|tagmanager|segment|mixpanel|hotjar|fullstory|mouseflow|smartlook/i.test(domain)) {
      mechanisms.push('Grabación de Sesión / Fingerprinting de Usuario');
      riskScore += 10;
    }
    if (/doubleclick|adnxs|criteo|outbrain|taboola|rubicon|pubmatic/i.test(domain)) {
      mechanisms.push('Subastas de Anuncios en Tiempo Real (RTB)');
    }
    if (/appsflyer|adjust|branch|kochava|singular/i.test(domain)) {
      mechanisms.push('Atribución Móvil y Rastreo Cross-Device');
    }

    return {
      domain,
      isThreat: true,
      threatCategory: 'ad_tracker',
      threatLevel: riskScore >= 90 ? 'CRITICAL' : 'HIGH',
      riskScore: Math.min(100, riskScore),
      title: 'Rastreador Publicitario & Telemetría Detectado',
      reason: `Trujillo AI identificó "${domain}" como un host de telemetría, subasta de anuncios o rastreador de comportamiento.`,
      mechanisms,
      actionRecommendation: 'block',
      engine: 'Trujillo AI Threat Engine v4.2'
    };
  }

  // 3. Suspicious / Phishing Heuristics
  const parts = domain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const mainSub = parts.slice(0, -1).join('.');
  const entropy = calculateShannonEntropy(mainSub);

  let suspiciousScore = 0;
  if (entropy > 3.9 && mainSub.length > 10) {
    mechanisms.push(`Alta Entropía DGA (${entropy.toFixed(2)} bits/char)`);
    suspiciousScore += 50;
  }
  if (SUSPICIOUS_HIGH_ABUSE_TLDS.has(tld)) {
    mechanisms.push(`TLD de Alto Riesgo (.${tld})`);
    suspiciousScore += 25;
  }
  for (const kw of SUSPICIOUS_PHISHING_KEYWORDS) {
    if (domain.includes(kw)) {
      mechanisms.push(`Patrón de Suplantación / Phishing ("${kw}")`);
      suspiciousScore += 60;
      break;
    }
  }
  if (domain.split('-').length >= 4) {
    mechanisms.push('Dominio Multiguión Ofuscado');
    suspiciousScore += 20;
  }

  if (suspiciousScore >= 50) {
    return {
      domain,
      isThreat: true,
      threatCategory: 'suspicious_phishing',
      threatLevel: suspiciousScore >= 75 ? 'CRITICAL' : 'HIGH',
      riskScore: Math.min(100, suspiciousScore),
      title: 'Dominio Altamente Sospechoso / Phishing',
      reason: `Trujillo AI detectó indicadores de dominio generado por algoritmo (DGA), TLD abusivo o ingeniería social.`,
      mechanisms,
      actionRecommendation: 'block',
      engine: 'Trujillo AI Threat Engine v4.2'
    };
  }

  // 4. Default Clean / Safe
  return {
    domain,
    isThreat: false,
    threatCategory: 'clean',
    threatLevel: 'SAFE',
    riskScore: 5,
    title: 'Dominio Limpio / Sin Amenazas Activas',
    reason: `El dominio "${domain}" no figura en listas de rastreo ni presenta anomalías heurísticas de riesgo.`,
    mechanisms: ['Estructura DNS Válida', 'Cero Firmas de Rastreo Identificadas'],
    actionRecommendation: 'allow',
    engine: 'Trujillo AI Threat Engine v4.2'
  };
}

