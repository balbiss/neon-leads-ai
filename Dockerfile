FROM oven/bun:latest
WORKDIR /app

# Variáveis para o Build (Vite precisa delas no momento do build)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

COPY package.json bun.lockb ./
RUN bun install

COPY . .

# Injeta as variáveis no .env para o build
RUN echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env && \
    echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env

RUN bun run build

EXPOSE 3001

# Nosso servidor customizado que resolve o problema de assets no Linux
CMD ["bun", "run", "entry.js"]
