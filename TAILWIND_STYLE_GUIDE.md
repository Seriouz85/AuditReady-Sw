# AuditReady Tailwind CSS Style Guide

## Overview
This document outlines the Tailwind CSS conventions and patterns used throughout the AuditReady platform.

## Color Palette

### Brand Colors
- **Primary**: `blue-600` (buttons, links, active states)
- **Secondary**: `gray-600` (secondary text, borders)
- **Success**: `green-600` (success states, confirmations)
- **Warning**: `amber-600` (warnings, pending states)
- **Danger**: `red-600` (errors, destructive actions)
- **Info**: `blue-500` (informational messages)

### Dark Mode
All colors should have dark mode variants:
```tsx
className="text-gray-900 dark:text-gray-100"
className="bg-white dark:bg-gray-900"
className="border-gray-200 dark:border-gray-700"
```

## Component Patterns

### Cards
```tsx
className="rounded-lg border bg-card p-6 shadow-sm"
```

### Buttons
- **Primary**: `bg-blue-600 text-white hover:bg-blue-700`
- **Secondary**: `bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100`
- **Destructive**: `bg-red-600 text-white hover:bg-red-700`

### Forms
- **Input**: `rounded-md border bg-transparent px-3 py-2 text-sm`
- **Label**: `text-sm font-medium`
- **Error**: `text-sm text-red-600 dark:text-red-400`

### Loading States
- **Spinner**: `animate-spin`
- **Skeleton**: `animate-pulse bg-gray-300 dark:bg-gray-700`
- **Progress**: `transition-all duration-300 ease-out`

## Responsive Design

### Breakpoints
- Mobile: Default styles
- Tablet: `md:` prefix (768px)
- Desktop: `lg:` prefix (1024px)
- Wide: `xl:` prefix (1280px)

### Grid Patterns
```tsx
// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Responsive flex
className="flex flex-col md:flex-row gap-4"
```

## Animation Classes

### Custom Animations (defined in tailwind.config.ts)
- `animate-float`: Gentle floating effect
- `animate-shimmer`: Loading shimmer effect
- `animate-spin-slow`: Slow rotation
- `animate-fade-in`: Fade in entrance
- `animate-slide-in`: Slide in from top

### Transitions
```tsx
// Smooth all transitions
className="transition-all duration-200"

// Specific property transitions
className="transition-colors duration-150"
className="transition-transform duration-300"
```

## Spacing Conventions

### Padding
- **Small**: `p-2` (8px)
- **Medium**: `p-4` (16px)
- **Large**: `p-6` (24px)
- **Extra Large**: `p-8` (32px)

### Margins
- Use `space-y-*` and `space-x-*` for consistent spacing between elements
- Avoid margin-top/bottom on components, use gap in parent containers

## Typography

### Font Sizes
- **Heading 1**: `text-3xl font-bold`
- **Heading 2**: `text-2xl font-semibold`
- **Heading 3**: `text-xl font-medium`
- **Body**: `text-base` (default)
- **Small**: `text-sm`
- **Extra Small**: `text-xs`

### Text Colors
- **Primary**: `text-gray-900 dark:text-gray-100`
- **Secondary**: `text-gray-600 dark:text-gray-400`
- **Muted**: `text-gray-500 dark:text-gray-500`

## Utility Patterns

### Hover States
```tsx
className="hover:bg-gray-50 dark:hover:bg-gray-800"
className="hover:shadow-md transition-shadow"
```

### Focus States
```tsx
className="focus:outline-none focus:ring-2 focus:ring-blue-500"
```

### Disabled States
```tsx
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

## Best Practices

1. **Use Semantic Classes**: Prefer Tailwind's semantic color classes over arbitrary values
2. **Dark Mode First**: Always include dark mode variants for colors
3. **Responsive by Default**: Design mobile-first, enhance for larger screens
4. **Consistent Spacing**: Use Tailwind's spacing scale consistently
5. **Avoid Inline Styles**: Use Tailwind classes instead of style props
6. **Component Composition**: Build complex styles by composing utility classes
7. **Performance**: Tailwind automatically purges unused styles in production

## Migration Notes

### From CSS Modules
Replace CSS module imports with Tailwind classes directly in components.

### From Inline Styles
Convert style props to Tailwind utilities:
```tsx
// Before
<div style={{ marginTop: '16px', padding: '8px' }}>

// After
<div className="mt-4 p-2">
```

### Dynamic Styles
For dynamic values that can't be expressed in Tailwind, use CSS custom properties:
```tsx
// For truly dynamic values only
<div 
  className="transition-all duration-300"
  style={{ '--progress': `${progress}%` } as React.CSSProperties}
/>
```

## Files Structure

- `index.css`: Main Tailwind imports and global styles
- `tailwind.config.ts`: Tailwind configuration and theme customization
- `org-chart-minimal.css`: Minimal library-specific styles that can't be Tailwind-ized
- `react-flow-export.css`: React Flow specific overrides