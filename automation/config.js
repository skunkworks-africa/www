window.SKUNKWORKS_WORKFLOW_CONFIG = {
  version: 1,
  currency: "ZAR",
  vatRate: 0.15,
  defaultMinMargin: 18,
  tiers: {
    A: {
      label: "Tier A — publish broadly",
      description: "Standardised products with confirmed stock, clean catalogue data and enough margin for broad distribution."
    },
    B: {
      label: "Tier B — controlled channels",
      description: "Refurbished, low-stock or promotional products requiring tighter channel and profitability controls."
    },
    C: {
      label: "Tier C — sales-assisted",
      description: "Licensing, servers, enterprise solutions, projects and complex offers that require qualification or quotation."
    }
  },
  channels: [
    { id:"shopify", name:"Shopify / Skunkworks Store", role:"Commerce source of truth", tiers:["A","B","C"], core:true },
    { id:"google-merchant", name:"Google Merchant Center", role:"Product feed & free listings", tiers:["A","B"], core:true },
    { id:"google-shopping", name:"Google Shopping / Performance Max", role:"Paid product acquisition", tiers:["A","B"] },
    { id:"google-search", name:"Google Search Ads", role:"High-intent acquisition", tiers:["A","B","C"] },
    { id:"facebook", name:"Facebook", role:"Demand generation & retargeting", tiers:["A","B"] },
    { id:"instagram", name:"Instagram", role:"Visual product marketing", tiers:["A","B"] },
    { id:"whatsapp", name:"WhatsApp Business", role:"Conversational sales", tiers:["A","B","C"], core:true },
    { id:"click-whatsapp", name:"Click-to-WhatsApp Ads", role:"Lead generation", tiers:["A","B","C"] },
    { id:"linkedin", name:"LinkedIn", role:"B2B acquisition", tiers:["A","B","C"], core:true },
    { id:"youtube", name:"YouTube", role:"Demonstration & trust", tiers:["A","B","C"] },
    { id:"microsoft-ads", name:"Microsoft Ads / Bing", role:"Business search acquisition", tiers:["A","B","C"] },
    { id:"amazon", name:"Amazon.co.za", role:"Marketplace", tiers:["A","B"] },
    { id:"takealot", name:"Takealot", role:"Marketplace", tiers:["A","B"] },
    { id:"bobshop", name:"Bob Shop", role:"Marketplace / clearance", tiers:["A","B"] },
    { id:"email", name:"Email / CRM", role:"Retention & nurture", tiers:["A","B","C"], core:true },
    { id:"direct-sales", name:"Direct Sales / RFQ", role:"Assisted conversion", tiers:["A","B","C"], core:true }
  ],
  statusOptions: ["not-planned","planned","ready","live","blocked"],
  stages: [
    { id:"intake", name:"Product intake", owner:"Commercial", description:"Create a complete master SKU with stock, selling price and campaign ownership." },
    { id:"commercial", name:"Commercial approval", owner:"Commercial / Finance", description:"Validate supplier cost, VAT treatment, margin, condition and warranty." },
    { id:"store", name:"Shopify publication", owner:"Commerce", description:"Publish and verify the canonical product page, price, stock and checkout path." },
    { id:"syndication", name:"Channel syndication", owner:"Marketing", description:"Plan and publish the approved channel mix for the selected product tier." },
    { id:"campaign", name:"Campaign launch", owner:"Marketing", description:"Activate campaign tracking and at least two approved acquisition channels." },
    { id:"lead", name:"Lead handling", owner:"Sales", description:"Assign the sales owner and operating response target for inbound enquiries." },
    { id:"fulfilment", name:"Order & fulfilment readiness", owner:"Operations", description:"Confirm fulfilment hand-off before accepting scale." },
    { id:"reporting", name:"Weekly performance review", owner:"Sales / Marketing", description:"Capture spend, leads, quotes, orders, revenue and gross profit." }
  ]
};