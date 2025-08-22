import type { Configuration } from "lint-staged"

const config: Configuration = {
  "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": () => [
    "biome check --files-ignore-unknown=true", // フォーマットのチェックとリント
    "biome check --write --no-errors-on-unmatched", // フォーマット、インポート文のソート、リント、安全な修正の適用
    "biome check --write --unsafe --no-errors-on-unmatched", // フォーマット、インポート文のソート、リント、安全及び安全ではない修正の適用
    "biome format --write --no-errors-on-unmatched", // フォーマット
    "biome lint --write --no-errors-on-unmatched", // リントと安全な修正の適用
  ],
}
export default config
