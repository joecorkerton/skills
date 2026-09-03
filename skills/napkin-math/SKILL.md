---
name: napkin-math
description: Estimate the best-case order-of-magnitude latency, throughput, or capacity of a software or systems scenario from first principles. Use for back-of-the-envelope performance questions, feasibility checks, capacity planning, or prompts such as “how fast could this be?”, “can this handle the load?”, and “what is the theoretical limit?”.
---

# Napkin Math

Produce an optimistic but physically credible bound. Treat “best case” as avoidable overhead removed while irreducible work and finite parallelism remain. A throughput or capacity bound is an upper bound; a latency or resource-requirement bound is a lower bound.

## Process

1. **Frame one result.** Choose the requested metric, its unit, and whether higher or lower is better. Reduce the scenario to at most six material assumptions. Ask for an input only when plausible values could change the exponent; otherwise choose an optimistic plausible value and label it. This step is complete when the target can be written as a formula with unit-bearing inputs.

2. **Select baselines.** Read [the base numbers](references/base-numbers.md) and map each irreducible stage to a latency, throughput, or operation rate. Prefer a benchmark supplied by the user when it represents the scenario more directly. Keep latency and throughput estimates independent because the source intentionally rounds them separately. This step is complete when every numeric constant has a source or is explicitly marked as an assumption.

3. **Write the calculation as a throwaway script.** Create a scenario-specific Python script under `${TMPDIR:-/tmp}` and run it with `python3`. Put units in variable names, define binary and decimal unit constants in code, and make the script perform every conversion and calculation—including apparently trivial arithmetic. Model serial latency with sums, parallel latency with the critical path, and steady-state pipeline throughput with the slowest stage. Cap parallel work by the stated workers and shared bandwidth. Have the script print:
   - every input and important intermediate value with units;
   - the final value in a useful unit and scientific notation;
   - `log10(result)`, its decade, and the nearest power of ten after asserting that the final result is positive and finite;
   - the limiting stage or resource;
   - a 10× sensitivity result for each assumption whose uncertainty could change the answer.

   Fail loudly on non-positive, non-finite, or dimensionally nonsensical inputs and derived results. Do not calculate values in prose or report a computed number that did not appear in the script's output. Keep the script out of the product and repository; it is evidence for this estimate, not production code. This step is complete when the command succeeds and its stdout contains all reported numbers.

4. **Challenge the bound.** Check that no irreducible stage is missing, parallelism is attainable, startup latency is not confused with transfer time, and a shared resource is not counted once per worker. If a correction is needed, edit and rerun the script rather than adjusting the result mentally. This step is complete when the named bottleneck agrees with the formula and the result remains physically plausible.

5. **Report the estimate.** Lead with `Best case: ≈10^n <unit>` and the more readable script result. Then show the formula, bottleneck, assumptions, cited base-number rows, and sensitivity conclusion. State what reality will add—contention, queues, protocol overhead, retries, skew, or redundancy—without turning the optimistic estimate into a production SLO. Include the throwaway script path and exact command so the calculation is auditable.
