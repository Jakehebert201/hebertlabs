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

<pre class="formula">  a       c
 ───  =  ───
  b       d

a × d  =  b × c</pre>

Two equal ratios stay equal as they scale; cross-multiply and divide by whatever sits with the unknown.

### Dimensional analysis

[Open the calculator](/calculators/dimensional-analysis/)

<pre class="formula">1000 mg
─────── = 1
  1 g</pre>

A conversion factor is an equality written as a fraction that equals 1, so multiplying by it only changes units.

<pre class="formula">           1 kg       2 mg
150 lb ×  ──────  ×  ──────  =  136 mg
          2.2 lb      1 kg</pre>

Put the unit you want to cancel on the bottom of the next factor; whatever unit survives is the answer's unit.

## Concentration

### Percentage strength

[Open the calculator](/calculators/percentage-strength/)

| Type | Meaning |
| --- | --- |
| % w/v | grams of ingredient in 100 mL of preparation |
| % w/w | grams of ingredient in 100 g of preparation |
| % v/v | mL of ingredient in 100 mL of preparation |

<pre class="formula">  5 g
────────     ← 5% w/v as a factor
 100 mL</pre>

Read the percentage as a conversion factor, then orient it so the unit you do not want cancels.

<pre class="formula">% w/v × 10  =  mg/mL</pre>

The shortcut worth keeping: 0.9% w/v is 9 mg/mL, and 5% w/v is 50 mg/mL.

### Ratio strength, ppm & ppb

[Open the calculator](/calculators/ratio-strength/)

<pre class="formula">1 ppm  =  1 mg/L  =  1 mcg/mL
1 ppb  =  1 mcg/L  =  1 ng/mL</pre>

For dilute aqueous solutions, ppm and ppb are just mass-per-volume labels, not a separate kind of math.

<pre class="formula">1 : X     →     X is the volume (or mass) that holds 1 part of ingredient</pre>

Bigger X means a weaker preparation. On solids, 1 ppm is also 1 mg/kg.

### Concentration and dilution

[Open the calculator](/calculators/concentration-dilution/)

<pre class="formula">M1 × V1  =  M2 × V2

diluent  =  V2 − V1</pre>

The amount of drug does not change when you only add diluent, so strength × volume stays constant; the exam usually wants the diluent, not V2.

Ratio strengths are the exception: convert `1 : X` to a concentration with `1/X` before using the equation, then convert back.

### Specific gravity

[Open the calculator](/calculators/specific-gravity/)

<pre class="formula">           density of the substance
   sg  =  ─────────────────────────
             density of water

   sg  =  mass in grams  ÷  volume in milliliters

mass = sg × volume
volume = mass ÷ sg</pre>

Because water is about 1 g/mL, specific gravity is numerically the same as density in g/mL and has no units of its own.

## Compounding

### Reducing & enlarging formulas

[Open the calculator](/calculators/reduce-enlarge/)

<pre class="formula">              quantity you want to make
   factor  =  ──────────────────────────
              quantity the formula makes

scaled amount = original × factor</pre>

One unitless factor scales every line of the formula, including vehicle and flavoring, not just the active.

## Physical pharmacy

### Colligative properties & Van't Hoff

[Open the calculator](/calculators/colligative-properties/)

<pre class="formula">        particles actually in solution
   i =  ──────────────────────────────
        molecules originally dissolved</pre>

The Van't Hoff factor counts how many particles each formula unit produces once it is dissolved.

<pre class="formula">osmolarity  =  (g/L ÷ MW) × i × 1000   mOsmol/L
       ΔTf  =  Kf × m × i                 freezing drops
       ΔTb  =  Kb × m × i                 boiling rises
        ΔP  =  X(solute) × P°             vapor pressure drops</pre>

All four properties track particle count; *m* is molality (mol per kg of solvent), not molarity.

## Constants worth keeping nearby

<pre class="formula">1000 mg = 1 g
1000 g  = 1 kg
1000 mL = 1 L
5 mL    = 1 tsp
1 kg   ≈ 2.2 lb

Water density ≈ 1 g/mL
Water Kf      = 1.86 °C·kg/mol
Water Kb      = 0.512 °C·kg/mol
Water MW      = 18.02 g/mol
Water P°      ≈ 23.8 mmHg at 25 °C

NaCl MW               = 58.44 g/mol
Dextrose monohydrate  = 198.17 g/mol
Blood freezing point  ≈ −0.52 °C

i = 1   non-electrolyte (dextrose, urea, glycerin)
i = 2   NaCl, KCl
i = 3   CaCl₂, Na₂SO₄
i = 4   sodium citrate</pre>

These match the defaults the colligative calculator uses. Coursework may round them; if your lecturer quotes a different figure, use theirs.
