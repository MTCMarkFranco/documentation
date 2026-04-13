#!/usr/bin/env node
/**
 * High-fidelity Markdown → PDF converter
 * - Renders Mermaid diagrams via Mermaid.js CDN
 * - Syntax-highlighted code blocks via highlight.js
 * - Professional styling with table formatting, typography, and color
 * - Uses existing Edge/Chrome browser via puppeteer-core (no Chromium download)
 */

const { marked } = require('marked');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// --- Paths ---
const INPUT = path.resolve(__dirname, 'mobile-application-best-practices.md');
const OUTPUT_HTML = path.resolve(__dirname, 'mobile-application-best-practices.html');
const OUTPUT_PDF = path.resolve(__dirname, 'mobile-application-best-practices.pdf');

// --- Find Chromium-based browser already installed ---
function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log(`Using browser: ${p}`);
      return p;
    }
  }
  throw new Error('No Chromium-based browser found. Install Edge or Chrome, or set CHROME_PATH.');
}

// --- Custom marked renderer for Mermaid blocks (marked v4 API) ---
const renderer = new marked.Renderer();
const originalCodeRenderer = renderer.code.bind(renderer);

// Strip emojis from Mermaid diagram source — they break headless rendering
function stripEmojis(text) {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')   // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')   // misc symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')   // transport & map
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '')   // alchemical
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')   // geometric shapes ext
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')   // supplemental arrows-C
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')   // supplemental symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')   // chess symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')   // symbols & pictographs ext-A
    .replace(/[\u{2600}-\u{26FF}]/gu, '')      // misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')      // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')      // variation selectors
    .replace(/[\u{200D}]/gu, '')                // zero-width joiner
    .replace(/[\u{20E3}]/gu, '')                // combining enclosing keycap
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')    // tags
    .replace(/[ \t]{2,}/g, ' ');               // collapse multiple spaces (preserve newlines!)
}

// Decode HTML entities that marked encodes inside code blocks
function htmlDecode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

renderer.code = function(code, lang, escaped) {
  if (lang === 'mermaid') {
    // 'code' from marked is HTML-entity-encoded (e.g., &lt; &gt; &amp;).
    // We keep it that way so the browser doesn't parse <signed_proof_JWT>
    // or other angle-bracketed text as HTML elements.
    // Mermaid reads textContent from the DOM, which auto-decodes entities
    // back to the original characters (<br/>, ->>, etc.).
    const cleanCode = stripEmojis(htmlDecode(code));
    // Re-encode angle brackets that aren't Mermaid-safe HTML tags (<br/>, <br>)
    const safeCode = cleanCode
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;br\/&gt;/g, '<br/>')
      .replace(/&lt;br&gt;/g, '<br>');
    return `<div class="mermaid">\n${safeCode}\n</div>\n`;
  }
  return originalCodeRenderer(code, lang, escaped);
};
marked.setOptions({ renderer, gfm: true, breaks: false });

// --- Read and convert markdown ---
console.log(`Reading: ${INPUT}`);
const md = fs.readFileSync(INPUT, 'utf-8');
const htmlBody = marked.parse(md);



