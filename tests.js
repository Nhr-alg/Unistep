/**
 * UniStep Test Suite (Golden Set)
 *
 * Every entry is a problem the engine must answer correctly. When a solver
 * module is added, add a case here first — a family without a test is a
 * family that will silently rot.
 */

const TEST_SUITE = [
    // ---------------------------------------------------------- rotation
    { id: "phys_rot_001", text: "A solid sphere rolls without slipping. Find the ratio of rotational KE to total KE.", expected: "2/7", domain: "physics", type: "symbolic_ratio" },
    { id: "phys_rot_002", text: "A hollow sphere rolls without slipping. Find the ratio of rotational KE to total KE.", expected: "2/5", domain: "physics", type: "symbolic_ratio" },
    { id: "phys_rot_003", text: "A solid cylinder rolls without slipping. Find the ratio of rotational KE to total KE.", expected: "1/3", domain: "physics", type: "symbolic_ratio" },
    { id: "phys_rot_004", text: "A thin ring rolls without slipping. Find the ratio of rotational KE to total KE.", expected: "1/2", domain: "physics", type: "symbolic_ratio" },

    // -------------------------------------------------------- kinematics
    { id: "phys_kin_001", text: "A car starts from rest and accelerates at 2 m/s^2 for 8 seconds. Find the final velocity.", expected: 16, domain: "physics", type: "numerical" },
    { id: "phys_kin_002", text: "Find the acceleration of a block sliding down a rough incline at 30 degrees with friction coefficient 0.", expected: 4.905, domain: "physics", type: "numerical" },
    { id: "phys_proj_001", text: "A projectile is launched at 20 m/s at 30 degrees. Find the range.", expected: "35.3119", domain: "physics", type: "symbolic" },
    { id: "phys_proj_002", text: "A projectile is launched at 20 m/s at 30 degrees. Find the maximum height.", expected: "5.09684", domain: "physics", type: "symbolic" },

    // ------------------------------------------------------------ chemistry
    { id: "chem_sto_001", text: "Find the moles of a substance with mass 10g and molar mass 20g/mol.", expected: 0.5, domain: "chemistry", type: "numerical" },
    { id: "chem_ph_001", text: "Calculate the pH of a solution with hydrogen concentration 1e-5", expected: 5, domain: "chemistry", type: "numerical" },

    // --------------------------------------------------------------- thermo
    { id: "phys_gas_001", text: "Calculate the pressure of 2 mol of an ideal gas at 300 K in 0.05 m3", expected: 99768, domain: "physics", type: "numerical" },
    { id: "phys_heat_001", text: "Find the heat required to raise 2 kg of water by 10 K", expected: "83.72", domain: "physics", type: "symbolic" },

    // -------------------------------------------------------------- algebra
    { id: "math_quad_001", text: "Find the roots of x^2 + 5x + 6 = 0", expected: "x = -2, x = -3", domain: "maths", type: "symbolic" },
    { id: "math_quad_002", text: "What are the roots of the equation x square plus 10x plus 7 = 0?", expected: "x = -0.757359, x = -9.24264", domain: "maths", type: "symbolic" },
    { id: "math_quad_003", text: "Solve 2x^2 - 3x + 5 = 0", expected: "Complex Roots", domain: "maths", type: "symbolic" },
    { id: "math_quad_004", text: "Find the roots of x^2 = 4", expected: "x = 2, x = -2", domain: "maths", type: "symbolic" },
    { id: "math_quad_005", text: "Find the roots of x^2 - 5x = -6", expected: "x = 3, x = 2", domain: "maths", type: "symbolic" },
    { id: "math_quad_006", text: "Find the roots of x^2 + 10000000000000000x + 1 = 0", expected: "x = -1e-16, x = -10000000000000000", domain: "maths", type: "symbolic" },
    { id: "math_lin_001", text: "Solve 3x - 7 = 11", expected: "x = 6", domain: "maths", type: "symbolic" },
    { id: "math_lin_002", text: "Solve x + 7 = 0", expected: "x = -7", domain: "maths", type: "symbolic" },
    { id: "math_sys_001", text: "Solve the system 2x + 3y = 8, x - y = 1", expected: "x = 2.2, y = 1.2", domain: "maths", type: "symbolic" },

    // ------------------------------------------------------------- calculus
    { id: "math_calc_001", text: "Find the derivative of 3x^3 + 2x^2 - 5x + 1", expected: "9x^2 + 4x − 5", domain: "maths", type: "symbolic" },
    { id: "math_calc_002", text: "Find the derivative of x^2", expected: "2x", domain: "maths", type: "symbolic" },
    { id: "math_int_001", text: "Find the integral of 3x^2 + 2x", expected: "x^3 + x^2 + C", domain: "maths", type: "symbolic" },
    { id: "math_int_002", text: "Evaluate the integral of 2x + 3 from 0 to 2", expected: "10", domain: "maths", type: "symbolic" },

    // ------------------------------------------------------ linear algebra
    { id: "math_mat_001", text: "Find the determinant of [[1,2],[3,4]]", expected: "-2", domain: "maths", type: "symbolic" },
    { id: "math_mat_002", text: "Find the determinant of [[2,3],[1,4]]", expected: "5", domain: "maths", type: "symbolic" },
    { id: "math_mat_003", text: "Find the inverse of [[4,7],[2,6]]", expected: "[ 0.6, -0.7 ], [ -0.2, 0.4 ]", domain: "maths", type: "symbolic" },

    // --------------------------------------------------------------- units
    { id: "unit_001", text: "Convert 90 km/h to m/s", expected: "25", domain: "physics", type: "symbolic" },
    { id: "unit_002", text: "Convert 100 °C to °F", expected: "212", domain: "physics", type: "symbolic" },
    { id: "unit_003", text: "Convert 5 km to m", expected: "5000", domain: "physics", type: "symbolic" },

    // ------------------------------------------------------------ circuits
    { id: "elec_001", text: "A voltage of 12 V across a resistance of 4 ohm. Find the current.", expected: "3", domain: "physics", type: "symbolic" },
    { id: "elec_002", text: "Two resistors 4 ohm and 6 ohm in parallel", expected: "2.4", domain: "physics", type: "symbolic" },
    { id: "elec_003", text: "Three resistors 4 ohm in series", expected: "12", domain: "physics", type: "symbolic" },

    // ----------------------------------------------------------- materials
    { id: "mat_001", text: "A force of 20000 N acts on an area of 0.00007854 m2. Find the stress.", expected: "254.647", domain: "physics", type: "symbolic" },
    { id: "mat_002", text: "Find the strain for an elongation of 2 mm over a length of 2 m", expected: "0.001", domain: "physics", type: "symbolic" },

    // -------------------------------------------------------------- fluids
    { id: "fluid_001", text: "Find the Reynolds number for water at 2 m/s in a pipe of diameter 0.05 m", expected: "99800", domain: "physics", type: "symbolic" },
    { id: "fluid_002", text: "Using Bernoulli, water flows at v1 = 1 m/s and v2 = 3 m/s. Find the pressure drop.", expected: "4", domain: "physics", type: "symbolic" }
];

window.TEST_SUITE = TEST_SUITE;
