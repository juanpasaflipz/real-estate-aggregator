# Real Estate Aggregator Frontend Development Prompt

## Project Overview
Create a modern, responsive frontend application for a Real Estate Aggregator platform that connects to an existing REST API. The application should serve multiple user types (buyers, brokers, lenders) with tailored dashboards and features.

## Technical Stack Requirements
- **Framework**: React.js (latest version)
- **Styling**: Tailwind CSS
- **State Management**: React Context API or Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **PWA**: Workbox for offline capabilities
- **Testing**: Jest + React Testing Library
- **Type Safety**: TypeScript

## API Integration
Connect to the existing REST API at: `https://real-estate-api-7mln.onrender.com`

### Available Endpoints:
1. **GET /properties** - Search properties
   - Query params: `city`, `priceMin`, `priceMax`, `bedrooms`, `limit`
   - Returns aggregated listings from EasyBroker, Vivanuncios, and Inmuebles24
   
2. **GET /health** - Check API status
   - Returns service availability and data sources

3. **POST /scrape** - Custom scraping (if needed)
   - Body: `{ url, render, useSuper, geoCode, format }`

## Core Features

### 1. Public Features (No Authentication)
- **Property Search & Filters**
  - City/location search with autocomplete
  - Price range slider (MXN)
  - Bedrooms filter
  - Property type filter
  - Sort by: price, date, relevance
  
- **Property Listings View**
  - Grid/List view toggle
  - Property cards showing:
    - Image carousel
    - Price with currency
    - Location (neighborhood, city)
    - Bedrooms/bathrooms
    - Property type badge
    - Source indicator (EasyBroker/Vivanuncios/etc.)
  - Infinite scroll or pagination
  - "Save to favorites" (localStorage)

- **Property Details Page**
  - Full image gallery with lightbox
  - Complete property information
  - Location map (Google Maps or Mapbox)
  - Contact form
  - Share functionality
  - Similar properties section

### 2. Broker Dashboard
- **Dashboard Overview**
  - Total inquiries
  - Active listings being tracked
  - Recent client interactions
  - Performance metrics

- **Lead Management**
  - Inquiry inbox with filters
  - Lead status tracking (New, Contacted, Qualified, Closed)
  - Notes and follow-up reminders
  - Export to CSV

- **Saved Searches**
  - Create and manage saved searches for clients
  - Email alerts for new matches
  - Share search results with clients

- **Analytics**
  - Most viewed properties
  - Popular search criteria
  - Conversion metrics
  - Market trends visualization

### 3. Lender Dashboard
- **Mortgage Calculator Integration**
  - Calculate monthly payments
  - Down payment options
  - Interest rate inputs
  - Amortization schedule

- **Pre-qualification Forms**
  - Income verification
  - Credit score range
  - Debt-to-income calculator
  - Generate pre-approval letters

- **Client Pipeline**
  - Track loan applications
  - Document checklist
  - Status updates
  - Communication log

- **Market Analytics**
  - Average property prices by area
  - Loan volume trends
  - Popular price ranges
  - Affordability index

## UI/UX Requirements

### Design System
- **Colors**: Professional real estate palette
  - Primary: Deep blue (#1e3a8a)
  - Secondary: Warm gray (#6b7280)
  - Accent: Green (#10b981)
  - Background: Light gray (#f9fafb)

- **Typography**
  - Headings: Inter or Poppins
  - Body: System fonts for performance

- **Components** (using Tailwind CSS):
  - Consistent spacing scale
  - Rounded corners (rounded-lg)
  - Subtle shadows for depth
  - Smooth transitions

### Responsive Design
- **Mobile First** approach
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Touch-friendly interface
- Optimized images with lazy loading

### PWA Features
- **Offline Functionality**
  - Cache property searches
  - Offline property viewing
  - Queue form submissions
  
- **App-like Experience**
  - Add to home screen
  - Full-screen mode
  - Native app feel
  
- **Performance**
  - Service worker for caching
  - Background sync
  - Push notifications (future)

## Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx
│   │   ├── PropertyCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── property/
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyDetails.tsx
│   │   ├── ImageGallery.tsx
│   │   └── ContactForm.tsx
│   ├── broker/
│   │   ├── BrokerDashboard.tsx
│   │   ├── LeadManager.tsx
│   │   ├── Analytics.tsx
│   │   └── SavedSearches.tsx
│   └── lender/
│       ├── LenderDashboard.tsx
│       ├── MortgageCalculator.tsx
│       ├── PreQualificationForm.tsx
│       └── ClientPipeline.tsx
├── hooks/
│   ├── useProperties.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── services/
│   ├── api.ts
│   ├── propertyService.ts
│   └── storageService.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── types/
    └── index.ts
```

## Implementation Priorities

### Phase 1: Core Functionality (Week 1-2)
1. Setup project with Vite + React + TypeScript + Tailwind
2. Implement property search and listing display
3. Create property detail pages
4. Add responsive design
5. Implement favorites functionality

### Phase 2: Enhanced Features (Week 3-4)
1. Add broker dashboard with basic features
2. Implement lender dashboard with calculator
3. Add filtering and sorting
4. Implement PWA features
5. Add loading states and error handling

### Phase 3: Polish & Optimization (Week 5)
1. Performance optimization
2. SEO improvements
3. Accessibility (WCAG 2.1 AA)
4. Cross-browser testing
5. Deploy to production

## Sample Code Structure

### API Service (src/services/api.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = 'https://real-estate-api-7mln.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const propertyService = {
  search: (params: SearchParams) => 
    api.get('/properties', { params }),
  
  getHealth: () => 
    api.get('/health'),
};
```

### Property Hook (src/hooks/useProperties.ts)
```typescript
export const useProperties = (filters: FilterParams) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await propertyService.search(filters);
        setProperties(response.data.data.properties);
      } catch (err) {
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error };
};
```

## Deployment Requirements
- **Hosting**: Vercel, Netlify, or AWS Amplify
- **Environment Variables**:
  - `VITE_API_URL`
  - `VITE_GOOGLE_MAPS_KEY` (if using maps)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry for error tracking
- **Analytics**: Google Analytics or Plausible

## Success Criteria
1. Fast initial load time (< 3s on 3G)
2. Smooth interactions with 60fps scrolling
3. Works offline for cached content
4. Accessible to screen readers
5. SEO optimized with proper meta tags
6. Mobile-first responsive design
7. Type-safe with full TypeScript coverage

## Additional Considerations
- Implement proper error boundaries
- Add loading skeletons for better UX
- Use React.lazy() for code splitting
- Implement virtual scrolling for large lists
- Add property comparison feature
- Consider i18n for Spanish/English support
- Add print-friendly property details
- Implement social sharing with Open Graph tags

This frontend should provide a professional, fast, and user-friendly interface for the real estate aggregator platform, with specialized features for different user types while maintaining excellent performance and accessibility.