import geoip from "geoip-lite";
import { Types } from "mongoose";
import { hashIp, parseUserAgent, type LinkStats } from "@momoflow/lib";
import { AnalyticsModel } from "../models/Analytics";
import { LinkModel } from "../models/Link";
import { logger } from "../config/logger";

export interface RecordClickInput {
  linkId: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Fire-and-forget: never throws back to the redirect path.
 * Increments link counters and inserts an analytics doc.
 */
export function recordClick(input: RecordClickInput): void {
  setImmediate(async () => {
    try {
      const { device, browser, os, bot } = parseUserAgent(input.userAgent);
      const country = geoip.lookup(input.ip)?.country ?? null;
      const ipHash = hashIp(input.ip);

      const linkObjId = new Types.ObjectId(input.linkId);

      // Determine if this is a unique click for this link.
      const isUnique = !(await AnalyticsModel.exists({ linkId: linkObjId, ipHash }));

      await Promise.all([
        AnalyticsModel.create({
          linkId: linkObjId,
          ipHash,
          country,
          device,
          browser,
          os,
          referrer: input.referrer || null,
          bot,
        }),
        LinkModel.updateOne(
          { _id: linkObjId },
          {
            $inc: {
              clicks: 1,
              ...(isUnique ? { uniqueClicks: 1 } : {}),
            },
          }
        ),
      ]);
    } catch (err) {
      logger.warn("Analytics record failed", { err });
    }
  });
}

export async function getLinkStats(linkId: string, days = 30): Promise<LinkStats> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const _id = new Types.ObjectId(linkId);

  const [link, byCountryAgg, byDeviceAgg, byReferrerAgg, byDayAgg, uniqueAgg] =
    await Promise.all([
      LinkModel.findById(_id).lean(),
      AnalyticsModel.aggregate([
        { $match: { linkId: _id, timestamp: { $gte: since } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
      ]),
      AnalyticsModel.aggregate([
        { $match: { linkId: _id, timestamp: { $gte: since } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),
      AnalyticsModel.aggregate([
        { $match: { linkId: _id, timestamp: { $gte: since } } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AnalyticsModel.aggregate([
        { $match: { linkId: _id, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsModel.aggregate([
        { $match: { linkId: _id } },
        { $group: { _id: "$ipHash" } },
        { $count: "unique" },
      ]),
    ]);

  const toMap = (arr: Array<{ _id: string | null; count: number }>) =>
    Object.fromEntries(arr.map((x) => [x._id ?? "unknown", x.count]));

  return {
    totalClicks: link?.clicks ?? 0,
    uniqueClicks: uniqueAgg[0]?.unique ?? 0,
    byCountry: toMap(byCountryAgg),
    byDevice: toMap(byDeviceAgg),
    byReferrer: toMap(byReferrerAgg),
    byDay: byDayAgg.map((d: { _id: string; clicks: number }) => ({
      date: d._id,
      clicks: d.clicks,
    })),
  };
}
