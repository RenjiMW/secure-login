// for deployment on Render
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});

////////////////////////////////////////////////
/* FOR local testin
// https://vite.dev/config/
export default defineConfig({
  base: "/secure-login/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
*/

/* 
//
////////////////////////////////////////////////
// 
//       TEST no. 1
//
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // ← TA LINIJKA: udostępnia frontend w sieci lokalnej (np. telefonowi)
    port: 5173, // (opcjonalnie, ale dobrze ustalić na sztywno)
    proxy: {
      "/api": "http://localhost:3001", // ← proxy do backendu Expressa
    },
  },
});


//
////////////////////////////////////////////////
//
//       TEST no. 2
//
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // ← TA LINIJKA: udostępnia frontend w sieci lokalnej (np. telefonowi)
    port: 5173, // (opcjonalnie, ale dobrze ustalić na sztywno)
    proxy: {
      "/api": "http://192.168.0.129:3001",
    },
  },
});
*/
