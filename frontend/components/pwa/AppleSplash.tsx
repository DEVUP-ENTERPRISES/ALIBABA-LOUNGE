/**
 * Apple launch images.
 *
 * iOS ignores the web manifest for splash screens and only honours
 * apple-touch-startup-image, matched by an exact media query per device. Any
 * device without a match gets a blank white flash on launch, which
 * immediately breaks the illusion of a real app.
 *
 * Rendered server-side into <head>; there is no client behaviour here.
 */
const SCREENS: { w: number; h: number; ratio: number }[] = [
  { w: 1179, h: 2556, ratio: 3 }, // iPhone 15 / 16
  { w: 1290, h: 2796, ratio: 3 }, // 15 / 16 Pro Max
  { w: 1170, h: 2532, ratio: 3 }, // 12 / 13 / 14
  { w: 1284, h: 2778, ratio: 3 }, // 12 / 13 / 14 Pro Max
  { w: 1125, h: 2436, ratio: 3 }, // X / XS / 11 Pro
  { w: 828, h: 1792, ratio: 2 }, // XR / 11
  { w: 1242, h: 2688, ratio: 3 }, // XS Max / 11 Pro Max
  { w: 750, h: 1334, ratio: 2 }, // SE / 8
  { w: 1242, h: 2208, ratio: 3 }, // 8 Plus
  { w: 1620, h: 2160, ratio: 2 }, // iPad 10.2
  { w: 1668, h: 2388, ratio: 2 }, // iPad Pro 11
  { w: 2048, h: 2732, ratio: 2 }, // iPad Pro 12.9
];

export function AppleSplash() {
  return (
    <>
      {SCREENS.map(({ w, h, ratio }) => (
        <link
          key={`${w}x${h}`}
          rel="apple-touch-startup-image"
          href={`/splash/${w}x${h}.png`}
          media={`(device-width: ${w / ratio}px) and (device-height: ${
            h / ratio
          }px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`}
        />
      ))}
    </>
  );
}
