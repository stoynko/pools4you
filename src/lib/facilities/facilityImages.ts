import poolsHero from "../../content/facilities/pools/images/hero.png";
import privatePool from "../../content/facilities/pools/images/private-pool.png";
import hotelPool from "../../content/facilities/pools/images/hotel-pool.png";
import infinityPool from "../../content/facilities/pools/images/infinity-pool.png";
import sportsPool from "../../content/facilities/pools/images/sports-pool.png";
import childrenPool from "../../content/facilities/pools/images/children-pool.png";
import jacuzzi from "../../content/facilities/pools/images/jacuzzi.png";

export const facilityImages = {
  pools: {
    hero: poolsHero,
    "private-pool": privatePool,
    "hotel-pool": hotelPool,
    "infinity-pool": infinityPool,
    "sports-pool": sportsPool,
    "children-pool": childrenPool,
    jacuzzi,
  },
} as const;

export type FacilityImageGroup = keyof typeof facilityImages;
export type FacilityImageKey<T extends FacilityImageGroup> =
  keyof (typeof facilityImages)[T];

export function getFacilityImage(
  group: string,
  imageKey: string | undefined,
) {
  if (!imageKey) {
    return undefined;
  }

  const images = facilityImages[group as FacilityImageGroup];

  if (!images) {
    return undefined;
  }

  return images[imageKey as keyof typeof images];
}