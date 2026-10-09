import { client, JERSEYS_QUERY } from '../../lib/sanity';
import Catalog from './Catalog';

export const metadata = { title: 'Catalog | WishXI' };

export default async function CatalogPage() {
  // Re-fetches from Sanity at most every 2 minutes, no redeploy needed
  const jerseys = await client.fetch(JERSEYS_QUERY, {}, { next: { revalidate: 120 } });
  return <Catalog jerseys={jerseys} />;
}
