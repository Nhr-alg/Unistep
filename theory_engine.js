/**
 * UniStep Theory Library
 *
 * A small, curated, offline library for introductory engineering concepts.
 * This is deliberately retrieval based: it only answers topics present below
 * and does not invent explanations for an unrecognized question.
 */
(function () {
    'use strict';

    const TOPICS = [
        {
            id: 'newtons-second-law', subject: 'Mechanics', title: "Newton's second law",
            aliases: ['newtons second law', 'second law of motion', 'force mass acceleration', 'f equals ma', 'net force'],
            summary: 'An object’s acceleration is set by the net force acting on it and its mass.',
            intuition: 'The same push changes a light object’s motion more than a heavy object’s. Forces from all interactions must be added as vectors before finding acceleration.',
            equations: ['ΣF = ma'], units: ['ΣF: newtons (N)', 'm: kilograms (kg)', 'a: metres per second squared (m/s²)'],
            conditions: 'Use an inertial reference frame and include every external force in the free-body diagram.',
            example: 'A 2 kg cart with a net horizontal force of 6 N accelerates at a = 6/2 = 3 m/s².',
            check: 'If the net force is zero, acceleration is zero; the object may still move at constant velocity.'
        },
        {
            id: 'kinematics', subject: 'Mechanics', title: 'Constant-acceleration kinematics',
            aliases: ['kinematic equations', 'constant acceleration', 'equations of motion', 'suvat', 'motion with acceleration'],
            summary: 'Kinematics relates position, velocity, acceleration, and time without asking what forces caused the motion.',
            intuition: 'For constant acceleration, velocity changes at a steady rate, so average velocity over an interval is the midpoint of the starting and ending velocities.',
            equations: ['v = u + at', 's = ut + ½at²', 'v² = u² + 2as'],
            units: ['u, v: m/s', 'a: m/s²', 't: s', 's: m'],
            conditions: 'Acceleration must be constant over the interval. Choose a consistent positive direction.',
            example: 'Starting from rest, accelerating at 2 m/s² for 3 s gives v = 0 + 2·3 = 6 m/s.',
            check: 'A negative acceleration means acceleration points opposite the chosen positive direction; it does not always mean the object is slowing down.'
        },
        {
            id: 'work-energy', subject: 'Mechanics', title: 'Work–energy theorem',
            aliases: ['work energy theorem', 'work and kinetic energy', 'change in kinetic energy', 'work done by a force'],
            summary: 'The net work on an object equals its change in kinetic energy.',
            intuition: 'Work is energy transferred by a force acting through a displacement. Positive net work increases speed; negative net work decreases kinetic energy.',
            equations: ['Wₙₑₜ = ΔK', 'K = ½mv²', 'W = Fd cos θ (constant force)'],
            units: ['W and K: joules (J)', 'F: newtons (N)', 'd: metres (m)'],
            conditions: 'Use net work from all forces. For a variable force, work is the integral of force along the path.',
            example: 'If net work is 12 J, kinetic energy increases by 12 J.',
            check: 'Work is zero when the force is perpendicular to displacement.'
        },
        {
            id: 'momentum', subject: 'Mechanics', title: 'Conservation of momentum',
            aliases: ['conservation of momentum', 'momentum collision', 'impulse momentum', 'momentum is conserved'],
            summary: 'A system’s total momentum stays constant when the net external impulse on it is zero.',
            intuition: 'During a collision, objects exchange momentum internally. Those internal forces come in equal-and-opposite pairs, so the system total does not change.',
            equations: ['p = mv', 'Σpᵢ = Σp𝒇 (isolated system)', 'J = Δp'],
            units: ['p: kg·m/s', 'J: N·s'],
            conditions: 'Define the system and account for external impulses. Momentum is conserved even when kinetic energy is not.',
            example: 'Two carts that stick together after impact conserve combined momentum, but some kinetic energy becomes heat, sound, or deformation.',
            check: 'Do not assume kinetic energy is conserved in an inelastic collision.'
        },
        {
            id: 'torque', subject: 'Mechanics', title: 'Torque and rotational equilibrium',
            aliases: ['torque', 'moment of a force', 'rotational equilibrium', 'moment arm'],
            summary: 'Torque measures how strongly a force tends to rotate an object about a chosen point or axis.',
            intuition: 'A force has more turning effect when applied farther from the pivot, and only the component perpendicular to the lever arm contributes.',
            equations: ['τ = r × F', '|τ| = rF sin θ', 'Στ = 0 (rotational equilibrium)'],
            units: ['τ: newton-metres (N·m)', 'r: metres (m)', 'F: newtons (N)'],
            conditions: 'State the pivot and a consistent sign convention. Rotational equilibrium requires zero net torque about an axis.',
            example: 'A perpendicular 10 N force applied 0.4 m from a pivot creates 4 N·m of torque.',
            check: 'Torque and energy share the same base units but are different physical quantities.'
        },
        {
            id: 'rolling', subject: 'Mechanics', title: 'Rolling without slipping',
            aliases: ['rolling without slipping', 'pure rolling', 'rolling motion', 'rotational kinetic energy', 'ratio of rotational ke'],
            summary: 'For ideal rolling without slipping, the centre speed and angular speed obey v = ωR.',
            intuition: 'At the contact point with the surface, the translational velocity and the rotational velocity cancel relative to the ground.',
            equations: ['v₍cm₎ = ωR', 'K = ½Mv₍cm₎² + ½I₍cm₎ω²'],
            units: ['v: m/s', 'ω: rad/s', 'R: m', 'I: kg·m²'],
            conditions: 'The relation assumes no slipping at the contact point. The moment of inertia depends on the object’s mass distribution.',
            example: 'For a solid cylinder, I = ½MR², so rotational energy is one half of translational energy during pure rolling.',
            check: 'Do not use v = ωR when the object is sliding at the contact surface.'
        },
        {
            id: 'ohms-law', subject: 'Electrical engineering', title: "Ohm's law",
            aliases: ['ohms law', 'voltage current resistance', 'v equals ir'],
            summary: 'For an ohmic component at fixed physical conditions, voltage across it is proportional to current through it.',
            intuition: 'Resistance describes how much voltage is needed to drive a given current through a component.',
            equations: ['V = IR', 'P = VI = I²R = V²/R'],
            units: ['V: volts (V)', 'I: amperes (A)', 'R: ohms (Ω)', 'P: watts (W)'],
            conditions: 'Ohm’s law is a model for ohmic behavior; some components have resistance that changes with voltage, temperature, or operating region.',
            example: 'A 4 Ω resistor with 12 V across it carries I = 12/4 = 3 A.',
            check: 'Use the voltage across the component, not automatically the source voltage.'
        },
        {
            id: 'series-parallel', subject: 'Electrical engineering', title: 'Series and parallel resistors',
            aliases: ['series resistors', 'parallel resistors', 'equivalent resistance', 'resistors in series', 'resistors in parallel'],
            summary: 'Series resistors share one current path; parallel resistors share the same two node voltages.',
            intuition: 'In series, each resistor adds another voltage drop. In parallel, current has additional paths to flow through.',
            equations: ['Rₛ = R₁ + R₂ + …', '1/Rₚ = 1/R₁ + 1/R₂ + …'],
            units: ['Resistance: ohms (Ω)'],
            conditions: 'Check the circuit topology: components are parallel only when both of their terminals connect to the same two nodes.',
            example: 'Two 6 Ω resistors in parallel have Rₚ = (1/6 + 1/6)⁻¹ = 3 Ω.',
            check: 'A passive parallel equivalent is smaller than the smallest branch resistance; a series equivalent is larger than each resistor.'
        },
        {
            id: 'kirchhoff', subject: 'Electrical engineering', title: "Kirchhoff's circuit laws",
            aliases: ['kirchhoffs laws', 'kirchhoffs current law', 'kirchhoffs voltage law', 'kcl', 'kvl', 'node law', 'loop law'],
            summary: 'Kirchhoff’s current law balances current at a node; Kirchhoff’s voltage law balances voltage changes around a closed loop.',
            intuition: 'Charge does not accumulate at an ideal circuit node in steady state, and energy balances as you travel around a closed loop.',
            equations: ['ΣIₙₒdₑ = 0', 'ΣVₗₒₒₚ = 0'],
            units: ['Current: amperes (A)', 'Voltage: volts (V)'],
            conditions: 'Choose consistent current directions and voltage polarities. A negative solved value means the actual direction is opposite your choice.',
            example: 'If 2 A enters a node and one outgoing branch carries 0.5 A, the other outgoing branch carries 1.5 A.',
            check: 'Write each branch current and polarity from the diagram before forming equations.'
        },
        {
            id: 'bernoulli', subject: 'Fluid mechanics', title: "Bernoulli's equation",
            aliases: ['bernoullis equation', 'bernoullis principle', 'bernoulli equation', 'pressure velocity elevation fluid'],
            summary: 'Along a streamline in ideal steady flow, pressure, kinetic, and elevation energy per unit volume sum to a constant.',
            intuition: 'If elevation is unchanged and speed increases, static pressure must decrease to keep the ideal-flow energy balance.',
            equations: ['p + ½ρv² + ρgz = constant'],
            units: ['p: pascals (Pa)', 'ρ: kg/m³', 'v: m/s', 'z: m'],
            conditions: 'Basic Bernoulli assumes steady, incompressible, inviscid flow along a streamline with no pump, turbine, or major losses between points.',
            example: 'At equal elevation, an ideal speed increase from 1 to 3 m/s in water gives a pressure decrease of ½·1000·(9−1) = 4000 Pa.',
            check: 'Real pipes lose mechanical energy to friction; use an extended energy equation when those losses matter.'
        },
        {
            id: 'continuity', subject: 'Fluid mechanics', title: 'Continuity equation',
            aliases: ['continuity equation', 'conservation of mass fluid', 'flow rate area velocity', 'mass flow rate'],
            summary: 'Mass flow rate is conserved through a streamtube when no mass is added, removed, or stored between sections.',
            intuition: 'If the same amount of fluid must pass through a narrower area each second, it must move faster there.',
            equations: ['ṁ = ρAv', 'A₁v₁ = A₂v₂ (steady incompressible flow)'],
            units: ['ṁ: kg/s', 'ρ: kg/m³', 'A: m²', 'v: m/s'],
            conditions: 'The simplified area–velocity form assumes steady incompressible flow and one inlet/outlet stream.',
            example: 'Halving a pipe area doubles average speed for the same incompressible volume flow rate.',
            check: 'For compressible flow, include density: ρ₁A₁v₁ = ρ₂A₂v₂.'
        },
        {
            id: 'reynolds', subject: 'Fluid mechanics', title: 'Reynolds number',
            aliases: ['reynolds number', 'laminar versus turbulent', 'flow regime', 'fluid flow regime'],
            summary: 'Reynolds number compares inertial effects with viscous effects in a flow.',
            intuition: 'A low value means viscosity smooths disturbances; a high value means momentum effects make disturbances more likely to grow.',
            equations: ['Re = ρvL/μ = vL/ν'],
            units: ['Re: dimensionless', 'ρ: kg/m³', 'μ: Pa·s', 'ν: m²/s'],
            conditions: 'Transition ranges depend on geometry and disturbances. For fully developed circular-pipe flow, laminar is commonly Re < about 2300; this is not a universal cutoff for every geometry.',
            example: 'For water with ν ≈ 1.0×10⁻⁶ m²/s, v = 1 m/s and pipe diameter 0.02 m give Re ≈ 20,000.',
            check: 'Use the characteristic length appropriate to the geometry; do not transfer the pipe threshold to external flow.'
        },
        {
            id: 'ideal-gas', subject: 'Thermodynamics', title: 'Ideal gas law',
            aliases: ['ideal gas law', 'pv equals nrt', 'equation of state ideal gas', 'gas pressure volume temperature'],
            summary: 'The ideal gas law relates pressure, volume, amount of gas, and absolute temperature.',
            intuition: 'More particles or a higher temperature increase pressure if the container volume is fixed; a larger volume lowers it if other values stay fixed.',
            equations: ['pV = nRT'],
            units: ['p: Pa', 'V: m³', 'n: mol', 'T: K', 'R = 8.314 J/(mol·K)'],
            conditions: 'Temperature must be in kelvins. The ideal-gas approximation works best at relatively low pressure and high temperature, away from condensation.',
            example: 'At fixed volume and amount, doubling absolute temperature doubles pressure.',
            check: 'Use absolute pressure, not gauge pressure, and absolute temperature.'
        },
        {
            id: 'first-law', subject: 'Thermodynamics', title: 'First law of thermodynamics',
            aliases: ['first law of thermodynamics', 'energy balance thermodynamics', 'internal energy heat work', 'thermodynamic energy balance'],
            summary: 'The first law is conservation of energy applied to a thermodynamic system.',
            intuition: 'Energy crossing the boundary as heat or work changes the energy stored inside the system.',
            equations: ['ΔU = Q − W (work done by the system is positive)'],
            units: ['ΔU, Q, W: joules (J)'],
            conditions: 'State the sign convention and whether changes in kinetic and potential energy are being included separately.',
            example: 'If 500 J of heat enters a closed system and it does 120 J of work, ΔU = 500 − 120 = 380 J.',
            check: 'Some textbooks take work done on the system as positive and write a plus sign instead; the physics is the same if signs are used consistently.'
        },
        {
            id: 'heat-transfer', subject: 'Thermodynamics', title: 'Modes of heat transfer',
            aliases: ['heat transfer', 'conduction convection radiation', 'conduction', 'convection', 'thermal radiation'],
            summary: 'Heat moves by conduction through matter, convection with fluid motion, and thermal radiation by electromagnetic waves.',
            intuition: 'Real systems often use more than one mode at a time: a hot wall can conduct heat through itself, convect to nearby air, and radiate to surrounding surfaces.',
            equations: ['Conduction: q̇ = −kA(dT/dx)', 'Convection: q̇ = hA(Tₛ − T∞)', 'Radiation: q̇ = εσA(Tₛ⁴ − Tₛᵤᵣᵣ⁴)'],
            units: ['Heat-transfer rate q̇: W', 'k: W/(m·K)', 'h: W/(m²·K)', 'Temperature in radiation relation: K'],
            conditions: 'These are common engineering models; use the appropriate geometry, boundary conditions, and material properties.',
            example: 'Insulation reduces conductive heat transfer by lowering effective thermal conductivity or increasing the conduction path length.',
            check: 'Radiation uses absolute temperature in kelvins and depends on the fourth power of temperature.'
        },
        {
            id: 'stress-strain', subject: 'Materials', title: 'Stress and strain',
            aliases: ['stress and strain', 'normal stress', 'engineering strain', 'stress strain curve'],
            summary: 'Stress is internal force per area; engineering strain is change in length divided by original length.',
            intuition: 'Stress describes the intensity of loading inside a material. Strain describes the relative deformation caused by that loading.',
            equations: ['σ = F/A', 'ε = ΔL/L₀'],
            units: ['σ: pascals (Pa)', 'ε: dimensionless', 'F: N', 'A: m²'],
            conditions: 'The simple formulas assume an axial load distributed uniformly over the cross-section; stress concentrations require more detailed analysis.',
            example: 'An elongation of 1 mm over a 1 m gauge length gives strain ε = 0.001/1 = 0.001.',
            check: 'Convert both lengths to the same unit before dividing.'
        },
        {
            id: 'hookes-law', subject: 'Materials', title: "Hooke's law",
            aliases: ['hookes law', 'linear elastic material', 'youngs modulus', 'young modulus'],
            summary: 'Within a material’s linear-elastic range, stress is proportional to strain.',
            intuition: 'A stiffer material needs more stress to produce the same strain. When the load is removed within this range, the material returns approximately to its original shape.',
            equations: ['σ = Eε'],
            units: ['σ and E: Pa', 'ε: dimensionless'],
            conditions: 'Use only within the linear-elastic range and for the appropriate loading mode and material model.',
            example: 'For E = 200 GPa and ε = 0.001, σ = 200 MPa in a uniaxial linear-elastic model.',
            check: 'Elastic behavior does not mean unlimited load; yielding or fracture can occur beyond the material’s limits.'
        },
        {
            id: 'quadratic', subject: 'Mathematics', title: 'Quadratic formula and discriminant',
            aliases: ['quadratic formula', 'discriminant', 'roots of a quadratic', 'quadratic equation'],
            summary: 'The quadratic formula solves any equation that can be written as ax² + bx + c = 0 with a ≠ 0.',
            intuition: 'The discriminant tells how many real x-intercepts the parabola has before the formula computes the roots.',
            equations: ['x = (−b ± √(b² − 4ac))/(2a)', 'D = b² − 4ac'],
            units: ['If x represents a physical quantity, its units must be consistent across the equation.'],
            conditions: 'First write the equation in standard form and identify a, b, and c, including zero coefficients.',
            example: 'For x² − 5x + 6 = 0, D = 1 and x = (5 ± 1)/2, giving x = 2 or 3.',
            check: 'D > 0 gives two real roots, D = 0 gives one repeated real root, and D < 0 gives a complex-conjugate pair.'
        },
        {
            id: 'derivative', subject: 'Mathematics', title: 'Derivative and power rule',
            aliases: ['derivative', 'differentiate', 'power rule calculus', 'rate of change'],
            summary: 'A derivative gives the instantaneous rate of change of a function with respect to its input.',
            intuition: 'It is the limiting slope of a secant line as two points on the curve move together.',
            equations: ['d(xⁿ)/dx = nxⁿ⁻¹'],
            units: ['Derivative units are output units divided by input units.'],
            conditions: 'The power rule applies term-by-term to powers of x; products, quotients, and composite functions need their corresponding rules.',
            example: 'If position is x(t) = 3t² metres, velocity is dx/dt = 6t m/s.',
            check: 'A derivative is a local rate or slope, not the total accumulated change.'
        },
        {
            id: 'integral', subject: 'Mathematics', title: 'Integral and accumulation',
            aliases: ['integral', 'integration', 'antiderivative', 'area under curve', 'power rule integration'],
            summary: 'An integral accumulates a quantity; an indefinite integral represents a family of antiderivatives.',
            intuition: 'Adding many small contributions approaches the total accumulated amount. Differentiation reverses integration when the functions are well behaved.',
            equations: ['∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)', '∫ₐᵇ f(x)dx = F(b) − F(a)'],
            units: ['Integral units are integrand units multiplied by input units.'],
            conditions: 'A definite integral is signed accumulation. It is not necessarily geometric area if the function is below the axis.',
            example: 'If velocity is 3 m/s for 4 s, displacement is ∫v dt = 12 m.',
            check: 'Include +C for an indefinite integral; do not add it to a definite numerical result.'
        },
        {
            id: 'stoichiometry', subject: 'Chemistry', title: 'Stoichiometry and mole ratios',
            aliases: ['stoichiometry', 'mole ratio', 'moles from mass', 'balanced chemical equation', 'limiting reactant'],
            summary: 'Stoichiometry uses a balanced reaction equation to relate amounts of reactants and products.',
            intuition: 'The coefficients in a balanced equation count relative numbers of particles, which become mole ratios at the macroscopic scale.',
            equations: ['n = m/M', 'n(product)/n(reactant) = coefficient ratio'],
            units: ['n: mol', 'm: g (if M is g/mol)', 'M: g/mol'],
            conditions: 'Balance the chemical equation first. For real reactions, account for limiting reactants, yield, and purity when relevant.',
            example: 'For 2H₂ + O₂ → 2H₂O, 2 mol H₂ can form 2 mol H₂O if enough O₂ is present.',
            check: 'Do not use mass ratios as mole ratios; convert through molar mass.'
        },
        {
            id: 'ph', subject: 'Chemistry', title: 'pH and hydrogen-ion concentration',
            aliases: ['ph', 'ph scale', 'calculate ph', 'hydrogen ion concentration', 'acidity ph'],
            summary: 'For dilute aqueous solutions under the usual introductory approximation, pH is the negative base-10 logarithm of hydrogen-ion concentration.',
            intuition: 'The logarithm means a one-unit pH change corresponds to a tenfold change in hydrogen-ion concentration.',
            equations: ['pH = −log₁₀[H⁺]'],
            units: ['[H⁺]: mol/L (M)', 'pH: dimensionless'],
            conditions: 'The concentration approximation is most appropriate for dilute solutions; rigorous pH is defined through hydrogen-ion activity.',
            example: 'If [H⁺] = 1×10⁻⁵ mol/L, pH ≈ 5.',
            check: 'A lower pH means higher acidity in the usual aqueous context.'
        },
        {
            id: 'rocket-equation', subject: 'Aerospace Engineering', title: 'Tsiolkovsky rocket equation',
            aliases: ['rocket equation', 'tsiolkovsky', 'delta-v', 'delta v', 'rocket propulsion', 'mass ratio', 'specific impulse'],
            summary: 'The rocket equation relates the velocity change a rocket can achieve to its exhaust velocity and the ratio of initial to final mass.',
            intuition: 'To go faster, you either need a more efficient engine (higher exhaust velocity) or you need to carry more propellant relative to your dry mass. The relationship is logarithmic, so doubling delta-v requires exponentially more propellant.',
            equations: ['\u0394v = v_e \u00D7 ln(m_0 / m_f)', '\u0394v = I_sp \u00D7 g_0 \u00D7 ln(m_0 / m_f)'],
            units: ['\u0394v: m/s', 'v_e: m/s', 'I_sp: seconds', 'g_0: 9.81 m/sA�', 'm_0, m_f: kg'],
            conditions: 'Assumes impulsive burn, no gravity or drag losses, constant exhaust velocity, and vacuum conditions.',
            example: 'A rocket with m_0 = 500,000 kg, m_f = 100,000 kg, and I_sp = 300 s achieves \u0394v = 300 \u00D7 9.81 \u00D7 ln(5) \u2248 4,720 m/s.',
            check: 'The mass ratio m_0/m_f must be greater than 1. Delta-v grows logarithmically, so diminishing returns set in quickly.'
        },
        {
            id: 'orbital-mechanics', subject: 'Aerospace Engineering', title: 'Circular orbital mechanics',
            aliases: ['orbital velocity', 'orbital period', 'satellite orbit', 'circular orbit', 'kepler', 'hohmann'],
            summary: 'A satellite in circular orbit balances gravity pulling inward with the centrifugal effect of its tangential velocity.',
            intuition: 'Higher orbits move more slowly but take longer to complete. To raise your orbit, you actually add energy, which paradoxically slows your speed.',
            equations: ['v = \u221A(GM / r)', 'T = 2\u03C0 \u00D7 \u221A(r\u00B3 / GM)', 'v_e = \u221A(2GM / r)'],
            units: ['v: m/s', 'T: seconds', 'r: metres', 'GM: mA3/sA2'],
            conditions: 'Assumes a spherical central body, no atmospheric drag, and a two-body problem.',
            example: 'At 400 km altitude, orbital velocity is about 7,670 m/s and period is about 92 minutes.',
            check: 'Escape velocity is \u221A2 (\u2248 1.414) times circular orbital velocity at the same radius.'
        },
        {
            id: 'lift-drag', subject: 'Aerospace Engineering', title: 'Lift and drag forces',
            aliases: ['lift', 'drag', 'lift coefficient', 'drag coefficient', 'aerodynamics', 'wing lift', 'airfoil'],
            summary: 'Lift and drag both scale with dynamic pressure (\u00BD\u03C1v\u00B2), reference area, and their respective dimensionless coefficients.',
            intuition: 'Lift acts perpendicular to the flow and holds the aircraft up; drag acts parallel and opposes motion. Streamlining reduces drag coefficient dramatically.',
            equations: ['L = \u00BD \u03C1 v\u00B2 S C_L', 'D = \u00BD \u03C1 v\u00B2 S C_D'],
            units: ['L, D: newtons (N)', '\u03C1: kg/mA3', 'v: m/s', 'S: mA2', 'C_L, C_D: dimensionless'],
            conditions: 'Assumes incompressible flow and constant coefficients. Compressibility becomes important above Mach ~0.3.',
            example: 'An aircraft with S = 20 mA2, v = 70 m/s, C_L = 0.5, and \u03C1 = 1.225 kg/mA3 generates L \u2248 30,000 N of lift.',
            check: 'Lift and drag both scale with velocity squared \u2014 doubling speed quadruples both forces.'
        },
        {
            id: 'mach-number', subject: 'Aerospace Engineering', title: 'Mach number and compressible flow',
            aliases: ['mach', 'mach number', 'compressible flow', 'speed of sound', 'supersonic', 'subsonic', 'transonic'],
            summary: 'Mach number is the ratio of object speed to the local speed of sound. It governs compressibility effects and shock wave formation.',
            intuition: 'Below Mach 1, air has time to move out of the way. Near and above Mach 1, pressure disturbances pile up into shock waves, dramatically changing drag and heating.',
            equations: ['M = v / a', 'a = \u221A(\u03B3 \u00D7 R \u00D7 T)'],
            units: ['M: dimensionless', 'v: m/s', 'a: m/s', 'T: kelvin'],
            conditions: 'Speed of sound depends on local temperature: a = \u221A(1.4 \u00D7 287 \u00D7 T) for air.',
            example: 'At sea level (15\u00B0C), a \u2248 343 m/s. An aircraft at 250 m/s is flying at Mach 0.73 \u2014 transonic.',
            check: 'Regimes: M < 1 subsonic, M \u2248 1 transonic, 1 < M < 5 supersonic, M > 5 hypersonic.'
        },
        {
            id: 'standard-atmosphere', subject: 'Aerospace Engineering', title: 'Standard atmosphere model',
            aliases: ['standard atmosphere', 'atmospheric model', 'density altitude', 'pressure altitude', 'isa'],
            summary: 'The International Standard Atmosphere models how temperature, pressure, and density change with altitude under average conditions.',
            intuition: 'As you climb, air gets thinner and colder. This reduces engine thrust, lift, and the speed of sound \u2014 critical for aircraft and rocket performance.',
            equations: ['T = 288.15 \u2212 0.0065 \u00D7 h (troposphere, h \u2264 11 km)', 'P = 101325 \u00D7 (T / 288.15)^5.25588', '\u03C1 = P / (287 \u00D7 T)'],
            units: ['T: kelvin', 'P: pascals', '\u03C1: kg/mA3', 'h: metres'],
            conditions: 'Valid for 0\u201320 km in this simplified model. Real atmosphere varies with weather, season, and location.',
            example: 'At 10 km altitude: T \u2248 223 K, P \u2248 26.5 kPa, \u03C1 \u2248 0.413 kg/mA3 \u2014 about one third of sea-level density.',
            check: 'Density drops roughly exponentially with altitude, which is why aircraft cruise high: less drag, better fuel efficiency.'
        },
        {
            id: 'hohmann-transfer', subject: 'Aerospace Engineering', title: 'Hohmann transfer',
            aliases: ['hohmann transfer', 'orbit transfer', 'transfer orbit', 'raise orbit', 'lower orbit', 'orbital transfer'],
            summary: 'A Hohmann transfer is the most fuel-efficient way to move between two circular orbits using two engine burns.',
            intuition: 'To go higher, you fire prograde to enter an elliptical transfer ellipse, then fire again at the high point to circularize. Going lower reverses the burns.',
            equations: ['Δv₁ = √(GM)(√(2r₂/(r₁+r₂)) - 1/√r₁)', 'Δv₂ = √(GM)(1/√r₂ - √(2r₁/(r₁+r₂)))', 'Δv_total = Δv₁ + Δv₂'],
            units: ['Δv: m/s', 'r₁, r₂: metres', 'GM: m³/s²'],
            conditions: 'Assumes impulsive burns, coplanar circular orbits, and Earth (or another single body) as the central mass.',
            example: 'Transferring from 400 km to 800 km altitude requires roughly 60-80 m/s per burn depending on exact radii.',
            check: 'A Hohmann transfer takes half an ellipse period to reach the destination orbit.'
        },
        {
            id: 'thrust-to-weight', subject: 'Aerospace Engineering', title: 'Thrust-to-weight ratio',
            aliases: ['thrust to weight', 'thrust-weight ratio', 'twr', 'liftoff capability'],
            summary: 'Thrust-to-weight ratio is thrust divided by vehicle weight. It determines whether a rocket can lift off.',
            intuition: 'If thrust exceeds weight, the rocket accelerates upward. If thrust is less than weight, it stays on the pad no matter how long the engine runs.',
            equations: ['TWR = F_thrust / (m × g₀)', 'TWR > 1: liftoff possible', 'TWR < 1: cannot lift off'],
            units: ['TWR: dimensionless', 'F_thrust: newtons (N)', 'm: kilograms (kg)', 'g₀: 9.81 m/s²'],
            conditions: 'Assumes sea-level standard gravity and thrust measured at sea level.',
            example: 'A rocket with 1,000,000 N thrust and 80,000 kg mass has TWR = 1,000,000 / (80,000 × 9.81) ≈ 1.27 — it can lift off.',
            check: 'Most launch vehicles have TWR between 1.2 and 1.5 at liftoff.'
        },
        {
            id: 'ballistic-coefficient', subject: 'Aerospace Engineering', title: 'Ballistic coefficient',
            aliases: ['ballistic coefficient', 'bc', 'ballistic coef', 'reentry coefficient'],
            summary: 'Ballistic coefficient = mass / (drag coefficient × reference area). It measures how well an object penetrates the atmosphere.',
            intuition: 'A high BC object (heavy, small, streamlined) slows less in the atmosphere — important for reentry vehicles and projectiles.',
            equations: ['BC = m / (C_D × S)'],
            units: ['BC: kg/m²', 'm: kilograms (kg)', 'C_D: dimensionless', 'S: m²'],
            conditions: 'Assumes constant drag coefficient and reference area.',
            example: 'A 5,000 kg vehicle with C_D = 0.3 and area 10 m² has BC = 5,000 / 3 ≈ 1,667 kg/m².',
            check: 'Higher BC = better atmospheric penetration = less deceleration during reentry.'
        },
        {
            id: 'load-factor', subject: 'Aerospace Engineering', title: 'Load factor in turns',
            aliases: ['load factor', 'g force', 'g-force', 'bank angle', 'level turn', 'apparent weight'],
            summary: 'Load factor n = lift / weight = 1 / cos(bank angle). In a level turn, lift must support both weight and centripetal force.',
            intuition: 'The steeper the bank, the more lift is needed just to stay level, so apparent weight increases. At 60° bank, you feel 2g.',
            equations: ['n = 1 / cos(φ)', 'n = L / W'],
            units: ['n: dimensionless (g)', 'φ: degrees'],
            conditions: 'Assumes a level, coordinated turn at constant altitude.',
            example: 'At 45° bank, n = 1 / cos(45°) ≈ 1.41 g. At 60° bank, n = 1 / cos(60°) = 2.0 g.',
            check: 'Load factor and energy share units but are different physical quantities.'
        },
        {
            id: 'specific-orbital-energy', subject: 'Aerospace Engineering', title: 'Specific orbital energy',
            aliases: ['specific orbital energy', 'orbital energy', 'energy of orbit', 'binding energy'],
            summary: 'Specific orbital energy = kinetic energy per unit mass minus gravitational potential energy per unit mass.',
            intuition: 'Negative energy means you are gravitationally bound (elliptical/circular orbit). Zero means escape trajectory. Positive means hyperbolic escape with excess speed.',
            equations: ['ε = v²/2 - μ/r', 'ε < 0: bound orbit', 'ε = 0: parabolic escape', 'ε > 0: hyperbolic escape'],
            units: ['ε: MJ/kg', 'v: m/s', 'μ: m³/s²', 'r: metres'],
            conditions: 'Assumes two-body problem, no atmospheric drag, instantaneous state.',
            example: 'At LEO (400 km, v ≈ 7,670 m/s), ε ≈ -30 MJ/kg — firmly bound to Earth.',
            check: 'Escape velocity is when ε = 0, which gives v = √(2μ/r).'
        }
    ];

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
    }

    const INDEX = TOPICS.map((topic) => ({
        topic,
        aliases: [topic.title, ...topic.aliases].map(normalize).filter(Boolean)
    }));

    function findTopic(question) {
        const text = ` ${normalize(question)} `;
        let best = null;
        let bestScore = 0;
        for (const item of INDEX) {
            let score = 0;
            for (const alias of item.aliases) {
                if (text.includes(` ${alias} `)) score = Math.max(score, alias.length + alias.split(' ').length * 2);
            }
            if (score > bestScore) {
                best = item.topic;
                bestScore = score;
            }
        }
        return best;
    }

    function answer(question) {
        if (typeof question !== 'string' || !question.trim()) {
            return { success: false, mode: 'theory', error: 'Ask a theory question, such as “Why does pressure drop when fluid speed increases?”' };
        }
        const topic = findTopic(question);
        if (!topic) {
            return {
                success: false,
                mode: 'theory',
                error: 'I don’t have an explanation for that topic in the current library yet. Try asking about mechanics, circuits, fluids, thermodynamics, materials, introductory calculus, or chemistry, and name the concept you want explained.'
            };
        }
        return {
            success: true,
            mode: 'theory',
            topicId: topic.id,
            subject: topic.subject,
            title: topic.title,
            summary: topic.summary,
            intuition: topic.intuition,
            equations: topic.equations.slice(),
            units: topic.units.slice(),
            conditions: topic.conditions,
            example: topic.example,
            check: topic.check
        };
    }

    window.UniStepTheory = Object.freeze({ answer, topics: () => TOPICS.map(({ id, subject, title }) => ({ id, subject, title })) });
})();
