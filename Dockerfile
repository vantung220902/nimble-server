# ----------> The build image
FROM node:20-bullseye-slim as build

WORKDIR /usr/src/app

RUN corepack enable

COPY . .

RUN yarn

RUN npx prisma generate

RUN NODE_OPTIONS="--max-old-space-size=6144" yarn build

# ----------> The production image
FROM node:20-bullseye-slim as run

ENV NODE_ENV production

WORKDIR /usr/src/app

# Install chromium dependencies
RUN apt-get update \
  && apt-get install -y chromium \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils \
  fonts-noto \
  fonts-noto-cjk \
  fonts-noto-color-emoji \
  fonts-crosextra-carlito \
  cabextract \
  xfonts-utils \
  && wget http://ftp.de.debian.org/debian/pool/contrib/m/msttcorefonts/ttf-mscorefonts-installer_3.8_all.deb \
  && dpkg -i ttf-mscorefonts-installer_3.8_all.deb \
  && fc-cache -f -v \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* ttf-mscorefonts-installer_3.8_all.deb

COPY --from=build /usr/src/app/dist dist
COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/package.json package.json

CMD ["node", "dist/src/main"]
