import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";

const reactCompilerBabelPlugin = babel({
  filter: /\.[jt]sx?$/,
  include: /\/(app|shared)\//,
  exclude: /\/node_modules\//,
  babelConfig: {
    presets: ["@babel/preset-typescript"],
    plugins: ["babel-plugin-react-compiler"],
  },
});

export default defineConfig(() => ({
  plugins: [
    reactRouter(),
    reactCompilerBabelPlugin,
    tailwindcss(),
    tsconfigPaths(),
  ],
}));
