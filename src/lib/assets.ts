/**
 * Static files must live under `public/` (e.g. `public/assets/logo.png` → `/assets/logo.png`).
 * The repo-root `assets/` folder is not served by Next.js; keep `public/assets/` in sync.
 */
export function assetPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return encodeURI(normalized);
}

export const ASSETS = {
  logo: assetPath("/assets/logo-golden.png"),
  raastPayment: assetPath("/assets/raast-payment.png"),
  heroPoster: assetPath(
    "/assets/Banner - International RishtaConnecting Hearts Worldwide.png"
  ),
  heroVideos: [
    assetPath("/assets/Banner-Video-01-15-21.mp4"),
    assetPath("/assets/Banner-Video-07-06-21.mp4"),
    assetPath("/assets/Banner-Video-10-24-19.mp4"),
  ],
} as const;
