'use client';

import { Button } from '@/components/ui/button';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  if (!products.length) {
    return (
      <section id="pricing">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            No subscription pricing plans found. Create them in your{' '}
            <a
              className="text-purple-500 underline"
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </a>
            .
          </p>
        </div>
      </section>
    );
  } else {
    return (
      <section id="pricing" className="mb-24">
        <div className="max-w-6xl px-4 py-8 pt-0 mx-auto sm:py-24 sm:px-6 lg:px-8 lg:pt-0 flex flex-col items-center">
          <div className="align-center flex flex-col items-center">
            <h1 className="text-4xl text-center font-extrabold dar:text-white sm:text-center sm:text-6xl">
              Pricing Plans
            </h1>

            <p className="text-center max-w-2xl m-auto mt-5 text-xl sm:text-center sm:text-xl text-zinc-700 dark:text-zinc-300">
              Choose the plan that fits you best.
            </p>
            <div className="relative self-center mt-6 justify-center w-fit rounded-lg p-1 flex sm:mt-8 border border-zinc-800">
              {intervals.includes('month') && (
                <Button
                  onClick={() => setBillingInterval('month')}
                  type="button"
                  className={`${
                    billingInterval === 'month'
                      ? 'bg-purple-600 dark:bg-purple-400 hover:bg-purple-500 dark:hover:bg-purple-300'
                      : ''
                  } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8 min-w-[140px] lg:min-w-[170px]`}
                >
                  Monthly billing
                </Button>
              )}
              {intervals.includes('year') && (
                <Button
                  onClick={() => setBillingInterval('year')}
                  type="button"
                  className={`${
                    billingInterval === 'year'
                      ? 'bg-purple-600 dark:bg-purple-400 hover:bg-purple-500 dark:hover:bg-purple-300'
                      : ''
                  } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8 min-w-[140px] lg:min-w-[170px]`}
                >
                  Yearly billing
                </Button>
              )}
            </div>
          </div>
          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 flex flex-col lg:flex-row flex-wrap justify-center gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
            {products.map((product) => {
              const price = product?.prices?.find(
                (price) => price.interval === billingInterval
              );
              if (!price) return null;
              const priceString = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currency!,
                minimumFractionDigits: 0
              }).format((price?.unit_amount || 0) / 100);
              return (
                <div
                  key={product.id}
                  className={cn(
                    'flex flex-col w-screen lg:w-[260px] rounded-lg shadow-sm divide-y border divide-zinc-600 bg-zinc-50 dark:bg-zinc-900',
                    {
                      'border border-purple-500':
                        subscription &&
                        product.name === subscription?.prices?.products?.name
                    },
                    'flex-1', // This makes the flex item grow to fill the space
                    'basis-1/3', // Assuming you want each card to take up roughly a third of the container's width
                    'max-w-xs' // Sets a maximum width to the cards to prevent them from getting too large
                  )}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold leading-6">
                      {product.name}
                    </h2>
                    <p className="mt-4">{product.description}</p>
                    <p className="mt-8">
                      <span className="text-5xl font-extrabold">
                        {priceString}
                      </span>
                      <span className="text-base font-medium">
                        /{billingInterval}
                      </span>
                    </p>
                    <Button
                      type="button"
											variant={'hero'}
                      onClick={() => handleStripeCheckout(price)}
                      className="block w-full py-2 mt-8 font-semibold"
                    >
                      {subscription ? 'Manage' : 'Subscribe'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}
