"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Input,
  Spinner,
  Chip,
  Table,
} from "@heroui/react";
import { CopyButton, EmptyState, PageHeader } from "@momolinks/ui";
import { ApiError, api } from "@/lib/api";
import { fetcher } from "@/lib/swr";

interface LinkRow {
  id: string;
  code: string;
  shortUrl: string;
  targetUrl: string;
  clicks: number;
  uniqueClicks: number;
  enabled: boolean;
  title?: string;
  createdAt: string;
}

interface LinksResponse {
  items: LinkRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function LinksPage() {
  const [search, setSearch] = useState("");
  const key = `/api/links?search=${encodeURIComponent(search)}&limit=50`;
  const { data, isLoading } = useSWR<LinksResponse>(key, fetcher);

  async function handleDelete(id: string) {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    try {
      await api.del(`/api/links/${id}`);
      console.log("Link deleted");
      mutate(key);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Delete failed";
      console.error("Delete failed:", message);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Links"
        description="Manage your shortened URLs."
        actions={
          <Link href="/links/new">
            <Button variant="primary">
              + New link
            </Button>
          </Link>
        }
      />

      <Input
        placeholder="Search by code, URL, or title…"
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
        className="max-w-md"
      />

      {isLoading || !data ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No links yet"
          description="Create your first short link to get started."
          action={
            <Link href="/links/new">
              <Button variant="primary" size="sm">
                Create link
              </Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Links">
              <Table.Header>
                <Table.Column>SHORT URL</Table.Column>
                <Table.Column>TARGET</Table.Column>
                <Table.Column>STATUS</Table.Column>
                <Table.Column>CLICKS</Table.Column>
                <Table.Column>ACTIONS</Table.Column>
              </Table.Header>
              <Table.Body>
                {data.items.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell>
                      <Link
                        href={`/links/${row.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.shortUrl}
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="max-w-[280px] truncate text-default-500">
                      {row.title || row.targetUrl}
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        size="sm"
                        color={row.enabled ? "success" : "default"}
                        variant="tertiary"
                      >
                        {row.enabled ? "Active" : "Disabled"}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="tabular-nums">
                      {row.clicks}{" "}
                      <span className="text-default-400">/ {row.uniqueClicks}u</span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CopyButton value={row.shortUrl} />
                        <Button
                          size="sm"
                          variant="danger-soft"
                          onPress={() => handleDelete(row.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}
