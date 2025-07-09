# Payout Visualizer Package

A complete React component for calculating and visualizing payouts among multiple recipients.

## Features

- **Multiple payout types**: Fixed amounts ($), percentages (%), and shares
- **Group management**: Organize recipients into collapsible groups with custom colors
- **Drag & drop**: Move recipients between groups or to ungrouped section
- **Export functionality**: Export data as CSV or PDF
- **Responsive design**: Works seamlessly on desktop and mobile
- **Keyboard navigation**: Support for both horizontal and vertical tabbing modes
- **Real-time calculations**: Automatic payout calculations with live updates

## Installation

Copy the entire `src` folder from this project to your target Lovable project, then import the component.

## Required Dependencies

Make sure your target project has these dependencies installed:

```bash
# Core dependencies (should already be in Lovable projects)
@tanstack/react-query
@radix-ui/react-dialog
@radix-ui/react-select
@radix-ui/react-tooltip
@radix-ui/react-toast
lucide-react
class-variance-authority
clsx
tailwind-merge

# Additional dependencies you may need to add
react-colorful
jspdf
```

## Basic Usage

```tsx
import { PayoutVisualizer } from './path-to-src';

function App() {
  return (
    <div>
      <PayoutVisualizer />
    </div>
  );
}
```

## Advanced Usage

```tsx
import { 
  PayoutCalculator, 
  useRecipientsManager, 
  usePayoutCalculation,
  type Recipient,
  type Group 
} from './path-to-src';

function CustomPayoutApp() {
  // Use the hooks directly for custom implementations
  const recipientsManager = useRecipientsManager();
  const payoutCalculation = usePayoutCalculation(recipientsManager.recipients);
  
  return (
    <div className="p-4">
      <PayoutCalculator />
    </div>
  );
}
```

## Component Props

### PayoutVisualizer

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Optional CSS class for styling the container |

## Key Components

- **PayoutVisualizer**: Main wrapper component with providers
- **PayoutCalculator**: Core calculation component
- **RecipientsList**: Manages recipient list with groups
- **PayoutSummary**: Shows calculation results and charts
- **TotalPayoutInput**: Input for total amount to distribute

## Styling

The package uses Tailwind CSS with a design system based on HSL color tokens. Make sure your target project has Tailwind configured and includes the design tokens from `src/index.css`.

## Mobile Support

The component is fully responsive and includes:
- Mobile-optimized menus
- Touch-friendly drag & drop
- Collapsible interface elements
- Optimized tabbing for mobile keyboards

## Keyboard Navigation

- **Horizontal tabbing**: Tab through name → value → type for each recipient
- **Vertical tabbing**: Tab through all names, then all values, then all types
- **Group management**: Tab through group headers before recipient fields
- **Escape key**: Clear selections
- **Click outside**: Clear selections

## Export Features

- **CSV Export**: Export recipient data with calculations
- **PDF Export**: Generate formatted payout reports
- **Data Import**: Import recipient lists from CSV files