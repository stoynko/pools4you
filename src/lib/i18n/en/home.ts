export const home = {
  hero: {
    title: "Premium Pools",
    subtitle: "Designed with precision. Built with elegance.",
    ctaPrimary: "Request a Quote",
    ctaSecondary: "View Projects",
  },

  vision: {
    title: "Your Vision, Your Way",
    introMain:
      "At Pools 4 You, we believe water is more than a feature, it’s an experience. It shapes environments, defines spaces, and elevates how people relax. Backed by years of hands-on experience across diverse residential, hospitality, and commercial projects, we bring proven insight to every stage of delivery. ",
    introSecondary:
      "From concept to completion, we design and execute aquatic solutions that combine engineering precision with lasting beauty. Because every project is personal, we tailor every detail according to your vision. ",
    accents: [
      {
        id: "experience",
        title: "Experience",
        body: "Years of practical expertise in pool planning, construction, renovation, and technical execution.",
      },
      {
        id: "efficiency",
        title: "Efficiency",
        body: "Clear project organization, realistic scheduling, and coordinated execution without unnecessary delays.",
      },
      {
        id: "value",
        title: "Value",
        body: "Smart design and technical decisions aligned with your budget and long-term quality.",
      },
    ],
  },

  services: {
    title: "Services",
    intro:
      "From concept and design to construction, maintenance and operations",
    ctaLabel: "See all services",
    items: [
      {
        id: "concept-design",
        title: "Concept and design",
        alt: "Architectural planning for pool",
      },
      {
        id: "construction",
        title: "Construction",
        alt: "Engineer overlooking pool project",
      },
      {
        id: "operations-maintenance",
        title: "Technical maintenance",
        alt: "Technical equipment for pools",
      },
      {
        id: "renovation-modernization",
        title: "Renovation & modernization",
        alt: "Renovation of a pool",
      },
    ],
  },

  featuredProjects: {
    title: "Featured Projects",
    ctaLabel: "See all projects",
    projectCtaLabel: "View project",
  },

  cta: {
    title: "Ready to dive in?",
    body: "Your vision of the perfect sanctuary is just one conversation away. Let us bring light and water to your legacy.",
    primaryLabel: "Request consultation",
    emailSubject: "Consultation request",
  },
} as const;
