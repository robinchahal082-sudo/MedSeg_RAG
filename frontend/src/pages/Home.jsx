import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  FileSearch,
  FileText,
  HeartHandshake,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  UserRound,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";
import "./Home.css";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const features = [
  {
    icon: FileText,
    title: "Smart medical document management",
    description:
      "Keep medical PDFs in one patient-owned workspace, with document type, upload time, and processing state easy to review.",
  },
  {
    icon: Layers3,
    title: "Structure-aware segmentation",
    description:
      "MedSeg-RAG is designed to organize medical content into meaningful sections instead of treating a report as undifferentiated text.",
  },
  {
    icon: BrainCircuit,
    title: "Retrieval-augmented generation",
    description:
      "A document-grounded assistant is part of the platform direction; RAG querying is not connected in the current application yet.",
  },
  {
    icon: FileSearch,
    title: "Context with source references",
    description:
      "The intended experience connects answers to the source document and page, making supporting context easier to trace.",
  },
  {
    icon: HeartHandshake,
    title: "Patient–doctor collaboration",
    description:
      "Separate patient and doctor workspaces support clear, patient-centered sharing and record review.",
  },
  {
    icon: ShieldCheck,
    title: "Consent-based document access",
    description:
      "Patients approve or revoke doctor access, and document routes check that access before returning records.",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload medical documents",
    description: "Add PDF records to your private patient workspace.",
  },
  {
    icon: Workflow,
    title: "Prepare and organize",
    description:
      "Documents are stored and tracked through their processing status.",
  },
  {
    icon: MessageSquareText,
    title: "Ask a question",
    description:
      "The document-grounded assistant is planned; question answering is not connected yet.",
  },
  {
    icon: FileSearch,
    title: "Review context and sources",
    description:
      "The intended retrieval experience returns relevant context with document references.",
  },
];

const coreTechnologies = [
  { name: "React", detail: "Web application" },
  { name: "FastAPI", detail: "Application API" },
  { name: "Python", detail: "Backend runtime" },
  { name: "PostgreSQL", detail: "Relational data" },
];

const retrievalDirection = [
  { name: "FAISS", detail: "Vector search integration" },
  { name: "Ollama", detail: "Model runtime integration" },
  { name: "NLP", detail: "Medical text processing" },
];

const faqs = [
  {
    question: "What is MedSeg-RAG?",
    answer:
      "MedSeg-RAG is a medical document management project with patient and doctor workspaces, document upload, and patient-controlled doctor access. Its document-grounded retrieval experience is a planned capability.",
  },
  {
    question: "Which documents can I upload?",
    answer:
      "The current upload flow accepts PDF files up to 10 MB per file. Other formats are not supported by the current upload endpoint.",
  },
  {
    question: "Can I ask questions about my documents today?",
    answer:
      "The AI assistant interface is present, but the RAG query service is not connected in the current application. It cannot answer questions yet.",
  },
  {
    question: "How does doctor access work?",
    answer:
      "A doctor can request access to a patient. The patient can approve, reject, or revoke access. Doctor document routes require a current approved access record.",
  },
  {
    question: "Does MedSeg-RAG diagnose medical conditions?",
    answer:
      "No. MedSeg-RAG is not a medical diagnosis system and does not replace professional medical advice. Do not use it to make healthcare decisions.",
  },
];

