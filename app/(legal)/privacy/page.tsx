import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_UPDATED, LEGAL_UPDATED_LABEL } from "../updated";
import { SITE_URL } from "@/app/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How LinkedIn Post Generator handles data, hosting requests, and your privacy.",
  alternates: { canonical: `${SITE_URL}/privacy/` },
  openGraph: {
    title: "Privacy policy | LinkedIn Post Generator",
    description:
      "How LinkedIn Post Generator handles data, hosting requests, and your privacy.",
    type: "website",
    url: `${SITE_URL}/privacy/`,
  },
  twitter: {
    card: "summary",
    title: "Privacy policy | LinkedIn Post Generator",
    description:
      "How LinkedIn Post Generator handles data, hosting requests, and your privacy.",
  },
};

export default function PolicyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="text-xs text-muted-foreground tabular-nums">
        Last updated <time dateTime={LEGAL_UPDATED}>{LEGAL_UPDATED_LABEL}</time>
      </p>
      <h2>About this site</h2>
      <p>
        This policy covers LinkedIn Post Generator, operated by Gaya KACI in
        Paris, France. The site has no accounts, advertising, audience
        analytics, or tracking scripts. We do not sell visitor data or use it
        for marketing.
      </p>
      <h2>Who is responsible</h2>
      <p>
        Gaya KACI operates this site. For privacy questions or requests, email{" "}
        <a href="mailto:contact@gaya.anonaddy.com">contact@gaya.anonaddy.com</a>
        .
      </p>
      <h2>Your draft and images</h2>
      <p>
        Post text, names, selected images, and preview settings are edited in
        browser memory. They are not uploaded, sent to LinkedIn, or saved in an
        account or database. Leaving or reloading the editor can discard the
        draft. PNG exports are generated locally. Downloaded files and anything
        you copy to the clipboard remain under your control.
      </p>
      <p>
        The backdrop and preview theme can appear in the URL as bg and theme
        parameters. These are not post text, but the URL may be included in
        browser history and in GitHub’s request logs when requested.
      </p>
      <h2>Hosting and request logs</h2>
      <p>
        This site is a static export published on GitHub Pages, operated by
        GitHub, Inc. Serving a page requires processing your IP address and
        request details. GitHub carries this traffic and holds the site’s
        files; the operator runs no server of their own for this site.
      </p>
      <p>
        GitHub may log visitor IP addresses and request details to meet its
        legal obligations and to keep the service secure. Those logs belong to
        GitHub, not to the operator, and are covered by the{" "}
        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
          GitHub General Privacy Statement
        </a>
        . The operator does not receive them and has no access logs of their
        own.
      </p>
      <h2>Browser storage</h2>
      <p>
        The site remembers its theme in local storage. This is a browser
        preference, not a visitor identifier, and the app does not transmit it
        anywhere. The <Link href="/cookies">cookies policy</Link> lists
        storage and explains how to clear it.
      </p>
      <h2>Contact and external links</h2>
      <p>
        If you email{" "}
        <a href="mailto:contact@gaya.anonaddy.com">contact@gaya.anonaddy.com</a>
        , addy.io forwards the message to the operator’s mailbox. Those mail
        services process the message to deliver it. Correspondence is kept while
        needed to answer your request; you can ask for deletion.
      </p>
      <p>
        External links take you to independently operated services under their
        own policies. Fonts and site assets are served with the site; there are
        no embedded advertising or analytics widgets.
      </p>
      <h2>Your rights</h2>
      <p>
        Where the GDPR applies, you can request access, correction, erasure,
        restriction, or portability where applicable, and object to processing
        based on legitimate interests. Operating and securing the site and
        answering correspondence rely on those legitimate interests. Email the
        operator to exercise these rights. We normally respond within one month.
        You can also complain to your data protection authority, including the{" "}
        <a href="https://www.cnil.fr/">CNIL</a> in France.
      </p>
      <p>
        Browser-only files and preferences are not available to the operator.
        For those, use your browser’s site-data controls or remove your
        downloaded files yourself.
      </p>
      <h2>Changes</h2>
      <p>
        This page will be updated when the site’s data handling changes. The
        date above identifies the latest revision.
      </p>
      <p>
        <Link href="/cookies">Cookies policy</Link> ·{" "}
        <Link href="/">Back to LinkedIn Post Generator</Link>
      </p>
    </>
  );
}
