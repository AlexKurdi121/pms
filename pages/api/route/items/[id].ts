// pages/api/route/items/[id]/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function auth(req: NextApiRequest) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    return null;
  }
}

async function roleCheck(userId: number, allowedRoles: string[]) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user && allowedRoles.includes(user.role);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const id = parseInt(query.id as string);

  const userToken = auth(req);
  if (!userToken) return res.status(401).json({ error: "Unauthorized" });

  // ---------------- GET SINGLE ITEM ----------------
  if (method === "GET") {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: "Item not found" });
    return res.json(item);
  }

  // ---------------- UPDATE ITEM ----------------
  if (method === "PUT") {
    const canEdit = await roleCheck(userToken.id, ["superadmin", "pharmaciet"]);
    if (!canEdit) return res.status(403).json({ error: "Forbidden" });

    const { name, stock } = body;
    const data: any = {};

    if (name !== undefined) data.name = name;
    if (stock !== undefined) data.stock = Number(stock);

    // Fill required fields with current values to avoid Prisma errors
    const currentItem = await prisma.item.findUnique({ where: { id } });
    if (!currentItem) return res.status(404).json({ error: "Item not found" });

    if (currentItem.priceBuy !== undefined) data.priceBuy = currentItem.priceBuy;
    if (currentItem.priceSell !== undefined) data.priceSell = currentItem.priceSell;
    if (currentItem.expireDate !== undefined) data.expireDate = currentItem.expireDate;
    if (currentItem.barcode !== undefined) data.barcode = currentItem.barcode;

    try {
      const updated = await prisma.item.update({ where: { id }, data });
      return res.json({ message: "Item updated", item: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------------- DELETE ITEM ----------------
  if (method === "DELETE") {
    const canDelete = await roleCheck(userToken.id, ["superadmin", "pharmaciet"]);
    if (!canDelete) return res.status(403).json({ error: "Forbidden" });

    try {
      await prisma.item.delete({ where: { id } });
      return res.json({ message: "Item deleted" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
