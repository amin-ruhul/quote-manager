import { DEFAULT_INDUSTRY } from "@/lib/constants";

/*
 * The one industry_config row for V1 (SPEC §8, §10). Everything trade-specific
 * lives here so the quote engine itself stays generic.
 *
 * Prices are integer cents and are only a starting point — every new account
 * copies these into its own pricebook and edits them.
 */

export type DefaultPricebookItem = {
  name: string;
  description: string;
  category: string;
  unit: "each" | "hour" | "ft" | "job";
  price: number;
};

export const ELECTRICIAN_CATEGORIES = [
  "Service & Panels",
  "EV Charging",
  "Lighting",
  "Outlets & Switches",
  "Safety & Compliance",
  "Labor & Fees",
] as const;

export const ELECTRICIAN_PRICEBOOK: DefaultPricebookItem[] = [
  {
    name: "Panel Replacement (200A)",
    description:
      "Replace existing service panel with a new 200A panel, including breakers and labeling.",
    category: "Service & Panels",
    unit: "job",
    price: 285000,
  },
  {
    name: "Panel Replacement (100A)",
    description: "Replace existing service panel with a new 100A panel.",
    category: "Service & Panels",
    unit: "job",
    price: 195000,
  },
  {
    name: "Sub-panel Installation",
    description: "Install a sub-panel with feeder run up to 40 ft.",
    category: "Service & Panels",
    unit: "job",
    price: 125000,
  },
  {
    name: "EV Charger Install (Level 2)",
    description:
      "Install a customer-supplied Level 2 charger on a dedicated 240V circuit, up to 25 ft from the panel.",
    category: "EV Charging",
    unit: "job",
    price: 95000,
  },
  {
    name: "240V Outlet for EV",
    description: "Install a NEMA 14-50 outlet on a dedicated circuit.",
    category: "EV Charging",
    unit: "each",
    price: 65000,
  },
  {
    name: "Recessed Light",
    description:
      "Supply and install one LED recessed light in an existing ceiling.",
    category: "Lighting",
    unit: "each",
    price: 18500,
  },
  {
    name: "Ceiling Fan Installation",
    description:
      "Install a customer-supplied ceiling fan on an existing, fan-rated box.",
    category: "Lighting",
    unit: "each",
    price: 22500,
  },
  {
    name: "Light Fixture Replacement",
    description:
      "Remove an existing fixture and install a customer-supplied replacement.",
    category: "Lighting",
    unit: "each",
    price: 12500,
  },
  {
    name: "Standard Outlet",
    description: "Install one new 15A outlet on an existing circuit.",
    category: "Outlets & Switches",
    unit: "each",
    price: 15500,
  },
  {
    name: "GFCI Outlet",
    description: "Supply and install one GFCI-protected outlet.",
    category: "Outlets & Switches",
    unit: "each",
    price: 19500,
  },
  {
    name: "Dimmer Switch",
    description: "Supply and install one dimmer switch.",
    category: "Outlets & Switches",
    unit: "each",
    price: 13500,
  },
  {
    name: "Whole-home Surge Protector",
    description: "Install a panel-mounted whole-home surge protection device.",
    category: "Safety & Compliance",
    unit: "each",
    price: 55000,
  },
  {
    name: "Grounding System Upgrade",
    description:
      "Install ground rods and bonding to bring the service up to current code.",
    category: "Safety & Compliance",
    unit: "job",
    price: 68000,
  },
  {
    name: "Smoke / CO Detector",
    description:
      "Supply and install one hardwired combination smoke and CO detector.",
    category: "Safety & Compliance",
    unit: "each",
    price: 16500,
  },
  {
    name: "Standard Labor",
    description: "Hourly electrical labor.",
    category: "Labor & Fees",
    unit: "hour",
    price: 12500,
  },
  {
    name: "Service Call / Diagnostic",
    description: "Trip charge and diagnosis of the reported issue.",
    category: "Labor & Fees",
    unit: "job",
    price: 15000,
  },
  {
    name: "Permit Fee",
    description: "Municipal electrical permit. Cost varies by jurisdiction.",
    category: "Labor & Fees",
    unit: "job",
    price: 25000,
  },
];

/** Appended to the AI system prompt for this trade (SPEC §9). */
export const ELECTRICIAN_AI_INSTRUCTIONS = `You are estimating residential electrical work in the United States.

Common jobs: panel replacements and upgrades, sub-panels, EV charger circuits,
recessed and fixture lighting, outlets and switches, GFCI protection, surge
protection, grounding upgrades, and smoke/CO detectors.

When a description implies work the customer did not mention, add it to
suggested_additions rather than to line_items. Typical examples:
- Panel or service work usually requires a permit and an inspection.
- Adding a circuit may require a dedicated breaker and a home-run cable.
- Older homes may need grounding or bonding brought up to code.
- Fixture work may need a fan-rated or load-rated box.

Quantities matter: "six recessed lights in the kitchen" is quantity 6 of a
recessed light item, not one lighting job.`;

export const ELECTRICIAN_DEFAULT_TERMS = `This quote is valid for 30 days from the date issued.

Payment is due on completion unless agreed otherwise in writing. A deposit may
be required for jobs requiring ordered materials.

Prices assume normal working conditions and reasonable access to the work area.
Concealed conditions found after work begins — such as damaged or undersized
existing wiring, or code violations from previous work — may require a change
order before the work continues.

All work is performed to the current National Electrical Code and local
amendments. Permits and inspection fees are the customer's responsibility
unless listed as a line item above.

Workmanship is warranted for 12 months. Manufacturer warranties apply to
supplied parts and fixtures.`;

/** Customer-facing wording, so the trade's voice isn't hardcoded in components. */
export const ELECTRICIAN_QUOTE_WORDING = {
  quoteNoun: "quote",
  scopeHeading: "Scope of work",
  termsHeading: "Terms & warranty",
  acceptLabel: "Accept this quote",
  acceptedMessage: "Thanks — your electrician has been notified.",
} as const;

export const ELECTRICIAN_INDUSTRY_CONFIG = {
  industry: DEFAULT_INDUSTRY,
  categories: ELECTRICIAN_CATEGORIES,
  defaultPricebook: ELECTRICIAN_PRICEBOOK,
  aiInstructions: ELECTRICIAN_AI_INSTRUCTIONS,
  defaultTerms: ELECTRICIAN_DEFAULT_TERMS,
  quoteWording: ELECTRICIAN_QUOTE_WORDING,
};
