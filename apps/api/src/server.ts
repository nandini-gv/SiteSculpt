import "dotenv/config";
import express from "express";
import cors from "cors";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { nanoid } from "nanoid";
import archiver from "archiver";
import { PassThrough } from "node:stream";
import { isIP } from "node:net";

const app = express();
const port = Number(process.env.PORT || 8787);
app.use(cors());
app.use(express.json({ limit: "25mb" }));

let browser: Browser | undefined;
const captures = new Map<string, any>();

function privateHost(host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h === "::1" ||
    h === "0.0.0.0" ||
    h === "127.0.0.1" ||
    h.startsWith("10.") ||
    h.startsWith("192.168.") ||
    h.startsWith("169.254.") ||
    h.startsWith("172.16.") ||
    h.startsWith("172.17.") ||
    h.startsWith("172.18.") ||
    h.startsWith("172.19.") ||
    h.startsWith("172.2") ||
    h.startsWith("172.30.") ||
    h.startsWith("172.31.") ||
    h.endsWith(".internal")
  )
    return true;
  return false;
}

function validateUrl(raw: string) {
  let trimmed = String(raw || "").trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  const u = new URL(trimmed);
  if (!["http:", "https:"].includes(u.protocol))
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (privateHost(u.hostname))
    throw new Error("Local and private network addresses are blocked.");
  if (isIP(u.hostname) && privateHost(u.hostname))
    throw new Error("Private IP addresses are blocked.");
  return u;
}

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

async function createPage(viewport = { width: 1440, height: 1000 }) {
  const b = await getBrowser();
  const context = await b.newContext({
    viewport: {
      width: Math.min(Number(viewport.width) || 1440, 1920),
      height: Math.min(Number(viewport.height) || 1000, 1600),
    },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  await context.addInitScript("window.__name = (t, v) => t;");
  const page = await context.newPage();
  await page.addInitScript("window.__name = (t, v) => t;");
  return { context, page };
}

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "webextract-api", browser: "playwright", ai: "disabled" })
);

app.get("/api/captures", (_req, res) =>
  res.json({
    captures: Array.from(captures.values()).map(({ screenshot, ...item }) => ({
      ...item,
      screenshot,
    })),
  })
);

