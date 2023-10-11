import { NextApiResponse } from 'next';
import { z } from 'zod';
import validation from "@/lib/validate-api";
import { CreditMaxRequest } from '@/types/ApiRequest';

import {
  Metafield,
  MetafieldSchema,
  CreditLimitMetafieldSchema,
} from '@/types/Metafield';

import {
  Order,
  OrderSchema,
} from '@/types/Order';

export default async (req: CreditMaxRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const customerId = validation(req, res);

  if (customerId) {
    const uri = `https://${ process.env.SHOPIFY_DOMAIN }/admin/api/${ process.env.SHOPIFY_API_VERSION }`;

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
      } as HeadersInit,
    };

    try {
      const [requestOrders, requestCustomer] = await Promise.all([
        fetch(`${ uri }/customers/${ customerId }/orders.json?fields=financial_status,total_outstanding`, requestOptions),
        fetch(`${ uri }/metafields.json?metafield[owner_id]=${ customerId }&metafield[owner_resource]=customer`, requestOptions),
      ]);

      const { orders: ordersJson }: { orders: Order[] } = await requestOrders.json();
      const { metafields: metafieldsJson }: { metafields: Metafield[] } = await requestCustomer.json();

      const orders = z.array(OrderSchema).parse(ordersJson);
      const metafields = z.array(MetafieldSchema).parse(metafieldsJson);

      const pendingOrders = orders.filter((order) => order.financial_status === 'pending');
      const totalOutstanding = pendingOrders.reduce((acc, order) => acc + Number(order.total_outstanding), 0);

      const creditLimitMetafields = metafields.find((metafield) => metafield.key === 'creditLimit');
      const creditLimit = CreditLimitMetafieldSchema.parse(creditLimitMetafields).value;

      res.send({
        creditLimit: creditLimit || 0,
        totalOutstanding: totalOutstanding || 0,
      });
    } catch (error) {
      res.status(502).send(error);
    }
  }
}
