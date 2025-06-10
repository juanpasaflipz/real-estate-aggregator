import * as cheerio from 'cheerio';
import { Property } from '../types.js';

export class MercadoLibreScraper {
  private propertyIdCounter: number = 1;

  /**
   * Parse MercadoLibre HTML and extract property data
   */
  parseHTML(html: string): Property[] {
    const $ = cheerio.load(html);
    const properties: Property[] = [];

    // MercadoLibre uses .ui-search-result__wrapper for each listing
    $('.ui-search-result__wrapper').each((_, element) => {
      try {
        const $el = $(element);
        
        // Extract basic information
        const titleElement = $el.find('h2.ui-search-item__title');
        const title = titleElement.text().trim();
        
        // Get the link
        const linkElement = $el.find('a.ui-search-link, a.ui-search-result__content');
        const href = linkElement.attr('href') || '';
        
        // Extract ID from URL
        const idMatch = href.match(/MLM-(\d+)/);
        const externalId = idMatch ? idMatch[1] : `ml-${this.propertyIdCounter++}`;
        
        // Extract price
        const priceText = $el.find('.price-tag-text-sr-only').text().trim() || 
                         $el.find('.price-tag-amount').text().trim() ||
                         $el.find('.ui-search-price__second-line').text().trim();
        
        const priceMatch = priceText.match(/[\d,]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
        
        // Extract location
        const location = $el.find('.ui-search-item__location').text().trim() || 
                        $el.find('.ui-search-item__group--location').text().trim() ||
                        'México';
        
        // Extract attributes (size, bedrooms, bathrooms)
        const attributes = $el.find('.ui-search-card-attributes__attribute').map((_, attr) => 
          $(attr).text().trim()
        ).get();
        
        let size: number | undefined;
        let bedrooms: number | undefined;
        let bathrooms: number | undefined;
        
        attributes.forEach(attr => {
          // Size in m²
          const sizeMatch = attr.match(/(\d+)\s*m²/);
          if (sizeMatch) {
            size = parseInt(sizeMatch[1]);
          }
          
          // Bedrooms
          if (attr.toLowerCase().includes('recámara') || attr.toLowerCase().includes('habitación')) {
            const numMatch = attr.match(/(\d+)/);
            if (numMatch) {
              bedrooms = parseInt(numMatch[1]);
            }
          }
          
          // Bathrooms
          if (attr.toLowerCase().includes('baño')) {
            const numMatch = attr.match(/(\d+)/);
            if (numMatch) {
              bathrooms = parseInt(numMatch[1]);
            }
          }
        });
        
        // Extract images
        const images: string[] = [];
        const imgElement = $el.find('img.ui-search-result-image__element');
        const imgSrc = imgElement.attr('data-src') || imgElement.attr('src');
        if (imgSrc) {
          images.push(imgSrc);
        }
        
        // Determine property type from title
        let propertyType = 'Inmueble';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('casa')) {
          propertyType = 'Casa';
        } else if (titleLower.includes('departamento') || titleLower.includes('depto')) {
          propertyType = 'Departamento';
        } else if (titleLower.includes('terreno')) {
          propertyType = 'Terreno';
        } else if (titleLower.includes('oficina')) {
          propertyType = 'Oficina';
        } else if (titleLower.includes('local')) {
          propertyType = 'Local';
        }
        
        // Only add if we have essential data
        if (title && price > 0) {
          properties.push({
            id: `ML-${externalId}`,
            title,
            price,
            currency: 'MXN',
            location,
            bedrooms: bedrooms || 0,
            bathrooms,
            size,
            propertyType,
            link: href,
            image: images[0] || 'https://via.placeholder.com/300x200',
            images: images.length > 0 ? images : ['https://via.placeholder.com/300x200'],
            source: 'mercadolibre',
            description: attributes.join(' • '),
            createdAt: new Date().toISOString()
          });
        }
        
      } catch (err) {
        console.error('Error parsing MercadoLibre listing:', err);
      }
    });

    console.log(`Parsed ${properties.length} properties from MercadoLibre`);
    return properties;
  }

  /**
   * Build MercadoLibre search URL
   */
  buildSearchUrl(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
    propertyType?: string;
  }): string {
    const baseUrl = 'https://inmuebles.mercadolibre.com.mx';
    
    // Map property types
    const propertyTypeMap: { [key: string]: string } = {
      'casa': 'casas',
      'departamento': 'departamentos',
      'terreno': 'terrenos',
      'oficina': 'oficinas',
      'local': 'locales'
    };
    
    // Map cities to MercadoLibre location codes
    const cityMap: { [key: string]: string } = {
      'mexico': 'distrito-federal',
      'cdmx': 'distrito-federal',
      'ciudad de mexico': 'distrito-federal',
      'guadalajara': 'jalisco/guadalajara',
      'monterrey': 'nuevo-leon/monterrey',
      'puebla': 'puebla/puebla',
      'cancun': 'quintana-roo/benito-juarez',
      'playa del carmen': 'quintana-roo/solidaridad',
      'queretaro': 'queretaro/queretaro',
      'tijuana': 'baja-california/tijuana'
    };
    
    // Build URL path
    const propertyType = propertyTypeMap[params.propertyType?.toLowerCase() || ''] || '';
    const city = cityMap[params.city?.toLowerCase() || ''] || 'distrito-federal';
    
    // If no property type specified, use 'inmuebles' for all properties
    let url;
    if (propertyType) {
      url = `${baseUrl}/${propertyType}/venta/${city}/`;
    } else {
      url = `${baseUrl}/venta/${city}/`;
    }
    
    console.log('MercadoLibre URL building:', {
      params,
      propertyType,
      city,
      url
    });
    
    // Add price range if specified
    const queryParams = [];
    if (params.priceMin) {
      queryParams.push(`precio-desde-${params.priceMin}`);
    }
    if (params.priceMax) {
      queryParams.push(`precio-hasta-${params.priceMax}`);
    }
    if (params.bedrooms) {
      queryParams.push(`${params.bedrooms}-recamaras`);
    }
    
    if (queryParams.length > 0) {
      url += `_PriceRange_${queryParams.join('-')}`;
    }
    
    console.log('Final MercadoLibre URL:', url);
    
    return url;
  }
}