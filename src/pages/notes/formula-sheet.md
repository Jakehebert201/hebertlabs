---
layout: ../../layouts/NoteLayout.astro
title: Formula sheet
description: The core equations behind each calculator, with a one-line gloss for each. For revision, not for memorizing without understanding.
date: 2026-09-08
topic: Reference
---

These are the relationships the calculators use. Each block is the equation plus what it is saying in plain English. Open the linked calculator when you want the worked steps.

## Foundations

### Ratio & proportion

[Open the calculator](/calculators/proportions/)

```
  a       c
 ───  =  ───
  b       d

a × d  =  b × c
```

Two equal ratios stay equal as they scale; cross-multiply and divide by whatever sits with the unknown.

### Dimensional analysis

[Open the calculator](/calculators/dimensional-analysis/)

```
1000 mg
─────── = 1
  1 g
```

A conversion factor is an equality written as a fraction that equals 1, so multiplying by it only changes units.

```
           1 kg       2 mg
150 lb ×  ──────  ×  ──────  =  136 mg
          2.2 lb      1 kg
```

Put the unit you want to cancel on the bottom of the next factor; whatever unit survives is the answer's unit.

## Concentration

### Percentage strength

[Open the calculator](/calculators/percentage-strength/)


| Type  | Meaning                                      |
| ----- | -------------------------------------------- |
| % w/v | grams of ingredient in 100 mL of preparation |
| % w/w | grams of ingredient in 100 g of preparation  |
| % v/v | mL of ingredient in 100 mL of preparation    |


```
  5 g
────────     ← 5% w/v as a factor
 100 mL
```

Read the percentage as a conversion factor, then orient it so the unit you do not want cancels.

```
% w/v × 10  =  mg/mL
```

The shortcut worth keeping: 0.9% w/v is 9 mg/mL, and 5% w/v is 50 mg/mL.

### Ratio strength, ppm & ppb

[Open the calculator](/calculators/ratio-strength/)

```
1 ppm  =  1 mg/L  =  1 mcg/mL
1 ppb  =  1 mcg/L  =  1 ng/mL
```

For dilute aqueous solutions, ppm and ppb are just mass-per-volume labels, not a separate kind of math.

```
1 : X     →     X is the volume (or mass) that holds 1 part of ingredient
```

Bigger X means a weaker preparation. On solids, 1 ppm is also 1 mg/kg.

### Concentration and dilution

[Open the calculator](/calculators/concentration-dilution/)

```
M1 × V1  =  M2 × V2

diluent  =  V2 − V1
```

The amount of drug does not change when you only add diluent, so strength × volume stays constant; the exam usually wants the diluent, not V2.

Ratio strengths are the exception: convert `1 : X` to a concentration with `1/X` before using the equation, then convert back.

### Specific gravity

[Open the calculator](/calculators/specific-gravity/)

```
           density of the substance
   sg  =  ─────────────────────────
             density of water

   sg  =  mass in grams  ÷  volume in milliliters

mass = sg × volume
volume = mass ÷ sg
```

Because water is about 1 g/mL, specific gravity is numerically the same as density in g/mL and has no units of its own.

## Compounding

### Reducing & enlarging formulas

[Open the calculator](/calculators/reduce-enlarge/)

```
              quantity you want to make
   factor  =  ──────────────────────────
              quantity the formula makes

scaled amount = original × factor
```

One unitless factor scales every line of the formula, including vehicle and flavoring, not just the active.

## Exam 2

### Alligations

[Open the calculator](/calculators/alligations/)

```
higher ──── parts of higher = desired − lower
         \  /
        desired
         /  \
lower ──── parts of lower  = higher − desired
```

Alligation alternate: the parts of each stock equal the gap between the desired strength and the other stock.

```
        Σ (strength × quantity)
average = ─────────────────────────
              Σ quantity
```

Alligation medial: the finished strength is the quantity-weighted average of the strengths you mixed.

### BSA and BSA-based dosing

[Open the calculator](/calculators/bsa/)

```
BSA (m²) = √( (height(cm) × weight(kg)) / 3600 )

patient dose (mg)  =  ordered (mg/m²)  ×  BSA (m²)

1 in  =  2.54 cm
2.2 lb  =  1 kg
reference adult BSA  ≈  1.73 m²
```

Mosteller needs centimeters and kilograms; convert first, then multiply an mg/m² order by the patient's own BSA. 1.73 m² is the conventional adult reference, not a substitute for measuring the patient.

### Creatinine clearance

[Open the calculator](/calculators/creatinine-clearance/)

```
CrCl (mL/min) = [(140 - age) × weight(kg) × sex] / (72 × Scr)

sex = 1 (male) or 0.85 (female)
Scr in mg/dL

IBW (male)   = 50 kg + 2.3 kg × (height(in) - 60)
IBW (female) = 45.5 kg + 2.3 kg × (height(in) - 60)

dosing weight = min(ABW, IBW)
```

Cockcroft-Gault estimates clearance for renal dosing tables. This course uses the lower of actual body weight and Devine ideal body weight.

### Isotonicity and E values

[Open the calculator](/calculators/isotonicity/)

```
E = grams of NaCl with the same osmotic effect as 1 g of solute

NaCl equivalent = mass (g) × E

isotonic NaCl target = 0.9 × (volume / 100)   g   for volume in mL

NaCl to add = isotonic NaCl target − Σ (mass × E)
```

0.9% w/v sodium chloride is the isotonic reference. Include every dissolved solid; NaCl already in the formula uses E = 1.0. A negative result means the preparation is hypertonic.

## Constants worth keeping nearby

```
1000 mg = 1 g
1000 g  = 1 kg
1000 mL = 1 L
5 mL    = 1 tsp
1 kg   ≈ 2.2 lb
1 in    = 2.54 cm

Reference adult BSA ≈ 1.73 m²
Water density ≈ 1 g/mL

U-100 insulin  =  100 units/mL
U-500 insulin  =  500 units/mL
```

