export const GoogleCrawlerOption = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  ],
  link: 'https://www.google.com',
  cookieButtonElement: 'button[id="L2AGLb"]',
  searchInputElement: 'textarea[name="q"]',
  selector: '#search',
  primaryAdElement: 'div.RnJeZd.top.pla-unit-title',
  linkTag: 'a',
  viewPort: {
    width: 1200,
    height: 800,
  },
  cookies: [
    { name: 'NID', value: '123=abcd', domain: '.google.com' },
    { name: 'CONSENT', value: 'YES+', domain: '.google.com' },
  ],
};

export const EXPIRATION_KEYWORD_SECONDS = 18000 * 1000;
