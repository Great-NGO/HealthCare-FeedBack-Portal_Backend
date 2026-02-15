import { prisma } from "../config/prisma.js";

/**
 * Returns recognized NGOs for the reporter organization dropdown, ordered by sort_order.
 */
export const ngoService = {
  async list(): Promise<{ name: string }[]> {
    const rows = await prisma.recognizedNgo.findMany({
      select: { name: true },
      orderBy: { sort_order: "asc" },
    });
    return rows;
  },
};
