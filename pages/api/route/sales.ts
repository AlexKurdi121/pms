import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === "POST") {
    const { items } = req.body; // [{ itemId, quantity, price }]
    let total = 0;
    items.forEach((i: any) => total += i.quantity * i.price);

    const sale = await prisma.sale.create({
      data: { total, saleItems: { create: items.map((i: any) => ({ itemId: i.itemId, quantity: i.quantity, price: i.price })) } },
      include: { saleItems: true },
    });

    for (const i of items) {
      await prisma.item.update({ where: { id: i.itemId }, data: { stock: { decrement: i.quantity } } });
    }

    return res.json({ message: "Sale completed", sale });
  }

  if (method === "GET") {
    const sales = await prisma.sale.findMany({ orderBy: { createdAt: "desc" }, include: { saleItems: true } });
    return res.json(sales);
  }

  res.status(405).json({ error: "Method not allowed" });
}