function Brand({ inverse = false }) {
  return (
    <Link
      className={`brand${inverse ? " brand--inverse" : ""}`}
      to="/"
      aria-label="MedSeg-RAG home"
    >
      <span className="brand__icon">
        <Activity size={20} strokeWidth={2.5} />
      </span>
      <span className="brand__name">
        MedSeg<span>-RAG</span>
      </span>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, highlight, description, align = "center" }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <span className="section-kicker">{eyebrow}</span>
      <h2>
        {title} {highlight && <span>{highlight}</span>}
      </h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function ProductPreview() {
  return (
    <div
      className="product-scene"
      role="img"
      aria-label="Illustrative MedSeg-RAG workspace preview with a document library, processing status, and a document-grounded answer concept"
    >
      <div className="scene-orbit scene-orbit--outer" />
      <div className="scene-orbit scene-orbit--inner" />
      <div className="scene-glow" />

      <div className="product-window">
        <div className="product-window__topbar">
          <div className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>Illustrative workspace preview</span>
          <span className="preview-lock">
            <LockKeyhole size={12} />
            Patient workspace
          </span>
        </div>

        <div className="product-window__body">
          <aside className="preview-sidebar" aria-hidden="true">
            <div className="preview-sidebar__brand">
              <span><Activity size={14} /></span>
              <i />
            </div>
            <span className="preview-sidebar__item preview-sidebar__item--active"><Layers3 size={15} /></span>
            <span className="preview-sidebar__item"><FileText size={15} /></span>
            <span className="preview-sidebar__item"><UsersRound size={15} /></span>
            <span className="preview-sidebar__item"><MessageSquareText size={15} /></span>
          </aside>

          <div className="preview-content">
            <div className="preview-heading">
              <div>
                <span className="preview-overline">YOUR DOCUMENT SPACE</span>
                <h2>Medical library</h2>
              </div>
              <span className="preview-avatar"><UserRound size={16} /></span>
            </div>

            <div className="preview-search">
              <Search size={14} />
              <span>Search your documents</span>
              <kbd>⌘ K</kbd>
            </div>

            <div className="preview-main-grid">
              <div className="preview-documents">
                <div className="preview-section-title">
                  <strong>Documents</strong>
                  <span>Illustrative</span>
                </div>
                <div className="preview-document preview-document--selected">
                  <span className="pdf-icon"><FileText size={16} /></span>
                  <span><b>Medical report</b><small>PDF document</small></span>
                  <Check size={14} />
                </div>
                <div className="preview-document">
                  <span className="pdf-icon pdf-icon--blue"><ClipboardList size={16} /></span>
                  <span><b>Clinical summary</b><small>PDF document</small></span>
                  <ArrowUpRight size={13} />
                </div>
                <div className="preview-processing">
                  <span className="processing-pulse"><Sparkles size={14} /></span>
                  <span><b>Document status</b><small>Processing state shown here</small></span>
                  <span className="processing-dots"><i /><i /><i /></span>
                </div>
              </div>

              <div className="preview-page">
                <div className="preview-page__toolbar">
                  <span><FileText size={13} /> PDF PREVIEW</span>
                  <span>Page —</span>
                </div>
                <div className="paper">
                  <div className="paper__heading">
                    <span />
                    <i />
                  </div>
                  <div className="paper__line paper__line--wide" />
                  <div className="paper__line" />
                  <div className="paper__block">
                    <span>DOCUMENT SECTION</span>
                    <div className="paper__line paper__line--wide" />
                    <div className="paper__line paper__line--short" />
                  </div>
                  <div className="paper__block paper__block--teal">
                    <span>STRUCTURED CONTENT</span>
                    <div className="paper__line paper__line--wide" />
                    <div className="paper__line" />
                    <div className="paper__line paper__line--short" />
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-answer">
              <div className="preview-answer__icon"><BrainCircuit size={15} /></div>
              <div className="preview-answer__body">
                <div className="preview-answer__top">
                  <strong>Contextual answer preview</strong>
                  <span>Concept</span>
                </div>
                <p>Relevant document context would appear here when retrieval is available.</p>
                <span className="preview-source"><FileCheck2 size={12} /> Source document · page reference</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scene-float scene-float--top">
        <span className="scene-float__icon"><Layers3 size={16} /></span>
        <span><b>Structure-aware</b><small>Document sections</small></span>
      </div>
      <div className="scene-float scene-float--bottom">
        <span className="scene-float__icon scene-float__icon--mint"><ShieldCheck size={16} /></span>
        <span><b>Patient controlled</b><small>Access by consent</small></span>
      </div>
      <span className="scene-spark scene-spark--one" aria-hidden="true"><Sparkles size={19} /></span>
      <span className="scene-spark scene-spark--two" aria-hidden="true"><Sparkles size={13} /></span>
    </div>
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
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav
            id="primary-navigation"
            aria-label="Main navigation"
            className={`site-nav${menuOpen ? " site-nav--open" : ""}`}
          >
            {navigation.map((item) => (
              <a href={item.href} key={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <div className="site-nav__mobile-actions">
              <Link className="button button--quiet" onClick={closeMenu} to="/login">
                Login
              </Link>
              <Link className="button button--primary" onClick={closeMenu} to="/register">
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          </nav>

          <div className="site-header__actions">
            <Link className="header-login" to="/login">Login</Link>
            <Link className="button button--primary button--small" to="/register">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-backdrop" aria-hidden="true" />
          <div className="page-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow__dot" />
                Intelligent medical document platform
              </div>
              <h1>
                Your Medical Documents.
                <span> Organized. Connected. Intelligent.</span>
              </h1>
              <p className="hero-copy__description">
                MedSeg-RAG transforms medical documents into structured,
                searchable information, helping patients and doctors access
                relevant medical records with intelligent, document-grounded retrieval.
              </p>
              <div className="hero-actions">
                <Link className="button button--primary button--large" to="/register">
                  Get Started <ArrowRight size={17} />
                </Link>
                <a className="button button--outline button--large" href="#features">
                  Explore features <ArrowDown size={16} />
                </a>
              </div>
              <p className="hero-trust">
                <ShieldCheck size={16} />
                Designed for secure, patient-controlled medical information access.
              </p>
            </div>

            <ProductPreview />
          </div>
          <div className="hero-bottom">
            <div className="page-container hero-bottom__inner">
              <span>ORGANIZED RECORDS</span>
              <span className="hero-bottom__line" />
              <span>PATIENT-CONTROLLED ACCESS</span>
              <span className="hero-bottom__line" />
              <span>CONTEXT BY DESIGN</span>
            </div>
          </div>
        </section>

        <section className="intro-section section-pad" id="about">
          <div className="page-container intro-grid">
            <div className="intro-mark">
              <span className="intro-mark__icon"><Network size={25} /></span>
              <span>MEDICAL INFORMATION<br />SHOULD CONNECT</span>
              <div className="intro-mark__lines"><i /><i /><i /><i /></div>
            </div>
            <div className="intro-copy">
              <span className="section-kicker">A clearer way to work with records</span>
              <h2>Less time piecing files together. <span>More context in one place.</span></h2>
              <p>
                Medical information often lives across separate reports and
                documents. MedSeg-RAG brings patient-owned PDFs into an
                organized workspace and gives patients a clear way to manage
                when a doctor can access them.
              </p>
              <a className="text-link" href="#how-it-works">
                See how it works <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="features-section section-pad" id="features">
          <div className="page-container">
            <SectionHeading
              eyebrow="Built around medical documents"
              title="One workspace for"
              highlight="the details that matter."
              description="Practical tools for organizing records today, with transparent direction for document-grounded retrieval."
            />
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, description }, index) => (
                <article className="feature-card" key={title}>
                  <div className="feature-card__top">
                    <span className="feature-card__icon"><Icon size={21} strokeWidth={1.8} /></span>
                    <span className="feature-card__number">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="feature-card__arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="workflow-section section-pad" id="how-it-works">
          <div className="page-container workflow-layout">
            <SectionHeading
              align="left"
              eyebrow="A thoughtful workflow"
              title="From document upload"
              highlight="to useful context."
              description="A simple path through the platform—from keeping records organized to the planned source-grounded retrieval experience."
            />
            <div className="workflow-steps">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <article className="workflow-step" key={title}>
                  <div className="workflow-step__marker">
                    <span className="workflow-step__icon"><Icon size={19} /></span>
                    {index < steps.length - 1 && <span className="workflow-step__connector" />}
                  </div>
                  <div className="workflow-step__content">
                    <span>STEP {String(index + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  {index === 2 && <span className="workflow-step__status">Planned</span>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portals-section section-pad">
          <div className="page-container">
            <SectionHeading
              eyebrow="A workspace for each role"
              title="Patients and doctors,"
              highlight="connected with clarity."
              description="Dedicated portals support patient record management and doctor review of records shared with them."
            />
            <div className="portal-grid">
              <article className="portal-card portal-card--patient">
                <div className="portal-card__top">
                  <span className="portal-card__icon"><UserRound size={22} /></span>
                  <span className="portal-card__label">PATIENT PORTAL</span>
                </div>
                <h3>Your records, on your terms.</h3>
                <p>Keep documents organized and choose which doctors can access them.</p>
                <ul>
                  <li><Check size={15} /> Upload and manage PDF documents</li>
                  <li><Check size={15} /> Review your medical records</li>
                  <li><Check size={15} /> Approve or revoke doctor access</li>
                  <li><Check size={15} /> Document-grounded assistance when available</li>
                </ul>
                <Link className="text-link" to="/register">
                  Create a patient account <ArrowRight size={16} />
                </Link>
                <div className="portal-card__decoration" aria-hidden="true"><HeartHandshake size={100} /></div>
              </article>

              <article className="portal-card portal-card--doctor">
                <div className="portal-card__top">
                  <span className="portal-card__icon"><Stethoscope size={22} /></span>
                  <span className="portal-card__label">DOCTOR PORTAL</span>
                </div>
                <h3>Shared records, with permission.</h3>
                <p>Request patient access and review documents only after authorization.</p>
                <ul>
                  <li><Check size={15} /> Request access to a patient</li>
                  <li><Check size={15} /> Manage patient connections</li>
                  <li><Check size={15} /> Access documents shared with you</li>
                  <li><Check size={15} /> Retrieval tools when available</li>
                </ul>
                <Link className="text-link" to="/register">
                  Create a doctor account <ArrowRight size={16} />
                </Link>
                <div className="portal-card__decoration" aria-hidden="true"><Stethoscope size={100} /></div>
              </article>
            </div>
          </div>
        </section>

        <section className="why-section section-pad">
          <div className="page-container why-layout">
            <div className="why-copy">
              <span className="section-kicker">Why MedSeg-RAG</span>
              <h2>Useful information should be <span>organized and traceable.</span></h2>
              <p>
                A document workspace is more helpful when its structure,
                sharing rules, and sources are clear. MedSeg-RAG is designed
                around those foundations.
              </p>
            </div>
            <div className="why-list">
              <WhyItem icon={Layers3} title="Structure-aware by design" text="Organize medical content around document sections and context." />
              <WhyItem icon={FileCheck2} title="Source transparency" text="The retrieval experience is intended to show which document supports a result." />
              <WhyItem icon={FileText} title="Records in one workspace" text="Review uploaded PDFs and their processing state from a central library." />
              <WhyItem icon={ShieldCheck} title="Patient-controlled sharing" text="Patient approval controls doctor access to their documents." />
            </div>
          </div>
        </section>

        <section className="technology-section section-pad">
          <div className="page-container">
            <SectionHeading
              eyebrow="Built with a modern web stack"
              title="The technology"
              highlight="behind the workspace."
              description="Core application technologies and the retrieval components planned for the document-grounded experience."
            />
            <div className="technology-grid">
              {coreTechnologies.map(({ name, detail }) => (
                <div className="technology-card" key={name}>
                  <span className="technology-card__check"><Check size={14} /></span>
                  <strong>{name}</strong>
                  <small>{detail}</small>
                  <span className="technology-card__state">Core application</span>
                </div>
              ))}
            </div>
            <div className="technology-direction">
              <div className="technology-direction__heading">
                <span><Sparkles size={16} /></span>
                <div>
                  <h3>Retrieval stack direction</h3>
                  <p>Not connected to the current RAG query flow yet.</p>
                </div>
              </div>
              <div className="technology-direction__items">
                {retrievalDirection.map(({ name, detail }) => (
                  <div className="technology-direction__item" key={name}>
                    <strong>{name}</strong>
                    <span>{detail}</span>
                    <small>Planned</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-section section-pad" id="privacy">
          <div className="page-container privacy-panel">
            <div className="privacy-panel__icon"><ShieldCheck size={25} /></div>
            <div className="privacy-panel__copy">
              <span className="section-kicker">Privacy by workflow</span>
              <h2>Sharing starts with the patient.</h2>
              <p>
                MedSeg-RAG uses authenticated workspaces and patient approval
                to control doctor access. Access can be revoked, and document
                routes check current authorization. No certification or
                compliance claim is implied.
              </p>
            </div>
            <div className="privacy-panel__points">
              <span><LockKeyhole size={15} /> Authenticated access</span>
              <span><BadgeCheck size={15} /> Patient approval</span>
              <span><ShieldCheck size={15} /> Revocable sharing</span>
            </div>
          </div>
        </section>

        <section className="faq-section section-pad">
          <div className="page-container faq-layout">
            <div className="faq-intro">
              <span className="section-kicker">Good to know</span>
              <h2>Questions, <span>answered clearly.</span></h2>
              <p>What MedSeg-RAG can do today—and what is still being built.</p>
              <span className="faq-note"><CircleHelp size={16} /> This platform does not provide medical diagnosis.</span>
            </div>
            <div className="faq-list">
              {faqs.map(({ question, answer }) => (
                <details className="faq-item" key={question}>
                  <summary>
                    <span>{question}</span>
                    <ChevronDown size={18} />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta-section section-pad" id="contact">
          <div className="page-container final-cta">
            <div className="final-cta__orb final-cta__orb--one" aria-hidden="true" />
            <div className="final-cta__orb final-cta__orb--two" aria-hidden="true" />
            <div className="final-cta__content">
              <span className="final-cta__eyebrow"><Activity size={14} /> MEDSEG-RAG</span>
              <h2>Make Medical Information <span>Easier to Access.</span></h2>
              <p>Start organizing records in a patient-centered workspace.</p>
              <div className="final-cta__actions">
                <Link className="button button--light button--large" to="/register">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link className="button button--dark-outline button--large" to="/login">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container site-footer__main">
          <div className="site-footer__brand">
            <Brand inverse />
            <p>
              An organized workspace for medical documents and
              patient-controlled sharing.
            </p>
          </div>
          <div className="site-footer__group">
            <strong>Explore</strong>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#about">About</a>
          </div>
          <div className="site-footer__group">
            <strong>Workspaces</strong>
            <Link to="/register">Patient portal</Link>
            <Link to="/register">Doctor portal</Link>
            <Link to="/login">Login</Link>
          </div>
          <Link className="footer-cta" to="/register">
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
        <div className="page-container site-footer__bottom">
          <span>© 2026 MedSeg-RAG · Academic project</span>
          <span>Not a medical diagnosis system. Always consult a qualified healthcare professional.</span>
        </div>
      </footer>
    </div>
  );
}

function WhyItem({ icon: Icon, title, text }) {
  return (
    <article className="why-item">
      <span className="why-item__icon"><Icon size={19} /></span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <Check className="why-item__check" size={16} />
    </article>
  );
}
