import { PropertySearchParams } from "../types.js";

export function parsePropertyQuery(message: string): PropertySearchParams {
  const params: PropertySearchParams = {};
  
  const cityMatch = message.match(/in\s+([A-Za-z\s]+?)(?:\s+under|\s+over|\s+between|\s+with|\s*$)/i);
  if (cityMatch) {
    params.city = cityMatch[1].trim();
  }
  
  const priceUnderMatch = message.match(/under\s+\$?([\d,]+)(?:\s+USD)?/i);
  if (priceUnderMatch) {
    params.priceMax = parseInt(priceUnderMatch[1].replace(/,/g, ""));
  }
  
  const priceOverMatch = message.match(/over\s+\$?([\d,]+)(?:\s+USD)?/i);
  if (priceOverMatch) {
    params.priceMin = parseInt(priceOverMatch[1].replace(/,/g, ""));
  }
  
  const priceBetweenMatch = message.match(/between\s+\$?([\d,]+)\s+and\s+\$?([\d,]+)/i);
  if (priceBetweenMatch) {
    params.priceMin = parseInt(priceBetweenMatch[1].replace(/,/g, ""));
    params.priceMax = parseInt(priceBetweenMatch[2].replace(/,/g, ""));
  }
  
  const bedroomMatch = message.match(/(\d+)[\s-]?bedroom/i);
  if (bedroomMatch) {
    params.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  const features: string[] = [];
  if (/pool/i.test(message)) features.push("pool");
  if (/garage/i.test(message)) features.push("garage");
  if (/garden/i.test(message)) features.push("garden");
  if (/view/i.test(message)) features.push("view");
  if (/gym/i.test(message)) features.push("gym");
  if (/security/i.test(message)) features.push("security");
  
  if (features.length > 0) {
    params.features = features;
  }
  
  return params;
}

export function formatPropertyResponse(result: any): string {
  if (!result.properties || result.properties.length === 0) {
    return "No properties found matching your criteria.";
  }
  
  const total = result.total || result.properties.length;
  let response = `Found ${total} properties matching your criteria:\n\n`;
  
  const topProperties = result.properties.slice(0, 5);
  
  topProperties.forEach((property: any, index: number) => {
    response += `${index + 1}. **${property.title}**\n`;
    response += `   Price: $${property.price.toLocaleString()} USD\n`;
    response += `   Location: ${property.location}\n`;
    response += `   Bedrooms: ${property.bedrooms}\n`;
    response += `   Link: ${property.link}\n\n`;
  });
  
  if (total > 5) {
    response += `\n...and ${total - 5} more properties.`;
  }
  
  return response;
}