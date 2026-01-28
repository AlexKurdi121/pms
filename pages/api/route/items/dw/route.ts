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
  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const userToken = auth(req);
  if (!userToken) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: "Item not found" });
    return res.json(item);
  }

  if (req.method === "PUT") {
    const canEdit = await roleCheck(userToken.id, ["superadmin", "pharmaciet"]);
    if (!canEdit) return res.status(403).json({ error: "Forbidden" });

    const { name, stock } = req.body;
    const currentItem = await prisma.item.findUnique({ where: { id } });
    if (!currentItem) return res.status(404).json({ error: "Item not found" });

    const data: any = {
      name: name ?? currentItem.name,
      stock: stock ?? currentItem.stock,
      priceBuy: currentItem.priceBuy,
      priceSell: currentItem.priceSell,
      expireDate: currentItem.expireDate,
      barcode: currentItem.barcode,
    };

    try {
      const updated = await prisma.item.update({ where: { id }, data });
      return res.json({ message: "Item updated", item: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    const canDelete = await roleCheck(userToken.id, ["superadmin", "pharmaciet"]);
    if (!canDelete) return res.status(403).json({ error: "Forbidden" });

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    try {
      await prisma.item.delete({ where: { id } });
      return res.json({ message: "Item deleted" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
