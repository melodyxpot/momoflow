import bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput, AuthUser } from "@momoflow/lib";
import { UserModel } from "../models/User";
import { HttpError } from "../utils/HttpError";
import { signToken } from "../middleware/auth";

export async function register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
  const existing = await UserModel.exists({ email: input.email });
  if (existing) throw HttpError.conflict("Email already registered");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const doc = await UserModel.create({
    email: input.email,
    name: input.name,
    passwordHash,
  });

  const user: AuthUser = {
    id: doc.id,
    email: doc.email,
    name: doc.name,
    role: doc.role as AuthUser["role"],
  };
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const doc = await UserModel.findOne({ email: input.email }).select("+passwordHash");
  if (!doc) throw HttpError.unauthorized("Invalid credentials");

  const ok = await bcrypt.compare(input.password, doc.passwordHash);
  if (!ok) throw HttpError.unauthorized("Invalid credentials");

  const user: AuthUser = {
    id: doc.id,
    email: doc.email,
    name: doc.name,
    role: doc.role as AuthUser["role"],
  };
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user, token };
}
