# Telegram Mini-App Development Prompt for Real Estate Platform

## Project Overview
You are building a Telegram Mini-App that serves as a frontend interface for a real estate platform. The app will connect to an existing database hosted on Render.com and display property listings to users within Telegram.

## Technical Stack (MANDATORY)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **UI Primitives**: Radix UI

## Architecture Requirements

### 1. Web App First
- Build a standard Next.js web application that can run in any browser
- Ensure mobile-first responsive design (Telegram mini-apps run in a webview)
- The app will be embedded in Telegram using their WebApp API

### 2. Database Connection
- Connect to the PostgreSQL database hosted on Render.com
- API endpoints are available at the Render deployment URL
- Database schema includes:
  - Properties table (listings)
  - Property details (price, location, bedrooms, bathrooms, etc.)
  - Images and metadata

### 3. Telegram Integration
```typescript
// Install @twa-dev/sdk for Telegram WebApp integration
npm install @twa-dev/sdk

// In your app, initialize Telegram WebApp
import WebApp from '@twa-dev/sdk'

useEffect(() => {
  WebApp.ready();
  WebApp.expand();
  // Set theme colors based on Telegram theme
  WebApp.setHeaderColor(WebApp.themeParams.bg_color);
}, []);
```

## Core Features to Implement

### 1. Property Listing View
- Grid/List view toggle
- Property cards showing:
  - Main image
  - Price
  - Location
  - Bedrooms/Bathrooms
  - Square meters
- Infinite scroll or pagination
- Search and filter functionality

### 2. Property Detail View
- Image carousel/gallery
- Full property details
- Contact button (opens Telegram chat)
- Share button (using Telegram's share API)
- Save to favorites

### 3. Search & Filters
- Location search
- Price range slider
- Property type filter
- Bedrooms/bathrooms filter
- Sort options (price, date, size)

### 4. User Features
- Favorites list (stored locally or in Telegram CloudStorage)
- Recent searches
- Property comparison tool

## UI/UX Guidelines

### 1. Telegram Design Compliance
- Follow Telegram's color scheme (accessible via WebApp.themeParams)
- Use Telegram's native components where possible:
  - MainButton for primary actions
  - BackButton for navigation
  - HapticFeedback for interactions

### 2. Component Structure
```typescript
// Example component structure using shadcn/ui
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Heart, Share2, Bed, Bath } from "lucide-react"

export function PropertyCard({ property }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          {/* Property image */}
        </CardHeader>
        <CardContent>
          {/* Property details */}
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### 3. State Management Pattern
```typescript
// Zustand store example
import { create } from 'zustand'

interface PropertyStore {
  properties: Property[]
  filters: FilterState
  favorites: string[]
  setProperties: (properties: Property[]) => void
  toggleFavorite: (propertyId: string) => void
  updateFilters: (filters: Partial<FilterState>) => void
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  properties: [],
  filters: {},
  favorites: [],
  setProperties: (properties) => set({ properties }),
  toggleFavorite: (propertyId) => set((state) => ({
    favorites: state.favorites.includes(propertyId)
      ? state.favorites.filter(id => id !== propertyId)
      : [...state.favorites, propertyId]
  })),
  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  }))
}))
```

## API Integration

### 1. Environment Setup
```env
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
```

### 2. API Service Layer
```typescript
// services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const propertyService = {
  async getProperties(filters?: FilterParams) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${API_URL}/api/properties?${params}`)
    return response.json()
  },
  
  async getProperty(id: string) {
    const response = await fetch(`${API_URL}/api/properties/${id}`)
    return response.json()
  }
}
```

## Performance Considerations
1. Implement image optimization with Next.js Image component
2. Use React Query or SWR for data fetching and caching
3. Implement virtual scrolling for large lists
4. Lazy load images and components
5. Minimize bundle size (check with next-bundle-analyzer)

## Testing Requirements
1. Test on multiple devices and screen sizes
2. Test within Telegram app on iOS and Android
3. Ensure offline functionality where appropriate
4. Test with Telegram's dark and light themes

## Deployment
1. Deploy the Next.js app to Vercel or similar platform
2. Configure HTTPS (required for Telegram mini-apps)
3. Add the web app URL to your Telegram bot via BotFather
4. Set up proper CORS headers for API access

## Security Considerations
1. Validate Telegram WebApp initData on the backend
2. Don't expose sensitive database credentials
3. Implement rate limiting on API endpoints
4. Use environment variables for all configuration

## Getting Started
```bash
# Create Next.js app with TypeScript
npx create-next-app@latest telegram-real-estate --typescript --tailwind --app

# Install required dependencies
cd telegram-real-estate
npm install @twa-dev/sdk zustand framer-motion lucide-react @radix-ui/react-slot
npm install @tanstack/react-query axios

# Install shadcn/ui
npx shadcn-ui@latest init

# Add shadcn components as needed
npx shadcn-ui@latest add card button dialog sheet
```

## Development Workflow
1. Start with the web app working in a regular browser
2. Test in Telegram using BotFather's test environment
3. Implement Telegram-specific features progressively
4. Always maintain fallbacks for non-Telegram environments

Remember: The app should be fully functional as a web app first, with Telegram integration as an enhancement layer.