# Use a imagem oficial do Bun
FROM oven/bun:latest as builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package.json bun.lockb ./

# Instala as dependências
RUN bun install --frozen-lockfile

# Copia o restante do código
COPY . .

# Faz o build do projeto
RUN bun run build

# Estágio de produção
FROM oven/bun:latest as runner

WORKDIR /app

# Copia apenas o necessário do estágio de build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Comando para iniciar o servidor do TanStack Start
CMD ["bun", "run", ".output/server/index.mjs"]
