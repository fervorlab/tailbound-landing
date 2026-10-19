import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// All pages read committed translations; no mutable cache or database is needed.
export default defineCloudflareConfig();
