import { Router } from "express";
import { loginSchema, registerSchema } from "@momolinks/lib";
import { validateBody } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimit";
import { asyncHandler } from "../utils/asyncHandler";
import { login, register } from "../services/authService";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { UserModel } from "../models/User";

const router: Router = Router();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const out = await register(req.body);
    res.status(201).json({ success: true, data: out });
  })
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const out = await login(req.body);
    res.json({ success: true, data: out });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const doc = await UserModel.findById(user.sub);
    if (!doc) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
    res.json({
      success: true,
      data: {
        id: doc.id,
        email: doc.email,
        name: doc.name,
        role: doc.role,
      },
    });
  })
);

export default router;