// --- CSS Stylesheet ---
const CSS = `
/* ============================================ */
/*  Document Layout                             */
/* ============================================ */
@page {
  size: letter;
  margin: 18mm;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.65;
  color: #1a1a1a;
  margin: 0;
  padding: 0;
  background: #f5f5f5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.document {
  max-width: 960px;
  margin: 40px auto;
  padding: 48px 56px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

@media print {
  body { background: #fff; }
  .document {
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
    border-radius: 0;
  }
}

/* ============================================ */
/*  Typography                                  */
/* ============================================ */
h1 {
  font-size: 24pt;
  font-weight: 700;
  color: #0f6cbd;
  border-bottom: 3px solid #0f6cbd;
  padding-bottom: 10px;
  margin-top: 0;
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}

h2 {
  font-size: 17pt;
  font-weight: 600;
  color: #0f6cbd;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 7px;
  margin-top: 36px;
  margin-bottom: 14px;
  page-break-after: avoid;
}

h3 {
  font-size: 13pt;
  font-weight: 600;
  color: #242424;
  margin-top: 24px;
  margin-bottom: 10px;
  page-break-after: avoid;
}

h4 {
  font-size: 11pt;
  font-weight: 600;
  color: #424242;
  margin-top: 18px;
  margin-bottom: 8px;
  page-break-after: avoid;
}

p {
  margin: 8px 0;
}

strong {
  font-weight: 600;
}

a {
  color: #0f6cbd;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

hr {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 28px 0;
}

/* ============================================ */
/*  Lists                                       */
/* ============================================ */
ul, ol {
  padding-left: 22px;
  margin: 8px 0;
}

li {
  margin: 3px 0;
}

li > ul, li > ol {
  margin: 2px 0;
}

/* ============================================ */
/*  Tables                                      */
/* ============================================ */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  font-size: 9pt;
  line-height: 1.5;
  page-break-inside: auto;
}

thead {
  background: linear-gradient(135deg, #0f6cbd 0%, #1b7fd4 100%);
  color: white;
}

thead th {
  padding: 9px 10px;
  text-align: left;
  font-weight: 600;
  font-size: 9pt;
  border: 1px solid #0a5a9e;
  white-space: nowrap;
}

thead th:first-child {
  border-top-left-radius: 4px;
}

thead th:last-child {
  border-top-right-radius: 4px;
}

tbody td {
  padding: 7px 10px;
  border: 1px solid #e0e0e0;
  vertical-align: top;
}

tbody tr:nth-child(even) {
  background-color: #f7f9fc;
}

tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

tbody tr:last-child td:first-child {
  border-bottom-left-radius: 4px;
}

tbody tr:last-child td:last-child {
  border-bottom-right-radius: 4px;
}

/* ============================================ */
/*  Code Blocks                                 */
/* ============================================ */
code {
  background-color: #f0f0f0;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace;
  font-size: 8.5pt;
  color: #c7254e;
}

pre {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 16px 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 8pt;
  line-height: 1.55;
  page-break-inside: avoid;
  border: 1px solid #333;
  margin: 14px 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

/* ============================================ */
/*  Blockquotes                                 */
/* ============================================ */
blockquote {
  border-left: 4px solid #0f6cbd;
  margin: 16px 0;
  padding: 14px 20px;
  background-color: #f0f6ff;
  border-radius: 0 6px 6px 0;
  color: #2b2b2b;
  font-style: normal;
}

blockquote p {
  margin: 6px 0;
}

blockquote strong {
  color: #0f6cbd;
}

/* Warning blockquotes (contain ⚠️) */
blockquote p:first-child:has(strong) {
  margin-top: 0;
}

/* ============================================ */
/*  Mermaid Diagrams                            */
/* ============================================ */
.mermaid {
  text-align: center;
  margin: 24px auto;
  padding: 20px 10px;
  background: #fafcff;
  border: 1px solid #e4eaf0;
  border-radius: 8px;
  page-break-inside: avoid;
  overflow: visible;
}

.mermaid svg {
  max-width: 100% !important;
  height: auto !important;
}

/* ============================================ */
/*  Emoji / Icon Support                        */
/* ============================================ */
body {
  font-feature-settings: "liga" 1;
}

/* ============================================ */
/*  Print Optimizations                         */
/* ============================================ */
@media print {
  /* Natural section breaks — every h2 starts a new page */
  h2 {
    page-break-before: always;
    margin-top: 0;
    padding-top: 8px;
  }

  /* First h2 right after the title block should not force a break */
  .document > h2:first-of-type {
    page-break-before: auto;
  }

  h2, h3, h4 {
    page-break-after: avoid;
  }

  table, pre, .mermaid, blockquote {
    page-break-inside: avoid;
  }

  tr {
    page-break-inside: avoid;
  }
}

/* ============================================ */
/*  Version / Classification Bar                */
/* ============================================ */
.document > p:first-child {
  margin-top: 0;
}

/* Ensure the classification/version block at top is styled */
.document > p:nth-child(2),
.document > p:nth-child(3),
.document > p:nth-child(4) {
  color: #555;
  font-size: 9pt;
}

/* ============================================ */
/*  Highlight.js Overrides for Dark Theme       */
/* ============================================ */
.hljs-keyword { color: #569cd6; }
.hljs-string { color: #ce9178; }
.hljs-comment { color: #6a9955; font-style: italic; }
.hljs-function { color: #dcdcaa; }
.hljs-number { color: #b5cea8; }
.hljs-type { color: #4ec9b0; }
.hljs-class { color: #4ec9b0; }
.hljs-title { color: #dcdcaa; }
.hljs-params { color: #9cdcfe; }
.hljs-attr { color: #9cdcfe; }
.hljs-built_in { color: #4ec9b0; }
.hljs-literal { color: #569cd6; }
.hljs-meta { color: #569cd6; }
.hljs-meta .hljs-string { color: #ce9178; }
.hljs-selector-class { color: #d7ba7d; }
.hljs-variable { color: #9cdcfe; }

/* ============================================ */
/*  Decision Tree (ASCII-art code block)        */
/* ============================================ */
pre:has(code:not([class])) {
  background-color: #fafafa;
  color: #333;
  border: 1px solid #e0e0e0;
}

/* Specifically for the decision tree which has no lang */
pre > code:not([class]) {
  color: #333;
}
`;

