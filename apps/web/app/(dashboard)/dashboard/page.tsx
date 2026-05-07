"use client";

import useSWR from "swr";
import Link from "next/link";
import { Button, Spinner } from "@heroui/react";
import { PageHeader, StatCard, EmptyState } from "@momoflow/ui";
import { fetcher } from "@/lib/swr";
import { SHORT_DOMAIN } from "@/lib/api";

interface OverviewData {
  totalLinks: number;
  totalClicks: number;
  totalUnique: number;
  topLinks: Array<{
    _id: string;
    code: string;
    targetUrl: string;
    clicks: number;
    uniqueClicks: number;
    title?: string;
  }>;
}

export default function OverviewPage() {
  const { data, isLoading } = useSWR<OverviewData>("/api/stats", fetcher);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <PageHeader
        title="Overview"
        description="Your shortlinks at a glance."
        actions={
          <Button as={Link} href="/links/new" color="primary">
            + Create link
          </Button>
        }
      />

      {isLoading || !data ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total links" value={data.totalLinks} />
            <StatCard label="Total clicks" value={data.totalClicks} />
            <StatCard label="Unique clicks" value={data.totalUnique} />
          </div>

          <section className="rounded-2xl border border-default-200 bg-content1 p-6">
            <h2 className="mb-4 text-lg font-semibold">Top performing links</h2>
            {data.topLinks.length === 0 ? (
              <EmptyState
                title="No clicks yet"
                description="Create a link and share it to start tracking activity."
                action={
                  <Button as={Link} href="/links/new" color="primary" size="sm">
                    Create your first link
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-default-200">
                {data.topLinks.map((l) => (
                  <li
                    key={l._id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/links/${l._id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {SHORT_DOMAIN}/{l.code}
                      </Link>
                      <p className="truncate text-default-500">
                        {l.title || l.targetUrl}
                      </p>
                    </div>
                    <div className="ml-6 flex flex-shrink-0 gap-6 tabular-nums">
                      <span title="Clicks">{l.clicks} clicks</span>
                      <span className="text-default-400" title="Unique clicks">
                        {l.uniqueClicks} unique
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
