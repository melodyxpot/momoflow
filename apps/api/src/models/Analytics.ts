import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const analyticsSchema = new Schema(
  {
    linkId: { type: Schema.Types.ObjectId, ref: "Link", required: true, index: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
    ipHash: { type: String, required: true, index: true },
    country: { type: String, default: null },
    device: { type: String, enum: ["mobile", "tablet", "desktop"], default: null },
    browser: { type: String, default: null },
    os: { type: String, default: null },
    referrer: { type: String, default: null },
    bot: { type: Boolean, default: false, index: true },
  },
  { versionKey: false }
);

analyticsSchema.index({ linkId: 1, timestamp: -1 });
analyticsSchema.index({ linkId: 1, ipHash: 1 });

export type AnalyticsDoc = HydratedDocument<InferSchemaType<typeof analyticsSchema>>;
export const AnalyticsModel = model("Analytics", analyticsSchema);
