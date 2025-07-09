# Payout Visualizer - Complete Package Export

## File Structure to Copy

Copy these files and folders to your target Lovable project:

```
src/
├── PayoutVisualizerPackage.tsx      # Main wrapper component
├── index.ts                         # Package exports
├── components/
│   ├── PayoutCalculator.tsx
│   ├── PayoutSummary.tsx
│   ├── ColorPickerModal.tsx
│   ├── ConfirmationModal.tsx
│   ├── payout/
│   │   ├── TotalPayoutInput.tsx
│   │   ├── PayoutHeaderMenu.tsx
│   │   ├── GroupsManager.tsx
│   │   ├── GroupSection.tsx
│   │   ├── RecipientSummaryItem.tsx
│   │   ├── RecipientsList.tsx
│   │   └── UngroupedSection.tsx
│   ├── recipients/
│   │   ├── RecipientsList.tsx
│   │   ├── GroupContainer.tsx
│   │   ├── UngroupedContainer.tsx
│   │   └── RecipientItem.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── tooltip.tsx
│       ├── use-toast.ts
│       └── [other UI components as needed]
├── hooks/
│   ├── useRecipientsManager.ts
│   ├── usePayoutCalculation.ts
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   ├── utils.ts
│   ├── colorUtils.ts
│   ├── exportUtils.ts
│   └── format.ts
└── index.css                       # Design system tokens
```

## Installation Steps

1. **Copy the source files**: Copy all files from the structure above to your target project
2. **Install dependencies**: Add required packages if not already present
3. **Import and use**: Import the PayoutVisualizer component

## Dependencies to Add (if missing)

```bash
npm install react-colorful jspdf
```

## Usage in Target Project

```tsx
import { PayoutVisualizer } from './path-to-copied-src';

function App() {
  return (
    <div>
      <PayoutVisualizer />
    </div>
  );
}
```

## Alternative Usage (Individual Components)

```tsx
import { 
  PayoutCalculator,
  useRecipientsManager,
  usePayoutCalculation,
  type Recipient,
  type Group
} from './path-to-copied-src';
```

---

**Note**: Since this is a web environment, I cannot create actual zip files. Please manually copy the files using the structure above, or use the file contents provided in the next sections to recreate the package in your target project.

## Manual Copy Instructions

1. Create the folder structure in your target project
2. Copy each file's content from this project to the corresponding file in your target project
3. Ensure all imports are correctly resolved
4. Add any missing dependencies
5. Import and use the PayoutVisualizer component

The main entry point is `PayoutVisualizerPackage.tsx` which includes all necessary providers and styling.