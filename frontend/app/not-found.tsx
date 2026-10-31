import Link from "next/link";

export default function NotFound() {
  return (
    <main className="marketing-page not-found-page">
      <header className="marketing-header">
        <Link className="brand-mark" href="/" aria-label="Jharo home"><span className="brand-symbol" aria-hidden="true">j</span><span>Jharo</span></Link>
        <Link href="/" className="marketing-nav-link">Back to home</Link>
      </header>
      <section className="not-found-content">
        <p className="marketing-kicker"><span /> A page out of place</p>
        <p className="not-found-code">404</p>
        <h1>This page wandered<br /><em>off the shelf.</em></h1>
        <p className="not-found-copy">The address may be old, or the page may have moved. Let’s get you back to your reading space.</p>
        <Link href="/" className="marketing-button">Return to the home page <span aria-hidden="true">→</span></Link>
      </section>
      <footer className="marketing-footer"><span>jharo</span><p>PDF library · Reader · Reading activity</p><Link href="/about">About Jharo</Link></footer>
    </main>
  );
}
