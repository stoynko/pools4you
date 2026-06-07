import poolsHero from "../../content/facilities/pools/images/hero.png";
import spaHero from "../../content/facilities/spa/images/hero.png";
import saunaHero from "../../content/facilities/saunas/images/hero.png";
import aquaparkHero from "../../content/facilities/aquaparks/images/hero.png";

import residentialPool from "../../content/facilities/pools/images/residential-pool.jpg";
import hotelPool from "../../content/facilities/pools/images/hotel-pool.jpg";
import infinityPool from "../../content/facilities/pools/images/infinity-pool.jpg";
import sportsPool from "../../content/facilities/pools/images/sports-pool.jpg";
import childrenPool from "../../content/facilities/pools/images/children-pool.jpg";
import hydroMassage from "../../content/facilities/pools/images/hydro-massage.jpg";

export const facilityImages = {
  pools: {
    "pool-hero": poolsHero,
    "residential-pool": residentialPool,
    "hotel-pool": hotelPool,
    "infinity-pool": infinityPool,
    "sports-pool": sportsPool,
    "children-pool": childrenPool,
    "hydro-massage": hydroMassage,
  },

  spa: {
    "spa-hero": spaHero,
  },

  saunas: {
    "sauna-hero": saunaHero,
  },

  aquaparks: {
    "aquapark-hero": aquaparkHero,
  },
} as const;

export type FacilityImageGroup = keyof typeof facilityImages;

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