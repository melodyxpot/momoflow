import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const geoRule = new Schema(
  { country: { type: String, required: true }, url: { type: String, required: true } },
  { _id: false }
);

const deviceRule = new Schema(
  {
    device: { type: String, enum: ["mobile", "tablet", "desktop"], required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const abVariant = new Schema(
  {
    url: { type: String, required: true },
    weight: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false }
);

const rulesSchema = new Schema(
  {
    geo: { type: [geoRule], default: undefined },
    device: { type: [deviceRule], default: undefined },
    ab: { type: [abVariant], default: undefined },
    password: { type: String, default: undefined }, // bcrypt hash
  },
  { _id: false }
);

const linkSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, trim: true },
    targetUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clicks: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null, index: true },
    enabled: { type: Boolean, default: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    rules: { type: rulesSchema, default: undefined },
  },
  { timestamps: true }
);

linkSchema.index({ userId: 1, createdAt: -1 });

export type LinkDoc = HydratedDocument<InferSchemaType<typeof linkSchema>>;
export const LinkModel = model("Link", linkSchema);
