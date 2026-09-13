import Script from "next/script";

/**
 * Microsoft Clarity — heatmaps and session replay for the marketing pages.
 *
 * Mounted only in the marketing layout, never in the app shell or on the
 * customer quote page. Clarity records the DOM to replay a session, so it must
 * not run anywhere a real name, address or price is on screen: that would send
 * our customers' customers to a third party who, by their own terms, may use it
 * to build advertising profiles.
 *
 * Off unless NEXT_PUBLIC_CLARITY_PROJECT_ID is set, so local development and
 * preview deployments do not fill the recordings with our own sessions. The
 * project ID is public by design — it identifies the project, it is not a key.
 */
export function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", ${JSON.stringify(projectId)});`}
    </Script>
  );
}
