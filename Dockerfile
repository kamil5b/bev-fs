FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
# Build client
RUN cd src/client && bun install && bunx vite build && cp -r dist/* ../../public/
EXPOSE 3000
CMD ["bun", "run", "src/server/index.ts"]
