import { Router, type Request, type Response } from "express";
import { env } from "../config/env";

const router: Router = Router();

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default:  return "&#39;";
    }
  });
}

router.get("/", (_req: Request, res: Response) => {
  const dashboardUrl = escapeHtml(env.DASHBOARD_URL);
  const brand = escapeHtml(env.BRAND_NAME);
  const host = escapeHtml(new URL(env.PUBLIC_BASE_URL).host);

  // Public landing page is allowed to be cached at the edge for a minute.
  res.set("Cache-Control", "public, max-age=60");
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${brand} — short links that fly</title>
  <meta name="description" content="${brand}: branded short links, smart redirects, real-time analytics." />
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;height:100%}
    body{
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
      color:#0f172a;background:#fff;-webkit-font-smoothing:antialiased;
    }
    .bg{
      position:fixed;inset:0;z-index:-1;
      background:
        radial-gradient(900px 600px at 85% -10%, #c7d2fe66, transparent 60%),
        radial-gradient(700px 500px at -10% 110%, #a7f3d066, transparent 55%),
        linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);
    }
    header{display:flex;align-items:center;justify-content:space-between;padding:22px 28px;max-width:1180px;margin:0 auto}
    .logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:-.01em}
    .logo .dot{
      width:28px;height:28px;border-radius:8px;
      background:linear-gradient(135deg,#6366f1,#06b6d4);
      box-shadow:0 6px 18px #6366f155;
    }
    nav a{color:#475569;text-decoration:none;font-size:14px;margin-left:22px}
    nav a:hover{color:#0f172a}
    .cta{
      display:inline-block;padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px;
      color:#fff;background:#0f172a;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease;
    }
    .cta:hover{transform:translateY(-1px);box-shadow:0 10px 30px #0f172a33}
    .cta.primary{background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff}

    main{max-width:1180px;margin:0 auto;padding:48px 28px 0;text-align:center}
    h1{font-size:clamp(36px,6vw,68px);line-height:1.05;letter-spacing:-.025em;margin:24px 0 14px}
    h1 .grad{
      background:linear-gradient(135deg,#6366f1,#06b6d4 60%,#10b981);
      -webkit-background-clip:text;background-clip:text;color:transparent;
    }
    p.lead{font-size:18px;color:#475569;max-width:680px;margin:0 auto 28px}
    .pill{
      display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;
      background:#eef2ff;color:#4338ca;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
    }
    .pill .ping{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 0 4px #10b98133}

    .demo{
      margin:42px auto 0;max-width:760px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;
      box-shadow:0 24px 60px -20px #0f172a26;padding:22px;text-align:left;
    }
    .row{display:flex;gap:10px;align-items:stretch}
    .row input{
      flex:1;padding:14px 16px;font-size:15px;border:1px solid #e2e8f0;border-radius:10px;outline:none;
      transition:border-color .15s ease, box-shadow .15s ease;
    }
    .row input:focus{border-color:#6366f1;box-shadow:0 0 0 4px #6366f122}
    .row a.cta{display:inline-flex;align-items:center;padding:0 22px;border-radius:10px}
    .hint{margin:10px 4px 0;font-size:12px;color:#64748b}
    .hint code{background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a}

    .features{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:64px auto 0;max-width:1080px}
    @media(max-width:780px){.features{grid-template-columns:1fr}}
    .card{
      background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:22px;text-align:left;
      transition:transform .15s ease,box-shadow .15s ease;
    }
    .card:hover{transform:translateY(-2px);box-shadow:0 18px 40px -20px #0f172a26}
    .card .ico{
      width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;
      background:#eef2ff;color:#4338ca;font-size:18px;margin-bottom:12px;
    }
    .card h3{margin:0 0 6px;font-size:16px;letter-spacing:-.01em}
    .card p{margin:0;color:#475569;font-size:14px;line-height:1.5}

    footer{margin:80px auto 0;padding:28px;text-align:center;color:#64748b;font-size:13px;max-width:1180px}
    footer a{color:#475569;text-decoration:none;margin:0 8px}
    footer a:hover{color:#0f172a}
  </style>
</head>
<body>
  <div class="bg"></div>

  <header>
    <div class="logo"><span class="dot"></span>${brand}</div>
    <nav>
      <a href="${dashboardUrl}/login">Sign in</a>
      <a class="cta" href="${dashboardUrl}/register">Get started</a>
    </nav>
  </header>

  <main>
    <span class="pill"><span class="ping"></span>${host} is live</span>
    <h1>Short links.<br/><span class="grad">Smarter redirects.</span></h1>
    <p class="lead">
      ${brand} turns long URLs into branded, lightning-fast short links — with
      geo &amp; device routing, A/B variants, password protection and real-time analytics.
    </p>

    <div class="demo">
      <div class="row">
        <input type="url" placeholder="Paste a long URL here…" disabled />
        <a class="cta primary" href="${dashboardUrl}/register">Shorten →</a>
      </div>
      <p class="hint">
        Already shortened something? Try <code>${host}/&lt;your-code&gt;</code>.
        Manage everything in the <a href="${dashboardUrl}">dashboard</a>.
      </p>
    </div>

    <section class="features">
      <div class="card">
        <div class="ico">⚡</div>
        <h3>Sub-50ms redirects</h3>
        <p>Redis-cached hot path with async analytics — your users never wait.</p>
      </div>
      <div class="card">
        <div class="ico">🌍</div>
        <h3>Smart routing</h3>
        <p>Send traffic by country, device, OS or weighted A/B variant.</p>
      </div>
      <div class="card">
        <div class="ico">📊</div>
        <h3>Real-time analytics</h3>
        <p>Clicks, unique visitors, geos, devices, referrers — all live.</p>
      </div>
    </section>
  </main>

  <footer>
    © ${new Date().getFullYear()} ${brand}
    · <a href="${dashboardUrl}">Dashboard</a>
    · <a href="${dashboardUrl}/login">Sign in</a>
    · <a href="/health">Status</a>
  </footer>
</body>
</html>`);
});

export default router;
