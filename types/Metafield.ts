import { z } from 'zod';

export const MetafieldSchema = z.object({
  created_at: z.string(),
  description: z.coerce.string(),
  id: z.number(),
  key: z.string(),
  namespace: z.string(),
  owner_id: z.number(),
  owner_resource: z.string(),
  updated_at: z.string(),
  value: z.any(),
  type: z.string(),
});

export const CreditLimitMetafieldSchema = MetafieldSchema.extend({
  value: z.number(),
});

export type Metafield = z.infer<typeof MetafieldSchema>;
export type CreditLimitMetafield = z.infer<typeof CreditLimitMetafieldSchema>;
