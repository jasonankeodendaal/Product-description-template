
export interface CreatorDetails {
  name:string;
  slogan: string;
  logoSrc: string | null;
  tel: string;
  email: string;
  whatsapp: string;
  whatsapp2?: string;
}

export interface SiteSettings {
  companyName: string;
  slogan: string;
  logoSrc: string | null;
  heroImageSrc: string | null;
  tel: string;
  email: string;
  website: string;
  creator: CreatorDetails;
  customApiEndpoint?: string | null;
  customApiAuthKey?: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: 'Ai tools',
  slogan: 'Ai your friend!',
  logoSrc: 'https://iili.io/KxiiZMb.png',
  heroImageSrc: 'https://iili.io/Kxi4CTg.webp',
  tel: '0695989427',
  email: 'odendaaljason454@gmail.com',
  website: '',
  creator: {
    name: 'JSTYP.me',
    slogan: 'Jason solution to your problems, Yes me!!',
    logoSrc: 'https://iili.io/KxPZTT7.png',
    tel: '0695989427',
    email: 'odendaaljason454@gmail.com',
    whatsapp: 'https://wa.link/nohogl',
    whatsapp2: 'https://wa.link/j3b9yn',
  },
  customApiEndpoint: null,
  customApiAuthKey: null,
};

export const DEFAULT_PRODUCT_DESCRIPTION_PROMPT_TEMPLATE = `
You are an expert copywriter for e-commerce. Your task is to reformat the provided product information into a specific, structured layout. Follow these instructions exactly.

Brand:
(The brand name only. Extract it from the product information.)

SKU:
(Always include the exact model/SKU)

Name:
(Product title including type, wattage/size, and color if relevant. Do not repeat the brand name here.)

Short Description:
(1 full sentence only. Capture the main benefit or use. No bullets. No fragments.)

What’s in the Box:
(Exact contents. List all included parts. If missing, search the web. If still unknown, write “No info.” No bullets.)

Description:
(Full paragraph. Write in professional tone. Do not repeat short description. Highlight uses and design appeal.)

Key Features:
(List the key highlights. Use a new line for each feature. Do not use bullets.)

Material Used:
(State materials like plastic, stainless steel, etc. If missing, search the web. If still unknown, write “No info.”)

Product Dimensions (CM) & Weight (KG):
(Use the format: "Width: [W] cm | Height: [H] cm | Depth: [D] cm | Weight: [WT] kg". If missing, always search the web. If still unknown, write “No info.”)

Buying This Product Means:
(1 full sentence on benefit of ownership. Speak to customer value. No hype or fluff.)

Key Specifications:
(List clear, practical specs. Use a new line for each spec in a "Key: Value" format.)

Terms & Conditions:
(Your top priority is to find the *exact*, official manufacturer's warranty for the specific product model provided (e.g., for "DMF451", search for "Defy DMF451 official warranty"). Do not use generic brand warranties unless you have confirmed that no model-specific information exists. The summary must be a true reflection of the official terms. Extract key details precisely: the exact warranty period (e.g., "3 Year Warranty + 2 Years on Compressor"), what it covers (e.g., "Covers parts and labour for manufacturing defects only"), specific exclusions (e.g., "Excludes commercial use, rust, and cosmetic damage"), and the exact process for claims (e.g., "Requires online registration within 90 days via the official brand website and proof of purchase"). If you cannot find the exact terms for the model after an exhaustive search, state that and provide the general category warranty. If nothing is found, write “No info.”)

---

Here is a perfect example of the desired output format:

Brand:
Defy

SKU:
DMF451

Name:
195Lt Chest Freezer – Satin Metallic

Short Description:
A spacious and energy-efficient chest freezer with multimode operation and a lockable design for secure, reliable frozen storage.

What’s in the Box:
1 x Chest Freezer Unit – Metallic Finish
1 x Storage Basket
1 x User Manual
1 x Power Cord

Description:
The Defy DMF451 Chest Freezer in Metallic Finish delivers 195 liters of net storage capacity with a static cooling system and flexible multimode operation. Energy-efficient, lockable, and elegantly styled, it’s a premium solution for dependable frozen storage, perfect for homes or small businesses.

Key Features:
Multimode freezer compartment for versatile storage
Free-standing installation with stable dome feet
Energy Class A for low electricity usage
Rotational side-wall controller for precise temperature adjustment
Door lock for added safety and security

Material Used:
Steel body with satin metallic finish; durable plastic interior components

Product Dimensions (CM) & Weight (KG):
Width: 72.5 cm | Height: 75.1 cm | Depth: 86 cm | Weight: 32 kg

Buying This Product Means:
You get a reliable, energy-efficient chest freezer that keeps your food fresh longer while offering flexible storage and easy operation.

Key Specifications:
Total Gross Volume: 331 L
Total Net Volume: 195 L
Cooling System: Static
Climate Class: SN-ST
Voltage: 220-240 V | Frequency: 50 Hz
Annual Energy Consumption: 266 kWh/year
Daily Energy Consumption: 0.71 kWh/24h

Terms & Conditions:
Based on the official warranty card for model DMF451, this product is covered by Defy's 3-year standard warranty for parts and labour against manufacturing faults. Additionally, the compressor is covered for an extra 2 years (5 years total). This is a carry-in warranty. To validate, the product must be registered online at the brand's official website within 30 days of purchase. The warranty is void if the product is used for commercial purposes and does not cover cosmetic damage or faults from power surges.

---

⚠️ IMPORTANT: When product information is provided, always use the above layout exactly as shown. Do not change any wording from the original content supplied — only restructure and reformat it to fit this template. Do not add or invent information. For the "What's in the Box", "Material Used", "Product Dimensions & Weight", and "Terms & Conditions" sections, you MUST use web search to find any missing information. If information cannot be found online after searching, write: “No info.” Never omit any section. Always follow this template format strictly.
`;