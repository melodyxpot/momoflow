import { Router, type Request, type Response } from "express";
import { isReservedCode } from "@momoflow/lib";
import { resolveLink } from "../services/redirectService";
import { recordClick } from "../services/analyticsService";

const router = Router();

function clientIp(req: Request): string {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
  return fwd || req.socket.remoteAddress || "0.0.0.0";
}

async function handle(req: Request, res: Response) {
  const code = (req.params.code || "").trim();

  if (!code || isReservedCode(code) || !/^[A-Za-z0-9_-]{1,32}$/.test(code)) {
    return res.status(404).type("text/plain").send("Not found");
  }

  const password =
    typeof req.query.p === "string" ? req.query.p : (req.body?.password as string | undefined);

  const result = await resolveLink(code, {
    ip: clientIp(req),
    userAgent: req.headers["user-agent"],
    password,
  });

  switch (result.kind) {
    case "redirect": {
      // Fire-and-forget analytics. Never block the redirect.
      recordClick({
        linkId: result.linkId,
        ip: clientIp(req),
        userAgent: req.headers["user-agent"],
        referrer: (req.headers.referer || req.headers.referrer) as string | undefined,
      });

      // Cache-friendly: short TTL so updates propagate fast, no caching of HTML body.
      res.set("Cache-Control", "private, max-age=0, must-revalidate");
      return res.redirect(302, result.url);
    }
    case "not_found":
      return res.status(404).type("text/plain").send("Link not found");
    case "expired":
      return res.status(410).type("text/plain").send("This link has expired");
    case "disabled":
      return res.status(403).type("text/plain").send("This link is disabled");
    case "password_required":
      return res
        .status(401)
        .type("text/plain")
        .send("Password required. Append ?p=YOUR_PASSWORD");
    case "password_invalid":
      return res.status(401).type("text/plain").send("Invalid password");
  }
}

router.get("/:code", handle);
router.post("/:code", handle); // for password unlock via POST

export default router;
