import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);
export const img = (src, w = 800) => builder.image(src).width(w).auto('format').url();

// Discontinued items never reach the site
export const JERSEYS_QUERY = `*[_type == "jersey" && status != "discontinued"] | order(_createdAt desc) {
  _id, name, club, season, type, version, price, sizes, description, status, images, _createdAt
}`;
