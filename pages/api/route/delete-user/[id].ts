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
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const userToken = auth(req);
  if (!userToken || !(await roleCheck(userToken.id, ["superadmin"])))
    return res.status(403).json({ error: "Forbidden" });

  const id = parseInt(req.query.id as string);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.role === "superadmin") return res.status(400).json({ error: "Cannot delete superadmin" });

  await prisma.user.delete({ where: { id } });
  return res.json({ message: "User deleted" });
}
