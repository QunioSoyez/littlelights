import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";
import type { PropsWithChildren } from "react";

// Web only: the HTML shell for every page on littlelights.live.
// SDK 58 note: headNodes / bodyNodes carry the app's JS and CSS. Without them pages load blank.
export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta
          name="description"
          content="Little Lights helps children enjoy the Bible with illustrated stories they can read along with, games, coloring, family prayer and a thank-you journal."
        />
        <meta name="theme-color" content="#114C88" />
        {/* Google AdSense. Every ad unit must have data-tag-for-age-treatment="1" (COPPA). */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8809349846108777"
          crossOrigin="anonymous"
        />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
