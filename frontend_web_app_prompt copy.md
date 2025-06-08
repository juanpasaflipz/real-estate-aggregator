# Frontend Web Application for Real Estate Aggregator

## Project Overview
Create a modern, responsive web application that serves as the frontend for a real estate aggregator system. This application will consume a REST API (running on port 3002) that aggregates property listings from multiple sources in Mexico.

## Technical Requirements

### Stack
- **Framework**: React with Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand or React Context
- **Data Fetching**: TanStack Query (React Query) or SWR
- **TypeScript**: Strict mode enabled
- **Forms**: React Hook Form with Zod validation
- **Maps**: Mapbox or Google Maps for property locations

### Core Features to Implement

1. **Property Search & Listing**
   - Search bar with autocomplete for cities
   - Advanced filters panel:
     - Price range (min/max with slider)
     - Number of bedrooms
     - Property features (pool, garage, garden, etc.)
     - Property type (apartment, house, condo)
   - Results grid/list view toggle
   - Pagination or infinite scroll
   - Sort options (price, date, relevance)

2. **Property Details Page**
   - Image gallery with lightbox
   - Property specifications
   - Location map
   - Contact form
   - Share functionality
   - Save to favorites

3. **User Preferences**
   - Save search preferences
   - Favorite properties list
   - Search history
   - Email alerts setup

4. **Responsive Design**
   - Mobile-first approach
   - Progressive Web App (PWA) capabilities
   - Offline support for viewed properties

## API Integration

### Base Configuration
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
```

### Available Endpoints
- `GET /health` - Check API status
- `GET /properties` - Search properties with query parameters
- `GET /properties/:id` - Get property details (to be implemented)
- `POST /user/preferences` - Save user preferences

### API Response Format
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    filters?: any;
  };
}
```

## Component Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── properties/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── favorites/
│   │   └── page.tsx
│   └── api/
│       └── properties/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── SortOptions.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyDetails.tsx
│   │   └── PropertyMap.tsx
│   └── ui/
│       └── (shadcn components)
├── hooks/
│   ├── useProperties.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── constants.ts
└── types/
    └── property.ts
```

## Key Implementation Details

### 1. Search Implementation
```typescript
// Example search hook
const usePropertySearch = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    keepPreviousData: true,
  });
};
```

### 2. Filter State Management
```typescript
interface SearchFilters {
  city?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  features?: string[];
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'date' | 'relevance';
}
```

### 3. Error Handling
- Display user-friendly error messages
- Implement retry mechanisms
- Show loading states
- Handle offline scenarios

### 4. Performance Optimization
- Implement image lazy loading
- Use Next.js Image component
- Implement virtual scrolling for large lists
- Cache API responses
- Prefetch property details on hover

## UI/UX Requirements

1. **Design System**
   - Consistent color palette
   - Typography scale
   - Spacing system
   - Component variants

2. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Proper ARIA labels

3. **Interactions**
   - Smooth transitions
   - Loading skeletons
   - Optimistic updates
   - Clear feedback for user actions

## Development Workflow

### Environment Setup
```bash
# Clone the repository
git clone [your-frontend-repo]
cd [frontend-directory]

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Testing Requirements
- Unit tests for utilities and hooks
- Component testing with React Testing Library
- E2E tests for critical user flows
- API mocking for tests

## Deployment Considerations
- Deploy to Vercel or Netlify
- Set up CI/CD pipeline
- Configure environment variables
- Enable analytics and monitoring
- Set up error tracking (Sentry)

## Additional Features (Phase 2)
- User authentication
- Property comparison tool
- Mortgage calculator
- Virtual tours integration
- WhatsApp integration for inquiries
- Multi-language support (Spanish/English)

---

# 🔧 Claude Code Prompt Efficiency Rules (Annex)

This set of prompt rules is designed to improve Claude Code's performance, accuracy, and token efficiency without sacrificing output quality. Include or reference these rules when prompting Claude for coding tasks.

---

## 1. Scope Clarity
- Always state **which file(s)** or **part of the codebase** the prompt concerns.
- Be explicit: are you creating, modifying, or reviewing code?

## 2. Minimal Context Loading
- Only include relevant file paths, names, or code snippets.
- Avoid pasting full files unless absolutely necessary.

## 3. Output Precision
- Clearly define the expected output:
  - "Return only the updated function"
  - "Explain logic in comments"
  - "Output a full modified file"
- Indicate format: `inline edit`, `diff`, or `full file`.

## 4. Style & Framework Consistency
- Mention stack details:  
  Example: `React + Next.js + TypeScript + TailwindCSS + shadcn/ui`
- Coding preferences:
  - Use functional components
  - Avoid `any` type
  - Use Tailwind utility-first conventions

## 5. Error Handling & Comments
- Request only essential error handling unless stated otherwise.
- Prefer **brief inline comments** only where logic isn't obvious.

## 6. Token Efficiency
- Include phrases like:
  - "Be concise"
  - "Avoid unnecessary boilerplate"
  - "Reuse existing functions when possible"
- Don't repeat code unless it's needed for context.

## 7. Modular Suggestions
- For complex requests, instruct:
  - "Break this into steps"
  - "Pause for review after each part"

## 8. Avoid Ambiguity
- Prefer:
  - "Add a wallet connect button using RainbowKit"
- Avoid:
  - "Add crypto wallet support"

## 9. When Using Memory
- If project memory is active:
  - "Use project memory for file structure, imports, and naming conventions"

## 10. Post-Completion Checks
- Ask Claude to:
  - "Check for unused imports or invalid JSX"
  - "Ensure performance and readability best practices"

---

## Important Instruction Reminders
- Do what has been asked; nothing more, nothing less.
- NEVER create files unless they're absolutely necessary for achieving your goal.
- ALWAYS prefer editing an existing file to creating a new one.
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

---

Use these rules as a reusable annex in your prompts to streamline collaboration with Claude Code.