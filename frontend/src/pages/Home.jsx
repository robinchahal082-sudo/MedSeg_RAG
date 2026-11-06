
import { ShieldCheck, FileText, BrainCircuit, Stethoscope,
  ArrowRight, LockKeyhole, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-teal-700 p-2 rounded-xl text-white">
              <Activity size={23} />
            </div>
            <span className="text-xl font-bold text-[#142B45]">
              MedSeg<span className="text-teal-700">-RAG</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#home" className="hover:text-teal-700">Home</a>
            <a href="#features" className="hover:text-teal-700">Features</a>
            <a href="#about" className="hover:text-teal-700">About</a>
            <a href="#security" className="hover:text-teal-700">Security</a>
          </div>

          <div className="flex gap-3">
            <a href="/login"
              className="px-4 py-2 text-teal-700 font-semibold">
              Login
            </a>
            <a href="/register"
              className="bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-800">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block bg-teal-50 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Intelligent Healthcare Document Platform
            </span>

            <h1 className="text-5xl md:text-6xl font-bold text-[#142B45] leading-tight">
              Your Medical Records,
              <span className="text-teal-700"> Smarter.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-8">
              Organize medical documents, extract meaningful information
              and discover answers through intelligent AI-powered
              document retrieval.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <a href="/register"
                className="bg-teal-700 text-white px-7 py-4 rounded-xl font-semibold flex items-center gap-2 hover:bg-teal-800">
                Get Started <ArrowRight size={19}/>
              </a>
              <a href="#features"
                className="border border-slate-300 px-7 py-4 rounded-xl font-semibold text-[#142B45] hover:bg-white">
                Explore Features
              </a>
            </div>

            <div className="flex gap-6 mt-10 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="text-teal-700" size={18}/>
                Privacy focused
              </span>
              <span className="flex items-center gap-2">
                <LockKeyhole className="text-teal-700" size={18}/>
                Controlled access
              </span>
            </div>
          </div>

          {/* Feature preview */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-sm text-slate-500">Platform Preview</p>
                <h2 className="text-2xl font-bold text-[#142B45]">
                  Medical Intelligence
                </h2>
              </div>
              <div className="bg-teal-50 p-3 rounded-xl">
                <BrainCircuit className="text-teal-700" size={30}/>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ["Document Management", "Organize medical PDFs", FileText],
                ["AI Document Assistant", "Ask questions about reports", BrainCircuit],
                ["Doctor Connectivity", "Manage authorized sharing", Stethoscope],
              ].map(([title, desc, Icon]) => (
                <div key={title}
                  className="flex items-center gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="bg-teal-100 p-3 rounded-xl">
                    <Icon className="text-teal-800" size={24}/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#142B45]">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-teal-50 rounded-xl text-sm text-teal-900">
              Intelligent document retrieval with source references.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-teal-700 font-semibold">OUR CAPABILITIES</p>
          <h2 className="text-3xl font-bold text-[#142B45] mt-3">
            Everything in One Connected Platform
          </h2>
          <p className="text-slate-500 mt-4">
            Simplifying medical document management and information retrieval.
          </p>
        </div>
      </section>

      <footer id="about" className="bg-[#142B45] text-white py-8 text-center">
        <h3 className="font-bold text-xl">MedSeg-RAG</h3>
        <p className="text-slate-300 text-sm mt-2">
          Intelligent Medical Document Segmentation & Retrieval
        </p>
        <p className="text-slate-400 text-xs mt-5">
          © 2026 MedSeg-RAG. Academic Project.
        </p>
      </footer>
    </div>
  );
}
