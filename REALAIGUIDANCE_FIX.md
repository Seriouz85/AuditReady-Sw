# REAL AI GUIDANCE FIX PLAN

## PROBLEM:
- Content är utspritt över flera moduler
- Duplicerad visning av guidance
- Categories är inte bredvid content viewer
- Layout är helt förstörd

## SOLUTION:
1. EN UNIFIED CONTENT VIEWER som visar:
   - Guidance när det finns
   - Sub-requirements när de finns
   - Empty state när inget är valt
   
2. STRUKTUR:
```
Grid (xl:grid-cols-2)
├── Left Column
│   └── Categories Panel
└── Right Column
    ├── URL Input Panel
    ├── Knowledge Bank
    └── UNIFIED CONTENT VIEWER (visar allt)
```

3. INGEN DUPLICERING - bara EN plats där content visas