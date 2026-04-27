import { join, resolve } from "path";
import { existsSync, lstatSync } from "fs";

const APP_ROOT = "/app";

const server = Bun.serve({
  port: 3001,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    
    console.log(`[REQ] ${req.method} ${pathname}`);

    if (pathname !== "/") {
      // Procuramos em 3 locais absolutos garantidos
      const searchPaths = [
        resolve(APP_ROOT, "dist/client", cleanPath),
        resolve(APP_ROOT, "dist/client/assets", cleanPath.split("/").pop()),
        resolve(APP_ROOT, "dist/client", cleanPath.replace("assets/", ""))
      ];
      
      for (const p of searchPaths) {
        if (existsSync(p)) {
          if (lstatSync(p).isFile()) {
            console.log(`[OK] ACHADO: ${p}`);
            return new Response(Bun.file(p));
          }
        }
      }
    }

    try {
      const entry = await import("./dist/server/index.js");
      const handler = entry.default?.fetch || entry.default?.handler || entry.default || entry;
      // console.log(`[SSR] Renderizando: ${pathname}`);
      return await (typeof handler === "function" ? handler(req) : handler.fetch(req));
    } catch (e) {
      console.log(`[ERRO SSR] ${e.message}`);
      return new Response("Erro SSR: " + e.message, { status: 500 });
    }
  }
});

console.log("🚀 PONTE COMETA V12 ONLINE - COM DISPARO EM MASSA!");
