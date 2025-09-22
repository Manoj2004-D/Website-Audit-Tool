// backend/app.mjs
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { URL } from "url";
import fs from "fs";
import { fileURLToPath } from "url";
import axe from "axe-core";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";   // ✅ Gemini SDK

dotenv.config();
puppeteer.use(StealthPlugin());

const resultsStore = new Map(); // scanId → result

// ===================
// Gemini client
// ===================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAISuggestions(section, issues) {
  try {
    const prompt = `
    You are a senior web auditor.
    Section: ${section}
    Issues detected: ${JSON.stringify(issues)}

    Please give 2-3 clear, actionable, developer-friendly suggestions to fix these issues.
    Keep the language concise and practical.
    Do not use Markdown formatting like **bold**, just plain text.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-1.5-pro"
    const response = await model.generateContent([prompt]);

    // Extract text safely
    let text = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion available.";

    // Remove Markdown bold (**...**) if still present
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");

    return text.trim();
  } catch (err) {
    console.error("Gemini suggestion error:", err);
    return "AI suggestion could not be generated.";
  }
}


// ===================
// Load axe-core
// ===================
const axePath = fileURLToPath(await import.meta.resolve("axe-core/axe.min.js"));
const axeSource = fs.readFileSync(axePath, "utf8");

// ===================
// Dictionaries
// ===================
const headerExplanations = {
  "strict-transport-security": "Forces browsers to use HTTPS only, protecting users from insecure connections.",
  "x-frame-options": "Prevents your site from being embedded in other sites, stopping clickjacking attacks.",
  "x-content-type-options": "Prevents browsers from misinterpreting files, reducing certain attacks.",
  "content-security-policy": "Controls what content is allowed (scripts, images, etc.) to block XSS attacks.",
  "referrer-policy": "Controls what information is sent when users click external links (privacy protection).",
  "permissions-policy": "Restricts access to features like camera, microphone, or location for better security.",
};

const perfExplanations = {
  "first-contentful-paint": "How fast the first text or image appears on screen. Aim under 2 seconds.",
  "speed-index": "Measures how quickly the visible parts of the page are displayed. Lower is better.",
  "interactive": "When the page is fully usable. Should be under 5 seconds.",
  "total-blocking-time": "Time the browser was blocked by scripts. Lower means smoother experience.",
  "largest-contentful-paint": "Time taken for the biggest image or text to appear. Aim under 2.5 seconds.",
  "cumulative-layout-shift": "Measures how much the layout shifts unexpectedly. Keep it below 0.1.",
};

// ===================
// Helpers
// ===================
async function runLighthouseAudit(targetUrl, browser) {
  const wsEndpoint = browser.wsEndpoint();
  const port = new URL(wsEndpoint).port;

  const options = {
    port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "seo"],
  };

  const result = await lighthouse(targetUrl, options);
  const lhr = result.lhr;

  const pick = (key) =>
    lhr.audits && lhr.audits[key]
      ? lhr.audits[key].displayValue || lhr.audits[key].score
      : null;

  return {
    performanceScore: Math.round(lhr.categories.performance.score * 100),
    seoScore: Math.round(lhr.categories.seo.score * 100),
    audits: {
      firstContentfulPaint: {
        value: pick("first-contentful-paint"),
        explanation: perfExplanations["first-contentful-paint"],
      },
      speedIndex: {
        value: pick("speed-index"),
        explanation: perfExplanations["speed-index"],
      },
      interactive: {
        value: pick("interactive"),
        explanation: perfExplanations["interactive"],
      },
      totalBlockingTime: {
        value: pick("total-blocking-time"),
        explanation: perfExplanations["total-blocking-time"],
      },
      largestContentfulPaint: {
        value: pick("largest-contentful-paint"),
        explanation: perfExplanations["largest-contentful-paint"],
      },
      cumulativeLayoutShift: {
        value: pick("cumulative-layout-shift"),
        explanation: perfExplanations["cumulative-layout-shift"],
      },
    },
  };
}

async function runAccessibilityAudit(targetUrl, browser) {
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: "networkidle2" });
  await page.evaluate(axeSource);

  const results = await page.evaluate(async () => {
    return await axe.run();
  });

  await page.close();

  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    friendlyNote: `This affects accessibility: ${v.description}. ${v.help}`,
  }));
}

// ===================
// Routes
// ===================
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/api/audit", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  let target = url.trim();
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;

  const scanId = uuidv4();

  // --- Security checks (fast) ---
  let securityReport = {};
  try {
    const isHttps = /^https:\/\//i.test(target);
    let headers = {};
    try {
      const response = await axios.get(target, { timeout: 7000 });
      headers = response.headers || {};
    } catch {}

    const requiredHeaders = Object.keys(headerExplanations);
    const detected = Object.keys(headers).map((h) => h.toLowerCase());
    const missingHeaders = requiredHeaders.filter((h) => !detected.includes(h));

    let mixedContent = false;
    if (isHttps) {
      try {
        const pageResp = await axios.get(target, { timeout: 7000 });
        const body = pageResp.data || "";
        if (
          typeof body === "string" &&
          (/src=["']http:\/\//i.test(body) || /href=["']http:\/\//i.test(body))
        ) {
          mixedContent = true;
        }
      } catch {}
    }

    securityReport = {
      url: target,
      https: isHttps,
      missingHeaders,
      missingHeadersExplanation: Object.fromEntries(
        missingHeaders.map((h) => [h, headerExplanations[h] || ""])
      ),
      detectedHeaders: detected,
      reachable: Object.keys(headers).length > 0,
    };
  } catch (err) {
    securityReport = { error: "Security check failed", details: err.message };
  }

  // Save initial results
  resultsStore.set(scanId, {
    status: "running",
    url: target,
    security: securityReport,
    performance: null,
    seo: null,
    accessibility: null,
  });

  // Kick off background job
  runFullAudit(scanId, target).catch((err) => {
    resultsStore.set(scanId, { status: "error", error: err.message });
  });

  res.json({ scanId, initial: resultsStore.get(scanId) });
});

app.get("/api/results/:scanId", async (req, res) => {
  const scanId = req.params.scanId;
  if (!resultsStore.has(scanId)) {
    return res.status(404).json({ error: "Scan not found" });
  }

  const result = resultsStore.get(scanId);

  // Only add AI suggestions when status is completed
  if (result.status === "completed" && !result.aiEnhanced) {
    if (result.security) {
      result.security.aiSuggestion = await generateAISuggestions("Security", result.security);
    }
    if (result.performance) {
      result.performance.aiSuggestion = await generateAISuggestions("Performance", result.performance);
    }
    if (result.seo) {
      result.seo.aiSuggestion = await generateAISuggestions("SEO", result.seo);
    }
    if (result.accessibility) {
      result.accessibility.aiSuggestion = await generateAISuggestions("Accessibility", result.accessibility);
    }
    result.aiEnhanced = true;
    resultsStore.set(scanId, result);
  }

  res.json(result);
});

// ===================
// Background job
// ===================
async function runFullAudit(scanId, target) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let perfReport, accessibilityReport;

  try {
    // Performance + SEO
    try {
      perfReport = await runLighthouseAudit(target, browser);
    } catch (err) {
      perfReport = { error: "Lighthouse scan failed", details: err.message };
    }

    // Accessibility
    try {
      accessibilityReport = await runAccessibilityAudit(target, browser);
    } catch (err) {
      accessibilityReport = [{ error: "Accessibility scan failed", details: err.message }];
    }

    resultsStore.set(scanId, {
      ...resultsStore.get(scanId),
      status: "completed",
      performance: perfReport,
      seo: perfReport,
      accessibility: accessibilityReport,
    });
  } finally {
    await browser.close();
  }
}

// ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