app.post("/api/capture", async (req, res) => {
  let context: BrowserContext | undefined;
  let page: Page | undefined;
  try {
    const { url, mode = "full", selector, viewport = { width: 1440, height: 1000 } } =
      req.body || {};
    if (!url) return res.status(400).json({ error: "URL is required." });
    const target = validateUrl(url);

    const cp = await createPage(viewport);
    context = cp.context;
    page = cp.page;

    await page.goto(target.href, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator("body").waitFor({ state: "attached", timeout: 15000 }).catch(() => {});

    // Check if we're blocked by a proxy/firewall (Zscaler, corporate gateway, etc.)
    const pageTitle = await page.title().catch(() => "");
    const pageContent = await page.content().catch(() => "");
    if (
      pageTitle.toLowerCase().includes("zscaler") ||
      pageTitle.toLowerCase().includes("security") && pageTitle.toLowerCase().includes("blocked") ||
      pageContent.includes("zscaler") ||
      pageContent.includes("access denied") ||
      pageContent.includes("authentication required")
    ) {
      throw new Error(
        `Cannot access this website - it appears to be blocked by a corporate proxy/firewall (${pageTitle}). ` +
        `The site may require authentication or VPN access that your browser has but the API doesn't. ` +
        `Try: 1) Use a VPN if required, 2) Access from a network without proxy restrictions, or 3) Configure proxy settings in the API.`
      );
    }

    await page.waitForTimeout(1800);

    // Ensure __name helper is defined in page context before any evaluate
    await page.evaluate("window.__name = (t, v) => t;").catch(() => {});

    // Trigger lazy loading by scrolling through the page.
    if (mode === "full") {
      await page.evaluate(async () => {
        const step = Math.max(500, window.innerHeight * 0.75);
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
    }

    const locator = mode === "selector" ? (selector ? page.locator(selector).first() : null) : null;
    if (mode === "selector" && !locator)
      throw new Error("A CSS selector is required for selector mode.");
    if (locator && !(await locator.count()))
      throw new Error(`No element matched selector: ${selector}`);

    const element = locator || page.locator("body");
    const screenshot = mode === "selector" && locator
      ? await locator.screenshot({ type: "png", animations: "disabled", timeout: 30000 })
      : await page.screenshot({ type: "png", fullPage: true, animations: "disabled", timeout: 30000 });

    // Make sure __name is set
    await page.evaluate("window.__name = (t, v) => t;").catch(() => {});

    const design = await element.evaluate((el: any) => {
      const helpers = {
        style(node: Element) {
          const s = getComputedStyle(node);
          return {
            display: s.display,
            position: s.position,
            width: s.width,
            height: s.height,
            margin: s.margin,
            padding: s.padding,
            gap: s.gap,
            color: s.color,
            backgroundColor: s.backgroundColor,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            border: s.border,
            borderRadius: s.borderRadius,
            boxShadow: s.boxShadow,
            textAlign: s.textAlign,
            objectFit: s.objectFit,
          };
        },
      };

      const root = el as HTMLElement;
      const nodes = [root, ...Array.from(root.querySelectorAll("*")).slice(0, 1500)];
      return {
        schemaVersion: "1.0",
        url: location.href,
        title: document.title,
        capturedAt: new Date().toISOString(),
        viewport: { width: innerWidth, height: innerHeight },
        mode: "dom",
        selector:
          root.tagName.toLowerCase() +
          (root.id ? "#" + root.id : "") +
          (root.classList.length ? "." + Array.from(root.classList).slice(0, 3).join(".") : ""),
        html: root.outerHTML,
        text: (root.innerText || "").slice(0, 50000),
        rootStyles: helpers.style(root),
        elements: nodes
          .map((n: any) => {
            const r = n.getBoundingClientRect();
            return {
              tag: n.tagName.toLowerCase(),
              text: n.children.length ? "" : (n.textContent || "").trim().slice(0, 500),
              selector: n.id ? "#" + n.id : n.tagName.toLowerCase(),
              rect: {
                x: Math.round(r.x),
                y: Math.round(r.y),
                width: Math.round(r.width),
                height: Math.round(r.height),
              },
              styles: helpers.style(n),
            };
          })
          .slice(0, 1501),
        images: Array.from(root.querySelectorAll("img")).map((i: any) => ({
          src: i.currentSrc || i.src,
          alt: i.alt,
          width: i.naturalWidth,
          height: i.naturalHeight,
        })),
        fonts: Array.from(document.fonts).map((f: any) => ({
          family: f.family,
          weight: f.weight,
          status: f.status,
        })),
      };
    });

    const id = nanoid();
    const shotData = `data:image/png;base64,${screenshot.toString("base64")}`;
    const record = {
      id,
      url: target.href,
      title: design.title,
      mode,
      design,
      screenshot: shotData,
      createdAt: new Date().toISOString(),
    };
    captures.set(id, record);
    res.json({ id, title: design.title, screenshot: shotData, design });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Capture failed" });
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
  }
});

app.post("/api/sections", async (req, res) => {
  try {
    const { url, html, text, selector, styles, screenshotDataUrl } = req.body || {};
    if (!url || !html) return res.status(400).json({ error: "URL and selected HTML are required." });
    const target = validateUrl(url);
    const id = nanoid();
    const design = {
      schemaVersion: "1.0",
      url: target.href,
      title: new URL(target.href).hostname,
      capturedAt: new Date().toISOString(),
      mode: "section",
      selector,
      html,
      text,
      rootStyles: styles || {},
      elements: [],
      images: [],
      fonts: [],
    };
    const record = {
      id,
      url: target.href,
      title: design.title,
      mode: "section",
      design,
      screenshot: screenshotDataUrl,
      createdAt: design.capturedAt,
    };
    captures.set(id, record);
    res.json({ id, title: design.title, design });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Section import failed" });
  }
});

function safeName(v: string) {
  return (v || "webextract").replace(/[^a-z0-9-_]/gi, "-").slice(0, 60);
}

function htmlDocument(c: any) {
  const d = c || {};
  const html = d.html || "<main><h1>Captured website</h1></main>";
  const base = d.url || "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${String(
    base
  ).replace(/"/g, "&quot;")}"><title>${String(d.title || "WebExtract capture").replace(
    /</g,
    "&lt;"
  )}</title><link rel="stylesheet" href="styles.css"></head><body>${html}</body></html>`;
}

function generateCSS(c: any) {
  const d = c || {};
  let css = `/* WebExtract Captured Styles */
/* Captured from: ${d.url || 'unknown'} */
/* Date: ${d.capturedAt || new Date().toISOString()} */

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: ${d.rootStyles?.fontFamily || 'Arial, sans-serif'};
}

img {
  max-width: 100%;
  height: auto;
}

`;

  // Add root styles if available
  if (d.rootStyles) {
    const rs = d.rootStyles;
    css += `body {\n`;
    if (rs.backgroundColor && rs.backgroundColor !== 'rgba(0, 0, 0, 0)') css += `  background-color: ${rs.backgroundColor};\n`;
    if (rs.color) css += `  color: ${rs.color};\n`;
    if (rs.fontFamily) css += `  font-family: ${rs.fontFamily};\n`;
    if (rs.fontSize) css += `  font-size: ${rs.fontSize};\n`;
    if (rs.lineHeight) css += `  line-height: ${rs.lineHeight};\n`;
    css += `}\n\n`;
  }

  // Add element-specific styles
  if (Array.isArray(d.elements)) {
    const styleMap = new Map();
    d.elements.forEach((el: any, idx: number) => {
      if (!el.styles) return;
      const s = el.styles;
      const selector = el.selector || `*:nth-child(${idx + 1})`;

      let rules = '';
      if (s.display && s.display !== 'inline') rules += `  display: ${s.display};\n`;
      if (s.position && s.position !== 'static') rules += `  position: ${s.position};\n`;
      if (s.width && !s.width.includes('auto')) rules += `  width: ${s.width};\n`;
      if (s.height && !s.height.includes('auto')) rules += `  height: ${s.height};\n`;
      if (s.margin && s.margin !== '0px') rules += `  margin: ${s.margin};\n`;
      if (s.padding && s.padding !== '0px') rules += `  padding: ${s.padding};\n`;
      if (s.gap && s.gap !== 'normal' && s.gap !== '0px') rules += `  gap: ${s.gap};\n`;
      if (s.color) rules += `  color: ${s.color};\n`;
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') rules += `  background-color: ${s.backgroundColor};\n`;
      if (s.fontFamily) rules += `  font-family: ${s.fontFamily};\n`;
      if (s.fontSize) rules += `  font-size: ${s.fontSize};\n`;
      if (s.fontWeight && s.fontWeight !== '400') rules += `  font-weight: ${s.fontWeight};\n`;
      if (s.lineHeight) rules += `  line-height: ${s.lineHeight};\n`;
      if (s.letterSpacing && s.letterSpacing !== 'normal') rules += `  letter-spacing: ${s.letterSpacing};\n`;
      if (s.border && s.border !== '0px none rgb(0, 0, 0)') rules += `  border: ${s.border};\n`;
      if (s.borderRadius && s.borderRadius !== '0px') rules += `  border-radius: ${s.borderRadius};\n`;
      if (s.boxShadow && s.boxShadow !== 'none') rules += `  box-shadow: ${s.boxShadow};\n`;
      if (s.textAlign && s.textAlign !== 'start') rules += `  text-align: ${s.textAlign};\n`;

      if (rules) {
        styleMap.set(selector, rules);
      }
    });

    // Write out collected styles
    styleMap.forEach((rules, selector) => {
      css += `${selector} {\n${rules}}\n\n`;
    });
  }

  return css;
}

async function zipResponse(
  res: any,
  files: { name: string; content: string | Buffer }[],
  name: string
) {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${name}.zip"`);
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (e) => res.status(500).end(String(e)));
  archive.pipe(res);
  for (const f of files) archive.append(f.content, { name: f.name });
  await archive.finalize();
}