// --- Full HTML Document ---
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Secure Mobile Application Architecture Best Practices</title>

  <!-- Highlight.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/swift.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/kotlin.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"></script>

  <!-- Mermaid.js for diagram rendering -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>

  <style>${CSS}</style>

  <script>
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 15,
        nodeSpacing: 50,
        rankSpacing: 50
      },
      sequence: {
        useMaxWidth: true,
        actorMargin: 80,
        messageFontSize: 12,
        noteFontSize: 11,
        actorFontSize: 12,
        wrap: true,
        wrapPadding: 10,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      },
      block: {
        padding: 8
      }
    });

    // Initialize highlight.js after DOM load
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('pre code[class*="language-"]').forEach(function(block) {
        hljs.highlightElement(block);
      });
    });
  </script>
</head>
<body>
  <div class="document">
    ${htmlBody}
  </div>
</body>
</html>`;

// --- Write standalone HTML ---
fs.writeFileSync(OUTPUT_HTML, fullHtml, 'utf-8');
const htmlSize = (fs.statSync(OUTPUT_HTML).size / 1024).toFixed(0);
console.log(`\n✅ HTML generated: ${OUTPUT_HTML} (${htmlSize} KB)`);

// --- Optionally generate PDF with Puppeteer ---
const generatePdf = process.argv.includes('--pdf');
if (!generatePdf) {
  console.log('   (Run with --pdf flag to also generate PDF)');
  process.exit(0);
}

(async () => {
  const browserPath = findBrowser();

  console.log('\nLaunching headless browser for PDF...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  console.log('Loading HTML content and rendering diagrams...');
  await page.setContent(fullHtml, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  console.log('Waiting for Mermaid diagrams to render...');
  await page.waitForFunction(() => {
    const diagrams = document.querySelectorAll('.mermaid');
    if (diagrams.length === 0) return true;
    return Array.from(diagrams).every(d => d.querySelector('svg') !== null);
  }, { timeout: 45000 });

  await new Promise(r => setTimeout(r, 3000));

  console.log('Generating PDF...');
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'Letter',
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '18mm',
      right: '18mm'
    },
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: false,
    tagged: true
  });

  await browser.close();

  const fileSize = (fs.statSync(OUTPUT_PDF).size / 1024).toFixed(0);
  console.log(`✅ PDF generated: ${OUTPUT_PDF} (${fileSize} KB)`);
})().catch(err => {
  console.error('\n❌ Error generating PDF:', err.message);
  process.exit(1);
});
