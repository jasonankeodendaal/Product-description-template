

export const CAMERA_FEATURES_LIST = `AI photo enhancement – automatic editing, color correction, and sharpening.
Periscope telephoto zoom – ultra-long zoom without losing quality.
High-resolution sensors (200MP+) – super detailed photos.
Advanced night vision mode – brighter, clearer low-light shots.
Cinematic video (4K/8K with stabilization) – pro-level video recording.
HDR+ and Dolby Vision – vivid colors and balanced lighting.
Ultra-wide + macro combo – wide landscapes and close-ups in one device.
AI portrait & bokeh control – adjustable background blur and lighting.
Super slow-motion & hyperlapse – advanced creative video effects.
Seamless AR & 3D capture – ready for AR apps, 3D scanning, and effects.`;

export const GITHUB_APK_URL = 'https://github.com/jasonankeodendaal/Product-description-template/raw/main/release/app-release.apk';

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
  backgroundImageSrc?: string | null;
  tel: string;
  email: string;
  website: string;
  creator: CreatorDetails;
  customApiEndpoint?: string | null;
  customApiAuthKey?: string | null;
  syncMode?: 'local' | 'folder' | 'api' | 'ftp';
  userPin?: string;
  pinIsSet?: boolean;
  onboardingCompleted?: boolean;
  userName?: string;
  // FTP Settings
  ftpHost?: string;
  ftpPort?: number;
  ftpUser?: string;
  ftpPassword?: string;
  ftpPath?: string;
  ftpProtocol?: 'ftp' | 'sftp';
}

export const CREATOR_PIN = '1723j';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: 'JSTYP.me Ai tools',
  slogan: "Jason's solution to your problems, Yes me!!",
  logoSrc: '/logo.png',
  heroImageSrc: 'https://i.postimg.cc/prM05S7g/bc0e611c-f980-4f3d-b723-a06f0bb547a2.jpg',
  backgroundImageSrc: '/background.jpg',
  tel: '0695989427',
  email: 'odendaaljason454@gmail.com',
  website: '',
  creator: {
    name: 'JSTYP.me',
    slogan: "Jason's solution to your problems, Yes me!!",
    logoSrc: 'https://i.ibb.co/RkrJ44HK/Whats-App-Image-2025-06-25-at-15-31-54-removebg-preview.png',
    tel: '0695989427',
    email: 'odendaaljason454@gmail.com',
    whatsapp: 'https://wa.link/nohogl',
    whatsapp2: 'https://wa.link/j3b9yn',
  },
  customApiEndpoint: null,
  customApiAuthKey: null,
  syncMode: 'local',
  userPin: '',
  pinIsSet: false,
  onboardingCompleted: false,
  userName: 'User',
  // FTP Defaults
  ftpHost: '',
  ftpPort: 21,
  ftpUser: '',
  ftpPassword: '',
  ftpPath: '/',
  ftpProtocol: 'ftp',
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
The Defy DMF451 Chest Freezer offers 195 litres of storage in a sleek satin metallic finish. Its multimode function allows you to switch between freezer, chiller, or fridge modes to suit your needs, while the A-rated energy efficiency helps save on electricity costs. The durable aluminium interior and lockable lid make it a practical and secure choice for any home.
`;