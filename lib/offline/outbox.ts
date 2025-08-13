import { db, OutboxItem } from "./db";

export async function enqueue(op: OutboxItem["op"], payload: any) {
  await db.outbox.add({
    op,
    payload,
    createdAt: Date.now(),
    tries: 0,
  });
}
