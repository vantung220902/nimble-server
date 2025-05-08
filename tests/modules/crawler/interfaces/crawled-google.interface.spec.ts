import { CrawledGoogleResponse } from '@modules/crawler/interfaces';

describe('CrawledGoogleResponse', () => {
  it('Should initialize CrawledGoogleResponse correctly', () => {
    const crawledGoogleResponse: CrawledGoogleResponse = {
      keyword: 'keyword',
      totalAds: 0,
      totalLinks: 1,
      content: `<!DOCTYPE html>
<html>
  <head>
    <title>Hello, World!</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
      <h1 class="title">Hello World! </h1>
      <p id="currentTime"></p>
      <a href="https://www.google.com/">link</a>
      <script src="script.js"></script>
  </body>
</html>
`,
    };

    expect(crawledGoogleResponse).toBeDefined();
    expect(crawledGoogleResponse).toEqual({
      keyword: 'keyword',
      totalAds: 0,
      totalLinks: 1,
      content: `<!DOCTYPE html>
<html>
  <head>
    <title>Hello, World!</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
      <h1 class="title">Hello World! </h1>
      <p id="currentTime"></p>
      <a href="https://www.google.com/">link</a>
      <script src="script.js"></script>
  </body>
</html>
`,
    });
  });
});
