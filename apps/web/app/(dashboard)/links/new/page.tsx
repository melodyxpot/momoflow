"use client";

import {
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  addToast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CopyButton, PageHeader, QRCodeBlock } from "@momoflow/ui";
import { ApiError, api } from "@/lib/api";

interface CreateResponse {
  id: string;
  code: string;
  shortUrl: string;
  targetUrl: string;
}

export default function NewLinkPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreateResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const out = await api.post<CreateResponse>("/api/links", {
        targetUrl: targetUrl.trim(),
        customCode: customCode.trim() || undefined,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setCreated(out);
      addToast({ title: "Short link created!", color: "success" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create";
      addToast({ title: "Could not create link", description: message, color: "danger" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Create link"
        description="Shorten a long URL and customize how it routes."
      />

      {created ? (
        <Card>
          <CardBody className="gap-4">
            <p className="text-sm text-default-500">Your short link is ready 🎉</p>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-default-100 px-4 py-3">
              <code className="truncate text-lg font-medium">{created.shortUrl}</code>
              <CopyButton value={created.shortUrl} size="md" />
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <QRCodeBlock value={created.shortUrl} />
              <div className="flex flex-1 flex-col gap-2">
                <Button
                  color="primary"
                  onPress={() => router.push(`/links/${created.id}`)}
                >
                  View analytics
                </Button>
                <Button
                  variant="flat"
                  onPress={() => {
                    setCreated(null);
                    setTargetUrl("");
                    setCustomCode("");
                    setTitle("");
                    setDescription("");
                    setExpiresAt("");
                  }}
                >
                  Create another
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="url"
                label="Destination URL"
                placeholder="https://example.com/very/long/path"
                value={targetUrl}
                onValueChange={setTargetUrl}
                isRequired
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Custom alias (optional)"
                  placeholder="my-promo"
                  value={customCode}
                  onValueChange={setCustomCode}
                />
                <Input
                  type="datetime-local"
                  label="Expires at (optional)"
                  value={expiresAt}
                  onValueChange={setExpiresAt}
                />
              </div>
              <Input
                label="Title (optional)"
                placeholder="Internal name for this link"
                value={title}
                onValueChange={setTitle}
              />
              <Textarea
                label="Description (optional)"
                value={description}
                onValueChange={setDescription}
                minRows={2}
              />
              <Button type="submit" color="primary" isLoading={loading}>
                Shorten URL
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
