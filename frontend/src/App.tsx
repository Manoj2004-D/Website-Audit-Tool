import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { generatePDFReport } from "./utils/generateReport";
import PerformanceCard from "./components/PerformanceCard";
import SecurityCard from "./components/SecurityCard";
import SEOCard from "./components/SEOCard";
import AccessibilityCard from "./components/AccessibilityCard";
import ScoreBadge from "./components/ScoreBadge";
import LoaderCard from "./components/LoaderCard"; // ✅ import loader

function App() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<any>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  // progress animation
  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 95) return p;
          return p + Math.floor(Math.random() * 10) + 2;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [loading]);

  const handleAudit = async () => {
    setReport(null);
    setError(null);

    if (!url) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

    try {
      const res = await axios.post("http://localhost:5000/api/audit", { url });
      const { scanId, initial } = res.data;

      setScanId(scanId);
      setReport(initial);

      const interval = setInterval(async () => {
        try {
          const result = await axios.get(
            `http://localhost:5000/api/results/${scanId}`
          );
          setReport(result.data);
          if (
            result.data.status === "completed" ||
            result.data.status === "error"
          ) {
            clearInterval(interval);
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
          clearInterval(interval);
          setLoading(false);
        }
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || "Request failed");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white font-['Inter'] relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* 🌌 Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black to-cyan-900 opacity-40"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* 🔮 Left Glowing Blob with rotation */}
      <motion.div
        className="absolute left-[-100px] top-1/4 w-72 h-72 rounded-full bg-purple-500/30 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 20, -20, 0],
          opacity: [0.3, 0.7, 0.3],
          y: [0, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🔮 Right Glowing Blob with pulse */}
      <motion.div
        className="absolute right-[-120px] top-1/3 w-96 h-96 rounded-full bg-cyan-500/25 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.6, 0.2],
          y: [0, -40, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ✨ Floating Particles with drift */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [-50, window.innerHeight + 50],
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth + (i % 2 === 0 ? 50 : -50),
            ],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 12 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 6,
          }}
        />
      ))}

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-16 px-5">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="px-3 py-2 text-sm font-semibold rounded-full 
                     bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20 
                     border border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.8)] 
                     text-purple-300 tracking-wide uppercase hover:scale-105 
                     transition-transform duration-300 cursor-default mb-4 relative z-10"
        >
          ⭐ Next-Gen Website Auditing Platform
        </motion.span>

        {/* Animated Headings */}
        <div
          className="flex flex-col items-center space-y-7 
                     text-6xl md:text-8xl font-extrabold leading-tight relative z-10"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: [0, 1, 0.95, 1], y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-white"
          >
            SECURE
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: [0, 1, 0.95, 1], y: 0 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="text-purple-400"
          >
            OPTIMIZE
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: [0, 1, 0.95, 1], y: 0 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="text-cyan-400"
          >
            DOMINATE
          </motion.h1>
        </div>

        <p className="text-gray-400 text-lg max-w-3xl mt-5 relative z-10">
          Unleash the power of AI-driven website analysis. Detect vulnerabilities,
          boost performance, and crush the competition with our
          cybersecurity-grade audit platform.
        </p>

        {/* Input */}
{/* Input */}
<form
  onSubmit={(e) => {
    e.preventDefault(); // ✅ prevent page reload
    handleAudit();      // ✅ call the same function
  }}
  className="bg-gray-900/80 border border-purple-500/40 rounded-2xl p-6 shadow-2xl w-full max-w-2xl flex flex-col md:flex-row gap-3 mt-8 relative z-10"
>
  <input
    type="text"
    placeholder="Enter target URL (e.g., example.com)"
    value={url}
    onChange={(e) => setUrl(e.target.value)}
    className="flex-1 p-3 rounded-lg text-black focus:ring-2 focus:ring-purple-500"
  />
  <button
    type="submit"  // ✅ submit type so Enter triggers
    disabled={loading}
    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-bold hover:scale-105 transition disabled:opacity-50"
  >
    {loading ? "Scanning..." : "Launch Audit"}
  </button>
</form>

        {error && <p className="mt-3 text-red-400">{error}</p>}
      </section>

      {/* Report Section */}
      <section ref={resultsRef} className="py-20 px-6 bg-black text-center relative z-10">
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <LoaderCard />

              {/* ✅ Neon Progress Bar */}
              <div className="w-full max-w-lg h-4 bg-gray-800 rounded-full overflow-hidden border border-purple-500/50 relative">
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)]"
                  style={{ backgroundSize: "40px 40px" }}
                  animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="h-full relative z-10 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 
                             shadow-[0_0_15px_#a855f7,0_0_30px_#06b6d4,0_0_45px_#a855f7]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <motion.p
                className="text-purple-300 text-sm font-semibold tracking-wide"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Scanning... {progress}%
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && report && (
          <>
            <h2 className="text-4xl font-bold text-purple-400 mb-10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Audit Results
            </h2>

            {report.performance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <ScoreBadge label="Performance" score={report.performance.performanceScore} />
                <ScoreBadge label="SEO" score={report.seo?.seoScore} />
                <ScoreBadge
                  label="Accessibility"
                  score={
                    report.accessibility && Array.isArray(report.accessibility)
                      ? Math.max(
                          0,
                          100 -
                            report.accessibility.filter(
                              (i: any) => i.impact === "critical" || i.impact === "serious"
                            ).length * 10
                        )
                      : null
                  }
                />
              </div>
            )}

            {/* ✅ Staggered cards */}
            <div className="flex flex-col gap-8 max-w-5xl mx-auto text-left">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="p-6 rounded-xl bg-gray-900/70 border border-purple-500/40 shadow-lg">
                <SecurityCard security={report.security} />
              </motion.div>
              {report.performance && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="p-6 rounded-xl bg-gray-900/70 border border-blue-500/40 shadow-lg">
                  <PerformanceCard performance={report.performance} />
                </motion.div>
              )}
              {report.seo && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="p-6 rounded-xl bg-gray-900/70 border border-green-500/40 shadow-lg">
                  <SEOCard seo={report.seo} />
                </motion.div>
              )}
              {report.accessibility && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="p-6 rounded-xl bg-gray-900/70 border border-yellow-500/40 shadow-lg">
                  <AccessibilityCard accessibility={report.accessibility} />
                </motion.div>
              )}
            </div>

            {/* After <h2>Audit Results</h2> */}
<div className="mb-6 mt-10 flex justify-center">
  <button
    onClick={() => generatePDFReport(report)}
    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg font-bold hover:scale-105 transition"
  >
    📄 Download Full Report
  </button>
</div>



          </>
        )}
      </section>

      <footer className="text-gray-500 text-sm text-center py-6 relative z-10 font-['Inter']">
        © {new Date().getFullYear()} WebAudit Pro · Engineered for digital dominance
      </footer>
    </div>
  );
}

export default App;
