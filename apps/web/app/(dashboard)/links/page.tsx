"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Chip,
  addToast,
} from "@heroui/react";
import { CopyButton, EmptyState, PageHeader } from "@momoflow/ui";
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
      addToast({ title: "Link deleted", color: "success" });
      mutate(key);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Delete failed";
      addToast({ title: "Delete failed", description: message, color: "danger" });
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Links"
        description="Manage your shortened URLs."
        actions={
          <Button as={Link} href="/links/new" color="primary">
            + New link
          </Button>
        }
      />

      <Input
        placeholder="Search by code, URL, or title…"
        value={search}
        onValueChange={setSearch}
        size="sm"
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
            <Button as={Link} href="/links/new" color="primary" size="sm">
              Create link
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-default-200 bg-content1">
          <Table removeWrapper aria-label="Links">
            <TableHeader>
              <TableColumn>SHORT URL</TableColumn>
              <TableColumn>TARGET</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CLICKS</TableColumn>
              <TableColumn align="end">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {data.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link
                      href={`/links/${row.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.shortUrl}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-default-500">
                    {row.title || row.targetUrl}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={row.enabled ? "success" : "default"}
                      variant="flat"
                    >
                      {row.enabled ? "Active" : "Disabled"}
                    </Chip>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.clicks}{" "}
                    <span className="text-default-400">/ {row.uniqueClicks}u</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <CopyButton value={row.shortUrl} />
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handleDelete(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
