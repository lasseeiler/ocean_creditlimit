import { z } from 'zod';
import { NextApiRequest } from 'next';

export const apiRequestSchema = z.object({
  customerId: z.string(),
  hash: z.string(),
});

export interface CreditMaxRequest extends NextApiRequest {
  query: z.TypeOf<typeof apiRequestSchema>;
}
