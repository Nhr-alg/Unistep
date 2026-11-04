/**
 * UniStep MultiStepPlanner
 *
 * VERSION: 2.0 (Stress-Tested Symbolic Planner)
 * Designed to handle a wide range of shapes and symbolic ratios.
 */

class MultiStepPlanner {
    plan(input) {
        const text = input.toLowerCase();
        const plan = [];

        // 1. Detection for Rolling Motion / Ratios
        const isRolling = text.includes("rolls without slipping") || text.includes("pure rolling");
        const isRatio = /\bratio\b|\bfraction\b/.test(text);
        const isKineticEnergy = /\bkinetic energy\b/.test(text) || /\bke\b/.test(text);

        if (isRolling) {
            plan.push({ id: 'phys_rot_rolling', reason: "Pure rolling condition (v = ωR) is required." });
        }

        // 2. Shape Detection (Crucial for Moment of Inertia)
        if (text.includes("solid sphere")) {
            plan.push({ id: 'phys_rot_mi', shape: 'solid_sphere', reason: "Using I = 2/5 MR^2 for solid sphere." });
        } else if (text.includes("hollow sphere") || text.includes("thin spherical shell")) {
            plan.push({ id: 'phys_rot_mi', shape: 'hollow_sphere', reason: "Using I = 2/3 MR^2 for hollow sphere." });
        } else if (text.includes("solid cylinder") || text.includes("disc")) {
            plan.push({ id: 'phys_rot_mi', shape: 'solid_cylinder', reason: "Using I = 1/2 MR^2 for cylinder/disc." });
        } else if (text.includes("thin ring") || text.includes("hoop")) {
            plan.push({ id: 'phys_rot_mi', shape: 'thin_ring', reason: "Using I = MR^2 for thin ring." });
        }

        // 3. Energy Chain
        if (isKineticEnergy || isRatio) {
            plan.push({ id: 'phys_rot_ke', reason: "Calculate Rotational KE (Kr = 1/2 Iω^2)." });
            plan.push({ id: 'phys_trans_ke', reason: "Calculate Translational KE (Kt = 1/2 mv^2)." });
            plan.push({ id: 'phys_rot_total_ke', reason: "Calculate Total KE (K = Kt + Kr)." });
        }

        return plan;
    }
}

window.Planner = new MultiStepPlanner();
