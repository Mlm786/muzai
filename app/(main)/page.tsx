import Pricing from '@/components/pricing';
import Faq from '@/components/faq';
import Features from '@/components/features';
import Hero from '@/components/hero';
import { createClient } from '@/utils/supabase/server';

export default async function PricingPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.log(error);
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return (
    <div className="flex flex-col items-center">
      <Hero />
      <Features />
      <Pricing
        user={user}
        products={products ?? []}
        subscription={subscription}
      />
      <Faq />
    </div>
  );
}
