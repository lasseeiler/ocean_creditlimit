import { z } from 'zod';

export const OrderSchema = z.object({
  financial_status: z.string(),
  total_outstanding: z.coerce.number(),
});

export type Order = z.infer<typeof OrderSchema>;