app.post("/api/export/html", async (req, res) => {
  const c = req.body.capture || {};
  const html = htmlDocument(c);
  const css = generateCSS(c);
  await zipResponse(
    res,
    [
      { name: "index.html", content: html },
      { name: "styles.css", content: css },
      { name: "design.json", content: JSON.stringify(c, null, 2) },
      { name: "README.txt", content: "WebExtract HTML Export\n\nOpen index.html in your browser to view the captured page.\nstyles.css contains the extracted styles.\ndesign.json contains the full design data.\n\nNote: External assets (images, fonts) may not load if they require authentication or are hosted on private networks." },
    ],
    safeName(c.title) + "-html"
  );
});

app.post("/api/export/react", async (req, res) => {
  const c = req.body.capture || {};
  const component = `import React from "react";\n\n/** Recreated from a WebExtract capture. Review external assets and responsive behavior. */\nexport default function CapturedSection(){\n return <div dangerouslySetInnerHTML={{__html:${JSON.stringify(
    c.html || "<main>Captured section</main>"
  )}}} />;\n}\n`;
  const css = `/* WebExtract starter styles */\n.captured-section{box-sizing:border-box;max-width:100%;}\n.captured-section img{max-width:100%;height:auto;}\n`;
  await zipResponse(
    res,
    [
      { name: "CapturedSection.tsx", content: component },
      { name: "captured.css", content: css },
      { name: "design.json", content: JSON.stringify(c, null, 2) },
      {
        name: "README.md",
        content:
          "Review captured markup before production use. This starter preserves captured HTML; it is not a clean component reconstruction.",
      },
    ],
    safeName(c.title) + "-react"
  );
});

