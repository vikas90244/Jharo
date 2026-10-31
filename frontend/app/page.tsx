import type { Metadata } from "next";
import Link from "next/link";
import { LandingAuthRedirect } from "@/components/landing/landing-auth-redirect";

export const metadata: Metadata = {
  title: "PDF book library, reader, and reading activity",
  description:
    "Upload PDF books to your Jharo library, read them in the browser, look up words, and track pages read and words learned.",
  openGraph: {
    title: "Jharo — PDF book library and reader",
    description:
      "Upload and read PDF books, look up words from the text, and view your reading activity.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="marketing-page">
      <LandingAuthRedirect />
      <header className="marketing-header">
        <Link className="brand-mark" href="/" aria-label="Jharo home">
          <span className="brand-symbol" aria-hidden="true">j</span>
          <span>Jharo</span>
        </Link>
        <nav className="marketing-nav" aria-label="Main navigation">
          <Link href="/about" className="marketing-nav-link">About</Link>
          <Link href="/login" className="marketing-nav-link">Log in</Link>
          <Link href="/register" className="marketing-button marketing-button-small">Create your library <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="marketing-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="marketing-kicker"><span /> PDF library · Reader · Reading activity</p>
          <h1 id="hero-title">Your PDF books,<br />in one <em>library.</em></h1>
          <p className="hero-description">
            Upload PDF books, read them in Jharo, look up words from the text, and keep
            track of pages read and words learned.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="marketing-button">Create an account <span aria-hidden="true">→</span></Link>
            <Link href="/about" className="text-link">See what Jharo offers <span aria-hidden="true">↗</span></Link>
          </div>
          <p className="hero-note">PDF library · In-page word lookup · Reading activity</p>
        </div>
        <div className="reading-art" aria-label="Illustration of a book open on a reading desk" role="img">
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-caption"><span>YOUR NEXT CHAPTER</span><span>01 — 04</span></div>
          <div className="book-stack">
            <div className="book book-back"><span>NOTES ON<br />THE NATURAL WORLD</span></div>
            <div className="book book-middle"><span>THE ART OF<br />PAYING ATTENTION</span></div>
            <div className="open-book">
              <div className="book-page page-left"><span className="page-number">12</span><i /><i /><i /><i /><i /><i /></div>
              <div className="book-spine" />
              <div className="book-page page-right"><span className="page-mark" /><i /><i /><i /><i /><i /><i /><span className="page-number">13</span></div>
            </div>
          </div>
          <div className="art-footnote"><span className="footnote-dot" /> A little more present with every page</div>
        </div>
      </section>

      <section className="benefits-section" aria-labelledby="benefits-title">
        <div className="section-heading">
          <p className="marketing-kicker">WHAT YOU CAN DO WITH JHARO</p>
          <h2 id="benefits-title">Books, reading, and activity<br />in one place.</h2>
        </div>
        <div className="benefit-grid">
          <article className="benefit-card">
            <span className="benefit-index">01</span>
            <div className="benefit-icon icon-library" aria-hidden="true"><span /><span /><span /></div>
            <h3>Store PDF books</h3>
            <p>Upload PDF files and find them in your personal library.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-index">02</span>
            <div className="benefit-icon icon-word" aria-hidden="true">Aa<span>↗</span></div>
            <h3>Look up words</h3>
            <p>Select a word in the reader to view its meaning while you read.</p>
          </article>
          <article className="benefit-card">
            <span className="benefit-index">03</span>
            <div className="benefit-icon icon-progress" aria-hidden="true"><span>7</span><i /></div>
            <h3>View reading activity</h3>
            <p>Review pages read, words learned, and your reading activity by day.</p>
          </article>
        </div>
      </section>

      <section className="closing-section">
        <span className="closing-spark" aria-hidden="true">✳</span>
        <p className="marketing-kicker">GET STARTED</p>
        <h2>Make a library<br /><em>for your PDFs.</em></h2>
        <Link href="/register" className="marketing-button">Create an account <span aria-hidden="true">→</span></Link>
      </section>

      <footer className="marketing-footer">
        <Link className="brand-mark footer-brand" href="/"><span className="brand-symbol" aria-hidden="true">j</span><span>Jharo</span></Link>
        <p>PDF library · Reader · Reading activity</p>
        <nav aria-label="Footer navigation"><Link href="/about">About</Link><Link href="/login">Log in</Link><Link href="/register">Sign up</Link></nav>
      </footer>
    </main>
  );
}
