import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Jharo’s PDF reading tools",
  description:
    "Jharo offers a personal PDF book library, an in-browser reader with word lookups, and reading activity for pages read and words learned.",
  openGraph: {
    title: "About Jharo",
    description:
      "Upload PDF books, read them in Jharo, look up words from the text, and view your reading activity.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="marketing-page about-page">
      <header className="marketing-header">
        <Link className="brand-mark" href="/" aria-label="Jharo home"><span className="brand-symbol" aria-hidden="true">j</span><span>Jharo</span></Link>
        <nav className="marketing-nav" aria-label="Main navigation">
          <Link href="/" className="marketing-nav-link">Home</Link>
          <Link href="/login" className="marketing-nav-link">Log in</Link>
          <Link href="/register" className="marketing-button marketing-button-small">Create your library <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
      <article className="about-content">
        <p className="marketing-kicker"><span /> About Jharo</p>
        <h1>PDF books and<br /><em>reading tools.</em></h1>
        <p className="about-lede">Jharo is a web app for uploading PDF books, reading them in a browser, looking up words, and viewing reading activity.</p>

        <div className="about-rule"><span>01</span><i /></div>
        <section className="about-section">
          <div><p className="marketing-kicker">01 / YOUR LIBRARY</p><h2>Keep PDF books<br />in one library.</h2></div>
          <div className="about-prose">
            <p>Upload PDF files to your personal library and open them in Jharo’s reader. Your library keeps your uploaded books together so you can return to them from the app.</p>
          </div>
        </section>

        <div className="about-rule"><span>02</span><i /></div>
        <section className="about-section about-values">
          <div><p className="marketing-kicker">02 / READING FEATURES</p><h2>Tools available<br />while you read.</h2></div>
          <ul className="values-list">
            <li><span>01</span><div><h3>Word lookups</h3><p>Select a word from the text to see its meaning in the reader.</p></div></li>
            <li><span>02</span><div><h3>Reading activity</h3><p>See pages read and words learned, organized by day.</p></div></li>
            <li><span>03</span><div><h3>PDF upload</h3><p>Add PDF books to your library from the app.</p></div></li>
          </ul>
        </section>

        <section className="about-cta">
          <div><p className="marketing-kicker">GET STARTED</p><h2>Upload a PDF<br /><em>to your library.</em></h2></div>
          <Link href="/register" className="marketing-button">Create an account <span aria-hidden="true">→</span></Link>
        </section>
      </article>
      <footer className="marketing-footer">
        <Link className="brand-mark footer-brand" href="/"><span className="brand-symbol" aria-hidden="true">j</span><span>Jharo</span></Link>
        <p>PDF library · Reader · Reading activity</p>
        <nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/login">Log in</Link><Link href="/register">Sign up</Link></nav>
      </footer>
    </main>
  );
}
