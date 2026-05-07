import { Router } from "express";
import {
  buildShortUrl,
  createLinkSchema,
  updateLinkSchema,
} from "@momoflow/lib";
import { env } from "../config/env";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import {
  createLink,
  deleteLink,
  getLinkById,
  listLinks,
  updateLink,
} from "../services/linkService";

const router: Router = Router();
router.use(requireAuth);

const presentLink = (doc: {
  _id: unknown;
  code: string;
  targetUrl: string;
  userId: unknown;
  clicks: number;
  uniqueClicks: number;
  enabled: boolean;
  title?: string;
  description?: string;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  rules?: unknown;
}) => ({
  id: String(doc._id),
  code: doc.code,
  targetUrl: doc.targetUrl,
  shortUrl: buildShortUrl(env.PUBLIC_BASE_URL, doc.code),
  clicks: doc.clicks,
  uniqueClicks: doc.uniqueClicks,
  enabled: doc.enabled,
  title: doc.title,
  description: doc.description,
  expiresAt: doc.expiresAt ?? null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  rules: doc.rules ?? null,
});

router.post(
  "/",
  validateBody(createLinkSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const link = await createLink(user.sub, req.body);
    res.status(201).json({ success: true, data: presentLink(link.toObject()) });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await listLinks(user.sub, { page, limit, search });
    res.json({
      success: true,
      data: {
        ...result,
        items: result.items.map(presentLink),
      },
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Missing id parameter" } });
    const link = await getLinkById(user.sub, id);
    res.json({ success: true, data: presentLink(link.toObject()) });
  })
);

router.patch(
  "/:id",
  validateBody(updateLinkSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Missing id parameter" } });
    const link = await updateLink(user.sub, id, req.body);
    res.json({ success: true, data: presentLink(link.toObject()) });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Missing id parameter" } });
    await deleteLink(user.sub, id);
    res.json({ success: true, data: { id } });
  })
);

export default router;
