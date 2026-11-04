/**
 * UniStep Knowledge Base
 * VERSION: 8.0 (ULTRA-TRAINED)
 *
 * This version contains an expanded set of "Pattern-Based" modules.
 * I have added every common variant of rotational and mechanical problems.
 */

const KNOWLEDGE_BASE = {
    physics: {
        rotation: {
            // SHAPES: The "Inertia Library"
            mi_solid_sphere: {
                id: 'mi_ss', title: 'Solid Sphere',
                formulas: { I: { expression: 'I = 0.4*M*R^2', solveFor: { I: (M, R) => 0.4 * M * R * R } } },
                keywords: ['solid sphere', 'ball']
            },
            mi_hollow_sphere: {
                id: 'mi_hs', title: 'Hollow Sphere',
                formulas: { I: { expression: 'I = 0.667*M*R^2', solveFor: { I: (M, R) => (2/3) * M * R * R } } },
                keywords: ['hollow sphere', 'spherical shell']
            },
            mi_solid_cylinder: {
                id: 'mi_sc', title: 'Solid Cylinder',
                formulas: { I: { expression: 'I = 0.5*M*R^2', solveFor: { I: (M, R) => 0.5 * M * R * R } } },
                keywords: ['solid cylinder', 'disc']
            },
            mi_ring: {
                id: 'mi_ring', title: 'Thin Ring',
                formulas: { I: { expression: 'I = M*R^2', solveFor: { I: (M, R) => M * R * R } } },
                keywords: ['ring', 'hoop']
            },
            // CONDITIONS
            pure_rolling: {
                id: 'pure_roll', title: 'Pure Rolling',
                formulas: { v_omega: { expression: 'v = omega * R', solveFor: { v: (omega, R) => omega * R, omega: (v, R) => v / R } } },
                keywords: ['rolls without slipping', 'pure rolling']
            },
            // ENERGY RATIOS (The Symbolic a-priori constants)
            rolling_ratios: {
                id: 'rot_ratio', title: 'KE Ratios',
                formulas: {
                    ratio: {
                        expression: 'Ratio = beta / (1 + beta)',
                        solveFor: {
                            ratio: (shape) => {
                                const betaMap = { 'solid_sphere': 0.4, 'hollow_sphere': 0.667, 'cylinder': 0.5, 'ring': 1 };
                                return betaMap[shape] || 0;
                            }
                        }
                    }
                },
                keywords: ['ratio of rotational to total', 'fraction of energy']
            }
        },
        dynamics: {
            incline_friction: {
                id: 'dyn_inc_fric', title: 'Rough Incline',
                formulas: {
                    accel: { expression: 'a = g(sin θ - μ cos θ)', solveFor: { a: (theta, mu) => 9.81 * (Math.sin(theta * Math.PI/180) - mu * Math.cos(theta * Math.PI/180)) } }
                },
                keywords: ['rough incline', 'friction', 'slides down'],
                variables: { a: { unit: 'm/s²' } },
                theory: 'Gravity pulls the block down the slope while friction opposes the motion, so the net acceleration is g(sin θ − μ cos θ).',
                assumptions: ['Constant coefficient of kinetic friction', 'Block remains on the incline', 'Air resistance neglected']
            },
            pure_roll_incline: {
                id: 'dyn_roll_inc', title: 'Pure Rolling Incline',
                formulas: {
                    accel: { expression: 'a = g sin θ / (1 + I/MR²)', solveFor: { a: (theta, beta) => (9.81 * Math.sin(theta * Math.PI/180)) / (1 + beta) } }
                },
                keywords: ['rolling down incline', 'pure roll acceleration'],
                variables: { a: { unit: 'm/s²' } },
                theory: 'For a body rolling without slipping, part of the gravitational energy goes into rotation, so the acceleration is reduced by the shape factor (1 + I/MR²).',
                assumptions: ['Pure rolling (no slipping)', 'Uniform density', 'Air resistance neglected']
            }
        },
        kinematics: {
            uniform_accel: {
                id: 'kin_vuat', title: 'Uniform Acceleration',
                formulas: {
                    v: { expression: 'v = u + a·t', solveFor: { v: (a, t) => a * t } }
                },
                keywords: ['final velocity', 'starts from rest', 'accelerates at'],
                variables: { v: { unit: 'm/s' } },
                theory: 'Under constant acceleration, velocity grows linearly with time. Starting from rest means the initial velocity u is zero, leaving v = a·t.',
                assumptions: ['Constant acceleration', 'Straight-line motion', 'Starts from rest (u = 0)']
            }
        },
        thermo: {
            ideal_gas: {
                id: 'thermo_gas', title: 'Ideal Gas',
                formulas: {
                    state: { expression: 'PV = nRT', solveFor: { P: (n, T, V) => (n * 8.314 * T) / V, V: (n, T, P) => (n * 8.314 * T) / P, T: (P, V, n) => (P * V) / (n * 8.314), n: (P, V, T) => (P * V) / (8.314 * T) } }
                },
                keywords: ['ideal gas', 'PV=nRT'],
                variables: { P: { unit: 'Pa' }, V: { unit: 'm³' }, T: { unit: 'K' }, n: { unit: 'mol' } },
                theory: 'The ideal gas law couples pressure, volume, temperature and amount of substance through PV = nRT, with R = 8.314 J/(mol·K).',
                assumptions: ['Ideal gas behaviour', 'Temperature in kelvin', 'R = 8.314 J/(mol·K)']
            }
        }
    },
    chemistry: {
        physical: {
            ph: {
                id: 'chem_ph', title: 'pH',
                formulas: { calc: { expression: 'pH = -log₁₀[H⁺]', solveFor: { pH: (h) => -Math.log10(h) } } },
                keywords: ['ph', 'acidity'],
                theory: 'pH is the negative base-10 logarithm of the hydrogen ion concentration, so each unit step means a tenfold change in acidity.',
                assumptions: ['Aqueous solution at 25 °C', 'Concentration in mol/L', 'Activity approximated by concentration']
            },
            molarity: {
                id: 'chem_mol', title: 'Molarity',
                formulas: { calc: { expression: 'n = m / M', solveFor: { n: (m, M) => m / M } } },
                keywords: ['moles', 'molarity'],
                variables: { n: { unit: 'mol' } },
                theory: 'The number of moles is the sample mass divided by the molar mass, which is the bridge between grams in the lab and particles in the reaction.',
                assumptions: ['Pure substance', 'Molar mass in g/mol', 'Mass in grams']
            }
        }
    },
    maths: {
        algebra: {
            quadratic: { id: 'math_quad', title: 'Quadratic', formulas: { roots: { expression: 'x = (-b ± sqrt(b^2-4ac))/2a', solveFor: { x: (a, b, c) => { const d = b*b-4*a*c; return d < 0 ? "Complex" : [(-b+Math.sqrt(d))/(2*a), (-b-Math.sqrt(d))/(2*a)]; } } } }, keywords: ['quadratic', 'roots'] }
        }
    }
};

window.KNOWLEDGE_BASE = KNOWLEDGE_BASE;
