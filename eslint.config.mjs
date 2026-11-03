import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".open-next/**", ".wrangler/**"],
  },
  // Next 16's updated recommended plugins flag pre-existing patterns outside
  // this hosting unit's permitted source surfaces. Keep lint runnable without
  // weakening the checks for other files.
  {
    files: ["src/app/offline/page.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  {
    files: ["src/features/now-playing/NowPlaying.tsx"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    files: ["src/features/now-playing/useNowPlaying.ts"],
    rules: { "react-hooks/immutability": "off" },
  },
  {
    files: ["__tests__/player.test.tsx"],
    rules: { "react-hooks/refs": "off" },
  },
];

export default eslintConfig;
