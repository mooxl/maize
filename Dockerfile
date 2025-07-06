# Build stage
FROM node:20-alpine AS build

# Build arguments
ARG CONVEX_DEPLOYMENT
ARG CONVEX_URL
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_DOMAIN
ARG CONVEX_DEPLOY_KEY

ENV CONVEX_DEPLOYMENT=$CONVEX_DEPLOYMENT
ENV CONVEX_URL=$CONVEX_URL
ENV VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
ENV VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN
ENV CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile 
COPY --chown=appuser:appgroup . .
RUN npx convex deploy --cmd 'npm run build'

# Production stage
FROM nginx:alpine-slim
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && rm -rf /usr/share/nginx/html/* \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && chown -R appuser:appgroup /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R appuser:appgroup /var/run/nginx.pid
COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=appuser:appgroup /app/dist /usr/share/nginx/html
USER appuser
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1
CMD ["nginx", "-g", "daemon off;"]