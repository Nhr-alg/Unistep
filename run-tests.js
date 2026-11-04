/**
 * Run the golden solver suite in Node.
 *
 * The browser loads these files as classic scripts and shares state through
 * `window`. This runner gives them the same tiny surface in a vm context, so
 * the exact production solver files are tested without a bundler or a browser.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const FILES = ['calculator.js', 'planner.js', 'solver_engine.js', 'theory_engine.js', 'tests.js', 'validator.js'];

const context = vm.createContext({ window: {}, console });
for (const file of FILES) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(source, context, { filename: file });
}

(async () => {
    const results = await context.window.Validator.runFullSuite();
    const validator = context.window.Validator;
    const strictScalarCheck = !validator.verifyResult({ success: true, result: [5, 999] }, 5)
        && validator.verifyResult({ success: true, result: 5 }, 5);
    if (!strictScalarCheck) {
        console.error('FAIL  validator_scalar_shape');
        process.exit(1);
    }
    console.log('✅ PASS  validator_scalar_shape');

    if (results.error) {
        console.error(results.error);
        process.exit(1);
    }

    for (const detail of results.details) {
        console.log(`${detail.status}  ${detail.id}`);
        if (detail.status.includes('FAIL')) {
            console.log(`       input:    ${detail.input}`);
            console.log(`       expected: ${detail.expected}`);
            console.log(`       actual:   ${detail.actual}`);
        }
    }

    const total = results.passed + results.failed + results.skipped;
    console.log(`\n${results.passed}/${total} golden cases passed.`);
    if (results.skipped) console.log(`${results.skipped} skipped.`);

    const theoryCases = [
        ['Explain Newton\'s second law', 'newtons-second-law'],
        ['Why does pressure drop when fluid speed increases in Bernoulli\'s equation?', 'bernoulli'],
        ['What is the difference between stress and strain?', 'stress-strain'],
        ['Explain Kirchhoff\'s laws', 'kirchhoff'],
        ['How do I use the quadratic formula?', 'quadratic'],
        ['Explain conservation of momentum', 'momentum'],
        ['What does Reynolds number tell me?', 'reynolds'],
        ['What is pH?', 'ph']
    ];
    let theoryFailed = 0;
    for (const [question, expectedId] of theoryCases) {
        const answer = context.window.UniStepTheory.answer(question);
        const passed = answer.success && answer.topicId === expectedId;
        if (!passed) theoryFailed++;
        console.log(`${passed ? '✅ PASS' : '❌ FAIL'}  theory_${expectedId}`);
        if (!passed) console.log(`       got: ${answer.topicId || answer.error}`);
    }
    const topics = context.window.UniStepTheory.topics();
    for (const topic of topics) {
        const answer = context.window.UniStepTheory.answer(topic.title);
        const complete = answer.success
            && answer.topicId === topic.id
            && answer.summary
            && answer.intuition
            && answer.equations.length
            && answer.conditions
            && answer.example
            && answer.check;
        if (!complete) theoryFailed++;
        console.log(`${complete ? '✅ PASS' : '❌ FAIL'}  theory_catalog_${topic.id}`);
    }
    const fallback = context.window.UniStepTheory.answer('Explain a topic not in this lesson library');
    const fallbackPassed = !fallback.success && /current library/i.test(fallback.error);
    if (!fallbackPassed) theoryFailed++;
    console.log(`${fallbackPassed ? '✅ PASS' : '❌ FAIL'}  theory_unknown_topic_fallback`);
    const theoryTotal = theoryCases.length + topics.length + 1;
    console.log(`\nTheory: ${theoryTotal - theoryFailed}/${theoryTotal} checks passed across ${topics.length} catalog topics.`);
    process.exit(results.failed === 0 && theoryFailed === 0 ? 0 : 1);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