app.post("/api/export/json", (req, res) => {
  const c = req.body.capture || {};
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeName(c.title)}-design.json"`
  );
  res.send(JSON.stringify(c, null, 2));
});

app.post("/api/export/pdf", async (req, res) => {
  let context: BrowserContext | undefined;
  let p: Page | undefined;
  try {
    const { url, selector } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required for PDF export." });
    const target = validateUrl(url);
    const cp = await createPage({ width: 1440, height: 1000 });
    context = cp.context;
    p = cp.page;
    await p
      .goto(target.href, { waitUntil: "networkidle", timeout: 60000 })
      .catch(() => p!.goto(target.href, { waitUntil: "domcontentloaded", timeout: 60000 }));
    if (selector) {
      const el = p.locator(selector).first();
      if (!(await el.count())) throw new Error("PDF selector did not match an element.");
      await p.evaluate("window.__name = (t, v) => t;").catch(() => {});
      const html = await el.evaluate((e: any) => e.outerHTML);
      await p.setContent(html, { waitUntil: "domcontentloaded" });
    }
    const pdf = await p.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="webextract.pdf"');
    res.send(pdf);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "PDF export failed" });
  } finally {
    await p?.close().catch(() => {});
    await context?.close().catch(() => {});
  }
});

const server = app.listen(port, () =>
  console.log(`WebExtract API listening on http://localhost:${port}`)
);

export { app, server };

process.on("SIGINT", async () => {
  await browser?.close().catch(() => {});
  process.exit(0);
});
