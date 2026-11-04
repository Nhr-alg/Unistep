# UniStep engine coverage and expansion plan

## Current honest scope

The numeric solver is a focused prototype. Its automated golden suite has 38
examples across rotational motion, kinematics, projectiles, basic chemistry,
ideal-gas and heat calculations, algebra, calculus, matrices, unit conversion,
basic circuits, stress and strain, and introductory fluid mechanics. A passing
example is evidence for that case, not proof that every variation in the topic
works.

Theory mode adds a local, curated library of 22 introductory concepts. It
matches a question to a known entry and returns its explanation, equations,
units, assumptions, example, and a check. It is not open-ended AI chat. An
unmatched topic is identified so the app does not make up an answer.

## Recommended expansion order

Choose the next family from real student or tutor questions. For an FE and
tutoring-center product, this is a practical starting sequence:

1. **Statics:** vector components, force resultants, free-body diagrams, 2D
   particle and rigid-body equilibrium, support reactions, and trusses.
2. **Strength of materials:** axial deformation, torsion, bending stress,
   shear stress, combined loading, and introductory beam deflection.
3. **Circuits:** Kirchhoff node/loop systems, dividers, capacitors, inductors,
   and first-order transient response.
4. **Fluids:** continuity, manometers, hydrostatics, pipe head loss, and pump
   power.
5. **Thermodynamics:** closed-system energy balances, steady-flow devices, and
   common ideal cycles with their assumptions stated.
6. **Engineering mathematics and chemistry:** differential equations,
   numerical methods, equilibrium, and reaction calculations chosen from
   measured demand.

This order is a product hypothesis, not a claim that it covers all curricula.
Review the next module with target users before spending time on a low-demand
topic.

## Definition of done for a solver family

Before enabling a new family in the product, add:

- A clearly bounded problem grammar and explicit unsupported-input behavior.
- Golden cases for ordinary, boundary, negative, zero, unit-conversion, and
  ambiguous inputs where those cases apply.
- Independent numerical checks and dimensional/unit checks.
- Assumptions and limitations in the returned derivation.
- A topic page and an example that pass through the same production engine.
- A human review by a qualified instructor or engineer before public claims.

Never advertise a whole subject based on one passing example. Track coverage by
problem family and publish that coverage to students.

## Path toward $1,000 monthly recurring revenue

The existing tutoring-center price is $99 per month, so 11 active centers would
represent $1,089 in gross monthly recurring revenue before payment fees, refunds,
taxes, and operating costs. This is arithmetic, not a revenue forecast.

Start with a small, supervised pilot. Measure whether staff can create a useful
worksheet, whether the answer key is trusted, how often the center returns, and
what support each center needs. Fix those blockers before increasing outreach.
Do not charge for synced accounts or protected solve limits until both are
enforced server-side and payment status is verified by a trusted backend.
