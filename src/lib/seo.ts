const FALLBACK_SITE = 'https://deadair.pages.dev';

export function siteUrl(site: URL | undefined): string {
  const value = site ?? FALLBACK_SITE;
  return (typeof value === 'string' ? value : value.href).replace(/\/$/, '');
}

export function ghostDescription(name: string, evidence: string[]): string {
  const base = `${name} evidence: ${evidence.join(', ')}.`;
  const short = `${base} Ability, weakness, hunt behavior, and identification tests for Phasmophobia.`;
  if (short.length >= 140) return short;
  return `${base} Ability, weakness, hunt behavior, and identification tests for Phasmophobia, plus practical tips.`;
}

export function evidenceDescription(name: string): string {
  return `How to test ${name} in Phasmophobia: what it looks like, how to confirm it, false positives to ignore, and every ghost that can leave it.`;
}

export function comparisonDescription(ghostA: string, ghostB: string): string {
  return `${ghostA} vs ${ghostB}: compare evidence, hunt sanity, base speed, and behavior to tell these Phasmophobia ghosts apart. Side-by-side reference for hunters.`;
}

export function ogImageKey(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  return clean === '' ? 'home' : clean.replace(/\//g, '-');
}

export function ogImagePath(pathname: string): string {
  return `/open-graph/${ogImageKey(pathname)}.png`;
}

type BreadcrumbItem = { name: string; url: string };

export function breadcrumbList(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(input: {
  headline: string;
  description: string;
  dateModified?: string;
  url: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author: { '@type': 'Organization', name: 'DEAD AIR editorial' },
    isAccessibleForFree: true,
    mainEntityOfPage: input.url,
  };
}
