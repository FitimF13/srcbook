# Verwende ein Node.js-Image mit der gewünschten Version
FROM node:22.7.0-alpine3.20

# Setze das Arbeitsverzeichnis innerhalb des Containers
WORKDIR /app

# Aktiviere corepack und bereite pnpm vor
RUN corepack enable && corepack prepare pnpm@9.12.1 --activate

# Kopiere die Paketdateien als erstes, um Caching von Abhängigkeiten zu ermöglichen
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages packages/
COPY srcbook srcbook/
COPY turbo.json ./

# Installiere Abhängigkeiten
RUN pnpm install

# Baue die Anwendung
RUN pnpm build

# Erstelle notwendige Verzeichnisse für Volumes
RUN mkdir -p /root/.srcbook /root/.npm

# Setze den Startbefehl für den Container (den du in Render benötigst)
CMD ["pnpm", "start"]

# Exponiere den Port, den Render verwenden wird (Render setzt den Port automatisch, aber du kannst ihn hier explizit angeben)
EXPOSE 2150
