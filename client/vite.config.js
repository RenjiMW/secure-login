import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
// for local testing and developmnet
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});

/*
// ALTERNATIVE
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/secure-login/" : "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
}));
*/

//  for deployment on render.com
/* 
export default defineConfig({
  plugins: [react()],
});
*/
