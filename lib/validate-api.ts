import crypto from 'crypto';
import { NextApiResponse } from 'next';

import {
  apiRequestSchema,
  CreditMaxRequest,
} from '@/types/ApiRequest';

const checkMethod = (req: CreditMaxRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return false;
  }

  return true;
}

const checkParams = (req: CreditMaxRequest, res: NextApiResponse) => {
  const reqQuery = apiRequestSchema.safeParse(req.query);

  if ( !reqQuery.success ) {
    res.status(400).send({ message: reqQuery.error.message });
    return false;
  }

  return { id: reqQuery.data.customerId, hash: reqQuery.data.hash };
}

const validateCustomer = (
  { id, hash }: { id: string, hash: string },
  res: NextApiResponse
) => {
  const customerHash = crypto.createHmac('sha256', process.env.HMAC_SHA256_KEY as string)
    .update(id as string)
    .digest('hex');

  if (customerHash !== hash) {
    res.status(401).send({ message: 'Unauthorized' });
    return false;
  }

  return true;
}

export default (req: CreditMaxRequest, res: NextApiResponse) => {
  const methodIsValid = checkMethod(req, res);
  const validQuery = checkParams(req, res);
  let customerIsValid = false;

  if (validQuery) {
    customerIsValid = validateCustomer(validQuery, res);
  }

  if (methodIsValid && validQuery && customerIsValid) {
    return validQuery.id;
  } else {
    return false;
  }
}
