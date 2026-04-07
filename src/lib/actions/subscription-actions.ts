"use server";

import type { Subscription } from "@/types/law";

// In-memory mock store (실제로는 DB 사용)
const mockSubscriptions: Subscription[] = [];

export async function createSubscription(
  email: string,
  lawIds: string[],
  alertDays: number[] = [90, 60, 30, 7],
): Promise<Subscription> {
  const sub: Subscription = {
    id: `sub-${Date.now()}`,
    email,
    lawIds,
    alertDays,
    active: true,
    createdAt: new Date().toISOString(),
  };
  mockSubscriptions.push(sub);
  return sub;
}

export async function getSubscriptions(
  email: string,
): Promise<Subscription[]> {
  return mockSubscriptions.filter((s) => s.email === email);
}

export async function deleteSubscription(id: string): Promise<boolean> {
  const idx = mockSubscriptions.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  mockSubscriptions.splice(idx, 1);
  return true;
}
