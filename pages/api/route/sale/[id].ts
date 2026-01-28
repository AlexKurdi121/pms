import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function auth(req: NextApiRequest) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET!) as any; } 
  catch { return null; }
}

async function roleCheck(userId: number, roles: string[]) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user && roles.includes(user.role);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const id = parseInt(query.id as string);

  const userToken = auth(req);
  if (!userToken || !(await roleCheck(userToken.id, ["pharmaciet"])))
    return res.status(403).json({ error: "Forbidden" });

  if (method === "GET") {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { saleItems: { include: { item: true } } },
    });
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    return res.json(sale);
  }

  res.status(405).json({ error: "Method not allowed" });
}
