# UI/UX Improvements - Quick Reference Guide

## Quick Start Using New Components

### 1. Using Loading State
```tsx
import { LoadingState } from '../components/LoadingState'

<LoadingState message="Loading your data..." size="medium" />
```

### 2. Using Error State
```tsx
import { ErrorState } from '../components/ErrorState'

<ErrorState 
  title="Error Title"
  message="Error message"
  onRetry={handleRetry}
/>
```

### 3. Using Undo/Redo Hook
```tsx
import { useUndoRedo } from '../hooks/useUndoRedo'

const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo(initialState)
```

### 4. Using Model Builder with Undo/Redo
```tsx
import ModelBuilderContainer from '../components/ModelBuilderContainer'

<ModelBuilderContainer 
  onSave={(nodes, edges) => handleSave(nodes, edges)}
  initialNodes={nodes}
  initialEdges={edges}
/>
```

## Color Usage Quick Reference

### Primary Actions (Blue)
```tsx
sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
```

### Secondary Actions (Purple)
```tsx
sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
```

### Success/Positive (Green)
```tsx
sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
```

### Warning/Alert (Orange)
```tsx
sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
```

### Error/Destructive (Red)
```tsx
sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
```

## Common Styling Patterns

### Modern Card
```tsx
sx={{
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  border: '1px solid #3f3f3f',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    borderColor: '#3b82f6',
    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.3)',
  },
}}
```

### Modern Button
```tsx
sx={{
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
  },
}}
```

### Modern Input
```tsx
sx={{
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#3b82f6',
    },
  },
}}
```

## Animation Patterns

### Import Animations
```tsx
import { keyframes } from '@mui/material/styles'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`
```

### Apply Animations
```tsx
sx={{
  animation: `${slideDown} 0.4s ease`,
  animationDelay: '0.1s',
}}
```

## Theme Usage

### Access Theme Colors
```tsx
import { useTheme } from '@mui/material/styles'

const theme = useTheme()
// Use theme.palette.primary.main, etc.
```

### Apply Theme to ThemeProvider
```tsx
import { ThemeProvider } from '@mui/material/styles'
import { darkTheme } from './theme'

<ThemeProvider theme={darkTheme}>
  <App />
</ThemeProvider>
```

## Responsive Design Breakpoints

```tsx
// Mobile (xs)
sx={{ display: { xs: 'block', sm: 'none' } }}

// Tablet and up (sm)
sx={{ display: { xs: 'none', sm: 'flex' } }}

// Desktop (md)
sx={{ display: { xs: 'none', md: 'flex' } }}

// Large desktop (lg)
sx={{ display: { xs: 'none', lg: 'flex' } }}
```

## Common MUI Utilities Used

### Spacing (p, m, px, py, etc.)
```tsx
sx={{ p: 2 }}        // padding: 16px
sx={{ m: 1 }}        // margin: 8px
sx={{ px: 2, py: 1 }} // horizontal padding 16px, vertical 8px
```

### Display & Alignment
```tsx
sx={{ 
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
}}
```

### Typography
```tsx
variant="h1"  // Large headings
variant="h6"  // Small headings
variant="body1" // Regular text
variant="caption" // Small text
variant="button" // Button text
```

## File Structure

```
frontend/
├── src/
│   ├── theme.ts                    // Global theme
│   ├── index.css                   // Global styles
│   ├── components/
│   │   ├── LoadingState.tsx        // Loading spinner
│   │   ├── ErrorState.tsx          // Error display
│   │   ├── Layout.tsx              // Navigation
│   │   ├── ModelBuilderContainer.tsx // Model builder wrapper
│   │   └── ...other components
│   ├── hooks/
│   │   ├── useUndoRedo.ts          // History management
│   │   └── ...other hooks
│   ├── pages/
│   │   ├── DashboardPage.tsx       // Model list
│   │   ├── ModelBuilderPage.tsx    // Model creation
│   │   ├── InferencePage.tsx       // Model inference
│   │   └── ...other pages
│   ├── api/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
```

## Common Imports

```tsx
// Material-UI components
import { Box, Button, Card, Grid, Paper, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'

// Custom components
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'

// Custom hooks
import { useUndoRedo } from '../hooks/useUndoRedo'

// Icons
import { Save, Delete, Download } from '@mui/icons-material'
```

## Debugging Tips

### Check if Theme Applied
Open browser DevTools, inspect element:
- Should see Material-UI classes like `MuiButton-root`
- Computed styles should show gradient backgrounds

### Check Animations
- Animations should be smooth (60fps)
- Use Chrome DevTools Performance tab
- Check for jank or stuttering

### Verify Responsive Design
- Use Chrome DevTools Device Emulation
- Test at xs, sm, md, lg breakpoints
- Check layout doesn't break at any size

### Check Colors
- Use color picker tool to verify hex values
- Ensure contrast is sufficient
- Test with accessibility tools

## Performance Considerations

1. **Use CSS Custom Properties**: They don't trigger reflows
2. **Memoize Components**: Prevent unnecessary re-renders
3. **Lazy Load**: Load pages only when needed
4. **Optimize Images**: Use correct sizes and formats
5. **Use Production Build**: Removes development warnings

## Accessibility Checklist

- [ ] All buttons have labels or titles
- [ ] Color not sole indicator of state
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Images have alt text
- [ ] Forms have proper labels
- [ ] Error messages clear and helpful
- [ ] Sufficient color contrast

## Customization Guide

### Change Primary Color
Edit `frontend/src/theme.ts`:
```typescript
primary: {
  main: '#YOUR_COLOR',
  light: '#LIGHTER_SHADE',
  dark: '#DARKER_SHADE',
}
```

### Change Surface Colors
Edit `frontend/src/index.css`:
```css
--color-dark: #your-dark-color;
--color-surface: #your-surface-color;
--color-text: #your-text-color;
```

### Add New Animation
Create in component or in a shared animations file:
```tsx
const myAnimation = keyframes`
  0% { /* start state */ }
  50% { /* middle state */ }
  100% { /* end state */ }
`
```

### Create New Status Color
Add to theme.ts and use in components:
```typescript
custom: {
  main: '#YOUR_COLOR',
  light: '#LIGHTER_SHADE',
  dark: '#DARKER_SHADE',
}
```

## Troubleshooting

### Styles Not Applied
- Check theme.ts is properly imported
- Verify ThemeProvider wraps app
- Clear browser cache
- Check MUI version compatibility

### Animations Not Smooth
- Use GPU-accelerated properties (transform, opacity)
- Avoid animating expensive properties
- Use `will-change` CSS sparingly
- Profile with DevTools

### Components Look Wrong
- Verify theme colors are applied
- Check for conflicting global styles
- Inspect with DevTools
- Check console for errors

### Responsive Issues
- Use proper Grid item sizing
- Test at all breakpoints
- Verify flex properties
- Check for fixed widths

---

**Last Updated**: 2024  
**Status**: Production Ready ✅
