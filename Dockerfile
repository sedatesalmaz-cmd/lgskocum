# Rota — LGS çalışma sistemi
# Vinext (Vite) ile Cloudflare Worker'a derlenir, wrangler dev ile servis edilir.
# workerd glibc gerektirdiği için Debian tabanlı (slim) imaj kullanılır — alpine (musl) çalışmaz.
FROM node:22-slim

# workerd/miniflare çalışma zamanı için gerekli sistem araçları
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# NOT: Bu ağ, HTTPS trafiğini denetleyen bir TLS-inceleme proxy'si arkasında.
# Container o proxy'nin köküne güvenmediği için paket indirimleri sertifika
# doğrulamasında kırılıyor. TLS doğrulaması YALNIZCA aşağıdaki build adımlarında
# gevşetilir (NODE_TLS_REJECT_UNAUTHORIZED / strict-ssl); çalışma zamanına taşınmaz.
RUN npm config set strict-ssl false && npm install -g pnpm@10

WORKDIR /app

# Wrangler'ı tamamen yerel/offline modda ve gürültüsüz çalıştır
ENV WRANGLER_SEND_METRICS=false \
    CI=true \
    NODE_ENV=production

# Bağımlılıkları önce kur (katman önbelleği için)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# package.json temizlendiği için lockfile senkron değil; reconcile edilmesine izin ver
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm install --no-frozen-lockfile --config.strict-ssl=false

# Kaynağı kopyala ve Worker'ı derle
COPY . .
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm build

EXPOSE 8080

# Derlenen Worker'ı tüm arayüzlerde 8080 portunda servis et
CMD ["pnpm", "exec", "wrangler", "dev", "--config", "dist/server/wrangler.json", "--ip", "0.0.0.0", "--port", "8080"]
