import { Router } from "express";
import { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { getLinkStats } from "../services/analyticsService";
import { getLinkById } from "../services/linkService";
import { LinkModel } from "../models/Link";

const router = Router();
router.use(requireAuth);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    // Ensure ownership before exposing stats
    await getLinkById(user.sub, req.params.id);
    const days = Math.min(365, Math.max(1, Number(req.query.days ?? 30)));
    const stats = await getLinkStats(req.params.id, days);
    res.json({ success: true, data: stats });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;

    const [totals, topLinks] = await Promise.all([
      LinkModel.aggregate([
        { $match: { userId: new Types.ObjectId(user.sub) } },
        {
          $group: {
            _id: null,
            totalLinks: { $sum: 1 },
            totalClicks: { $sum: "$clicks" },
            totalUnique: { $sum: "$uniqueClicks" },
          },
        },
      ]),
      LinkModel.find({ userId: user.sub })
        .sort({ clicks: -1 })
        .limit(5)
        .select("code targetUrl clicks uniqueClicks title")
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        totalLinks: totals[0]?.totalLinks ?? 0,
        totalClicks: totals[0]?.totalClicks ?? 0,
        totalUnique: totals[0]?.totalUnique ?? 0,
        topLinks,
      },
    });
  })
);

export default router;
