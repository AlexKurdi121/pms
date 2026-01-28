import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "GET") {
    const items = await prisma.item.findMany();
    const today = new Date();
    const itemsWithStatus = items.map(i => ({ ...i, status: i.expireDate < today ? "Expired" : "Valid" }));
    return res.json(itemsWithStatus);
  }

  if (method === "POST") {
    const { name, description, priceBuy, priceSell, stock, expireDate, barcode } = req.body;
    const item = await prisma.item.create({
      data: { name, description, priceBuy, priceSell, stock, expireDate: new Date(expireDate), barcode },
    });
    return res.json({ message: "Item added", item });
  }

  if (method === "PUT") {
    const { id, name, description, priceBuy, priceSell, stock, expireDate } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (priceBuy) data.priceBuy = priceBuy;
    if (priceSell) data.priceSell = priceSell;
    if (stock !== undefined) data.stock = stock;
    if (expireDate) data.expireDate = new Date(expireDate);

    const updated = await prisma.item.update({ where: { id }, data });
    return res.json({ message: "Item updated", item: updated });
  }

  if (method === "DELETE") {
    const { id } = req.body;
    await prisma.item.delete({ where: { id } });
    return res.json({ message: "Item deleted" });
  }

  res.status(405).json({ error: "Method not allowed" });
}
