import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronRight,
  FileSearch,
  FileText,
  LockKeyhole,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  X,
} from "lucide-react";
import "./Home.css";

const features = [
  {
    icon: FileText,
    number: "01",
    title: "Keep records together",
    description:
      "Bring reports, prescriptions, and other medical PDFs into one organized workspace.",
  },
  {
    icon: BrainCircuit,
    number: "02",
    title: "Find the details that matter",
    description:
      "Explore document information with retrieval designed to keep answers connected to their sources.",
  },
  {
    icon: Stethoscope,
    number: "03",
    title: "Share with intention",
    description:
      "A patient-first workspace built around clear, authorized access to medical information.",
  },
];

const steps = [
  { icon: Upload, label: "Add your records", number: "01" },
  { icon: FileSearch, label: "Organize and explore", number: "02" },
  { icon: MessageSquareText, label: "Find answers with context", number: "03" },
];

function Brand({ inverse = false }) {
  return (
    <Link
      className={`brand${inverse ? " brand--inverse" : ""}`}
      to="/"
      aria-label="MedSeg-RAG home"
    >
      <span className="brand__icon">
        <Activity size={21} strokeWidth={2.5} />
      </span>
      <span className="brand__name">
        MedSeg<span>-RAG</span>
      </span>
    </Link>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="home-page">
      <header className="site-header">
        <div className="site-header__inner">
          <Brand />

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="menu-toggle"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav
            aria-label="Main navigation"
            className={`site-nav${menuOpen ? " site-nav--open" : ""}`}
          >
            <a href="#features" onClick={closeMenu}>Platform</a>
            <a href="#workflow" onClick={closeMenu}>How it works</a>
            <a href="#privacy" onClick={closeMenu}>Privacy</a>
            <div className="site-nav__mobile-actions">
              <Link className="button button--quiet" onClick={closeMenu} to="/login">
                Sign in
              </Link>
              <Link className="button button--primary" onClick={closeMenu} to="/register">
                Create account <ArrowRight size={16} />
              </Link>
            </div>
          </nav>

          <div className="site-header__actions">
            <Link className="header-login" to="/login">Sign in</Link>
            <Link className="button button--primary button--small" to="/register">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-section__glow" aria-hidden="true" />
          <div className="page-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow__dot" />
                A clearer view of your health records
              </div>
              <h1>
                Medical records,
                <br />
                <span>made more meaningful.</span>
              </h1>
              <p className="hero-copy__description">
                One thoughtful place to organize your documents, explore what
                they contain, and stay connected to the information that matters.
              </p>
              <div className="hero-actions">
                <Link className="button button--primary button--large" to="/register">
                  Get started <ArrowRight size={18} />
                </Link>
                <a className="button button--outline button--large" href="#features">
                  Explore the platform <ArrowDown size={16} />
                </a>
              </div>
              <div className="hero-assurances">
                <span><ShieldCheck size={17} /> Patient-first access</span>
                <span><LockKeyhole size={16} /> Built for sensitive records</span>
              </div>
            </div>

            <div className="preview-wrap" aria-label="Illustration of the medical document workspace">
              <div className="preview-orbit preview-orbit--one" aria-hidden="true" />
              <div className="preview-orbit preview-orbit--two" aria-hidden="true" />
              <div className="preview-card">
                <div className="preview-card__top">
                  <div>
                    <span className="preview-overline">YOUR WORKSPACE</span>
                    <h2>Health library</h2>
                  </div>
                  <span className="preview-avatar"><Activity size={18} /></span>
                </div>
                <div className="preview-summary">
                  <div className="preview-summary__icon"><FileText size={20} /></div>
                  <div>
                    <strong>Your records, in one place</strong>
                    <span>Stay organized at your own pace</span>
                  </div>
                  <ChevronRight className="preview-summary__arrow" size={18} />
                </div>
                <div className="preview-label">
                  <span>RECENT DOCUMENTS</span>
                  <span className="preview-label__count">Your library</span>
                </div>
                <div className="document-row">
                  <span className="document-row__icon document-row__icon--mint"><FileText size={18} /></span>
                  <span className="document-row__details">
                    <strong>Lab results</strong><small>PDF document</small>
                  </span>
                  <span className="document-row__tag">Ready</span>
                </div>
                <div className="document-row">
                  <span className="document-row__icon document-row__icon--blue"><FileText size={18} /></span>
                  <span className="document-row__details">
                    <strong>Visit summary</strong><small>PDF document</small>
                  </span>
                  <span className="document-row__tag">Ready</span>
                </div>
                <div className="preview-assistant">
                  <span className="preview-assistant__icon"><BrainCircuit size={18} /></span>
                  <span><strong>Document assistant</strong><small>Explore your records with context</small></span>
                  <ArrowUpRight size={17} />
                </div>
              </div>
              <div className="floating-note">
                <span className="floating-note__check"><Check size={15} /></span>
                <span><strong>More clarity</strong><small>Less searching</small></span>
              </div>
              <span className="preview-spark preview-spark--one" aria-hidden="true"><Sparkles size={18} /></span>
              <span className="preview-spark preview-spark--two" aria-hidden="true"><Sparkles size={14} /></span>
            </div>
          </div>
          <div className="hero-bottom">
            <div className="page-container hero-bottom__inner">
              <span>LESS TIME SEARCHING</span>
              <span className="hero-bottom__line" />
              <span>MORE ROOM TO FOCUS ON YOU</span>
            </div>
          </div>
        </section>

        <section className="features-section section-pad" id="features">
          <div className="page-container">
            <div className="section-heading">
              <span className="section-kicker">A more connected experience</span>
              <h2>Your health information,<br /><span>with a little more clarity.</span></h2>
              <p>Simple tools to help make medical documents easier to manage and understand.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, number, title, description }) => (
                <article className="feature-card" key={number}>
                  <div className="feature-card__top">
                    <span className="feature-card__icon"><Icon size={22} /></span>
                    <span className="feature-card__number">{number}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="feature-card__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="workflow-section section-pad" id="workflow">
          <div className="page-container workflow-grid">
            <div className="workflow-copy">
              <span className="section-kicker">Designed around your day</span>
              <h2>From scattered files to a <span>clearer picture.</span></h2>
              <p>
                Keep your records close, make them easier to find, and bring
                useful context into your next conversation with a care provider.
              </p>
              <Link className="text-link" to="/register">
                Start your workspace <ArrowRight size={17} />
              </Link>
            </div>
            <div className="workflow-steps">
              {steps.map(({ icon: Icon, label, number }, index) => (
                <div className="workflow-step" key={number}>
                  <span className="workflow-step__icon"><Icon size={20} /></span>
                  <span className="workflow-step__text">
                    <small>STEP {number}</small>
                    <strong>{label}</strong>
                  </span>
                  {index < steps.length - 1 && <span className="workflow-step__connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="privacy-section section-pad" id="privacy">
          <div className="page-container privacy-panel">
            <div className="privacy-panel__icon"><ShieldCheck size={27} /></div>
            <div className="privacy-panel__copy">
              <span className="section-kicker">Trust starts with thoughtful design</span>
              <h2>Your health information deserves care.</h2>
              <p>
                MedSeg-RAG is designed for sensitive medical documents, with
                patient-focused workflows and access intended for authorized users.
              </p>
            </div>
            <Link className="button button--light" to="/register">
              Learn more <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container site-footer__main">
          <div className="site-footer__brand">
            <Brand inverse />
            <p>A more considered way to organize medical documents.</p>
          </div>
          <div className="site-footer__links">
            <a href="#features">Platform</a>
            <a href="#workflow">How it works</a>
            <a href="#privacy">Privacy</a>
            <Link to="/login">Sign in</Link>
          </div>
          <Link className="footer-cta" to="/register">
            Create an account <ArrowRight size={16} />
          </Link>
        </div>
        <div className="page-container site-footer__bottom">
          <span>© 2026 MedSeg-RAG. Academic project.</span>
          <span>Intelligent medical document segmentation &amp; retrieval</span>
        </div>
      </footer>
    </div>
  );
}
