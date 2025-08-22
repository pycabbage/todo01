import type { Configuration } from "lint-staged"

const config: Configuration = {
  "*": () => ["biome check"],
}
export default config
