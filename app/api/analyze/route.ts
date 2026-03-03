import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PXO_STEPS = [
  {
    id: 0,
    title: "Problem Hypothesis",
    subtitle: "Before Empathy",
    focus: `Generate the Problem Hypothesis section. Include:
- Refined Problem Statement based on the screenshot
- Impacted User Segment
- Business Risk assessment
- Metric at Risk analysis
- Current User Alternatives visible in or implied by the interface
- Why Now reasoning
- Validated hypothesis statement
- Risk Level justification`,
  },
  {
    id: 1,
    title: "Empathy Engine",
    subtitle: "User emotional landscape",
    focus: `Generate the Empathy Engine section. Include:
- **Think**: What users are thinking when using this interface
- **Feel**: Emotional responses, frustrations, and tensions
- **Say**: What users would literally say about this experience
- **Do**: Observable behaviors and patterns
- **Hidden Frictions**: Non-obvious pain points in the UI
- **Emotional Risks**: Where trust could break
- **Trust Barriers**: What prevents adoption or continued engagement`,
  },
  {
    id: 2,
    title: "JTBD Extraction",
    subtitle: "Jobs to be done",
    focus: `Generate the JTBD Extraction section. Include:
- **Core Functional Job**: What the user is trying to accomplish
- **Emotional Job**: How they want to feel while doing it
- **Social Job**: How they want to be perceived
- **Job Steps** (chronological): Full sequence of steps to complete the job
- **Success Definition**: What job completion looks like
- **Failure Definition**: When and why the job fails`,
  },
  {
    id: 3,
    title: "Constraint Mapping",
    subtitle: "Technical, data, legal, org",
    focus: `Generate the Constraint Mapping section. Include:
- **Technical Constraints**: Backend, model limits, performance, latency
- **Data Constraints**: Availability, reliability, ownership
- **Legal/Compliance**: Privacy, accessibility, regulatory
- **Organizational Constraints**: Team, process, or political limitations
- **Edge Cases**: Unusual but critical scenarios to handle`,
  },
  {
    id: 4,
    title: "Persona Roles",
    subtitle: "Usage archetypes",
    focus: `Generate the Persona Roles section for three archetypes. For each include:
- Motivation
- Risk tolerance
- Cognitive load tolerance
- UX expectation

**Naive**: First-time or occasional users
**Medium**: Regular users with growing familiarity
**Expert**: Power users who know the system deeply

Ground each persona in what you can infer from the screenshot and problem context.`,
  },
  {
    id: 5,
    title: "Behavioral Trigger Design",
    subtitle: "Activation to control",
    focus: `Generate the Behavioral Trigger Design section. Include:
- **Activation Trigger**: What makes the user start using this feature
- **Aha Moment**: When does value become obvious
- **Competence Moment**: When does the user feel capable and smart
- **Control Moment**: When does the user feel safe and in control

Be specific to what you see in the screenshot and tie to the JTBD from the previous section.`,
  },
  {
    id: 6,
    title: "Information Architecture",
    subtitle: "IA tree and task flows",
    focus: `Generate the Information Architecture section. Include:
- **IA Tree**: Hierarchical structure (Level 1 → Level 2 → Level 3)
- **Naive Task Flow**: Step-by-step for the naive persona
- **Medium Task Flow**: Step-by-step for the medium persona
- **Expert Task Flow**: Step-by-step for the expert persona

Base this on the actual interface visible in the screenshot and the personas from the previous section.`,
  },
  {
    id: 7,
    title: "Failure Mode Design",
    subtitle: "What can break",
    focus: `Generate the Failure Mode Design section. Include:
- **Failure Modes**: Confusion, empty states, hallucination risk, permission errors, timeouts, partial results — with specific scenarios for this product
- **System Recovery Design**: For each failure mode, how should the system recover?
- **Graceful Degradation**: What happens when things partially fail

Be thorough and practical. Reference specific UI elements from the screenshot.`,
  },
  {
    id: 8,
    title: "Metric Definition",
    subtitle: "Primary, secondary, signals",
    focus: `Generate the Metric Definition section. Include:
- **Primary Metric**: The single metric that defines success
- **Secondary Metrics**: 2-3 supporting metrics
- **Early Signal (7-day)**: Leading indicators in the first week post-launch
- **Long-Term Signal (30-day)**: Sustained behavior signals
- **Leading Indicators**: What predicts success before it's measurable

Tie directly to the Metric at Risk provided in the inputs and the hypothesis.`,
  },
  {
    id: 9,
    title: "Low-Fi Specification",
    subtitle: "Layout, CTA, state logic",
    focus: `Generate the Low-Fi Specification section (no visual styling, structural only). Include:
- **Layout Structure**: How elements should be arranged on screen
- **Priority Hierarchy**: What gets visual weight and attention order
- **CTA Logic**: When and how calls-to-action appear
- **State Logic**: All states the UI can be in (loading, empty, error, success, partial)
- **Error States**: What errors look like and what copy they contain
- **Empty States**: What zero-data or first-time states look like

Base this on your IA from section 6 and the personas from section 4.`,
  },
  {
    id: 10,
    title: "Heuristic & Cognitive Audit",
    subtitle: "Nielsen, cognitive load, accessibility",
    focus: `Generate the Heuristic & Cognitive Audit. Evaluate the interface against:

**Nielsen's 10 Heuristics** — for each relevant heuristic, list specific violations and improvements
**Cognitive Load Theory** — where does the interface overwhelm? How to reduce?
**Progressive Disclosure** — is complexity revealed at the right moment?
**Accessibility** — WCAG 2.1 considerations specific to this interface
**Error Prevention** — where could errors be prevented before they happen?

Format as: Heuristic → Violation → Improvement. Be specific to what you see in the screenshot.`,
  },
  {
    id: 11,
    title: "High-Fi Execution",
    subtitle: "Design system, interactions, microcopy",
    focus: `Generate the High-Fi Execution section. Translate the validated Low-Fi structure into a detailed high-fidelity execution spec. Include:
- **Component Inventory**: Specific UI components needed (buttons, inputs, cards, modals, tooltips, etc.) with all required states — default, hover, focus, disabled, error, loading
- **Interaction Details**: Hover states, click behaviors, focus rings, transition types and triggers
- **Motion Logic**: What animates, how (duration, easing curve), and why it aids comprehension — be specific
- **Microcopy**: Every piece of copy written out — labels, placeholders, tooltips, CTA text, error messages, empty state headlines and subtext, success confirmations, loading state copy
- **Visual Hierarchy**: Specific recommendations for typography scale, spacing rhythm, and color application to communicate priority
- **Edge Case Rendering**: How each failure mode from section 7 renders visually — what the user literally sees
- **Responsive Behavior**: How layout and components adapt across breakpoints (mobile, tablet, desktop)

Base this directly on the Low-Fi Specification (section 9) and ensure every Failure Mode (section 7) has a visual treatment.`,
  },
  {
    id: 12,
    title: "Validation Loop",
    subtitle: "Before and after development",
    focus: `Generate the Validation Loop section.

**Before Development** — for each question, provide specific tests or methods:
- Does this reduce cognitive load? How to test?
- Does it improve job completion speed? How to measure?
- Does it reduce risk perception? How to validate?
- What to prototype and test first?

**After Release** — provide specific things to watch for:
- Behavior changes to monitor
- Metric movements expected (and thresholds)
- Unexpected failure modes to watch
- Iteration triggers: when to iterate vs. stay the course

Make this actionable and specific to the product context.`,
  },
];

async function analyzeScreenshot(
  base64Image: string | null,
  mediaType: string,
  problemStatement: string
): Promise<string> {
  if (!base64Image) {
    return "No screenshot provided. Base the analysis entirely on the problem statement, user segment, hypothesis, and other textual inputs provided.";
  }

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as
                | "image/png"
                | "image/jpeg"
                | "image/gif"
                | "image/webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Analyze this product screenshot in detail. Your description will be used as context for 13 sequential UX analysis steps.

Describe:
1. Type of interface (web app, mobile, dashboard, etc.)
2. Key UI elements, components, and layout structure
3. The user flow or state being shown
4. Information hierarchy and visual organization
5. Apparent purpose and context of this screen
6. Any immediately visible UX strengths or issues

Context: Problem being solved — "${problemStatement}"

Be thorough and specific. 4-6 paragraphs.`,
          },
        ],
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

async function runStep(
  step: (typeof PXO_STEPS)[number],
  screenshotDescription: string,
  inputs: Record<string, string>,
  previousSections: Array<{ title: string; content: string }>,
  onChunk: (text: string) => void
): Promise<string> {
  const previousContext =
    previousSections.length > 0
      ? `\n\n## Previous Analysis (build on this, do not repeat it):\n${previousSections
          .map((s) => `### ${s.title}\n${s.content}`)
          .join("\n\n")}`
      : "";

  const hasHypothesis =
    inputs.hypothesisX &&
    inputs.hypothesisSegment &&
    inputs.hypothesisMetric &&
    inputs.hypothesisBehavior;

  const hypothesis = hasHypothesis
    ? `If we improve ${inputs.hypothesisX}, for ${inputs.hypothesisSegment}, then ${inputs.hypothesisMetric} will improve, because ${inputs.hypothesisBehavior}.`
    : "Hypothesis not fully specified.";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    stream: true,
    messages: [
      {
        role: "user",
        content: `You are a senior product strategist executing a PXO Workflow analysis. This is step ${step.id + 1} of 13.

## Screenshot Analysis:
${screenshotDescription}

## Inputs:
- Problem Statement: ${inputs.problemStatement}
- User Segment: ${inputs.userSegment}
- Metric at Risk: ${inputs.metricAtRisk}
- Hypothesis: ${hypothesis}
- Risk Level: ${inputs.riskLevel}
${previousContext}

## Your task — ${step.title}:
${step.focus}

Rules:
- Be specific and grounded in the screenshot and inputs
- Build directly on previous sections — reference them when relevant
- Use markdown formatting (bullets, **bold**, headers)
- Do NOT add a top-level title for this section
- Output only the section content`,
      },
    ],
  });

  let content = "";
  for await (const event of response) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      onChunk(event.delta.text);
      content += event.delta.text;
    }
  }
  return content;
}

async function generateSummary(
  sections: Array<{ title: string; content: string }>,
  inputs: Record<string, string>
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Based on this complete PXO analysis, write a concise executive summary (4-5 sentences) covering:
1. Core problem and affected user segment
2. Most critical insight from the full analysis
3. Recommended immediate focus area
4. Expected impact if addressed

Problem: ${inputs.problemStatement}
Risk Level: ${inputs.riskLevel}

Full Analysis:
${sections.map((s) => `### ${s.title}\n${s.content}`).join("\n\n")}

Write only the summary paragraph. No headings, no bullets. Just prose.`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const formData = await req.formData();
        const imageFile = formData.get("image") as File | null;

        const inputs = {
          problemStatement: (formData.get("problemStatement") as string) || "",
          userSegment: (formData.get("userSegment") as string) || "",
          metricAtRisk: (formData.get("metricAtRisk") as string) || "",
          hypothesisX: (formData.get("hypothesisX") as string) || "",
          hypothesisSegment:
            (formData.get("hypothesisSegment") as string) || "",
          hypothesisMetric: (formData.get("hypothesisMetric") as string) || "",
          hypothesisBehavior:
            (formData.get("hypothesisBehavior") as string) || "",
          riskLevel: (formData.get("riskLevel") as string) || "Medium",
        };

        let base64Image: string | null = null;
        let mediaType = "image/png";

        if (imageFile && imageFile.size > 0) {
          const imageBuffer = await imageFile.arrayBuffer();
          base64Image = Buffer.from(imageBuffer).toString("base64");
          mediaType = imageFile.type || "image/png";
        }

        // Pre-step: analyze screenshot
        send({
          type: "step_start",
          step: -1,
          title: base64Image ? "Analyzing screenshot..." : "Preparing analysis...",
          subtitle: "",
        });
        const screenshotDescription = await analyzeScreenshot(
          base64Image,
          mediaType,
          inputs.problemStatement
        );
        send({ type: "screenshot_done" });

        // Run 13 sequential steps
        const completedSections: Array<{ title: string; content: string }> = [];

        for (const step of PXO_STEPS) {
          send({
            type: "step_start",
            step: step.id,
            title: step.title,
            subtitle: step.subtitle,
          });
          const content = await runStep(
            step,
            screenshotDescription,
            inputs,
            completedSections,
            (text) => send({ type: "step_chunk", step: step.id, text })
          );
          completedSections.push({ title: step.title, content });
          send({
            type: "step_complete",
            section: {
              id: step.id,
              title: step.title,
              subtitle: step.subtitle,
              content,
            },
          });
        }

        // Generate summary
        send({ type: "step_start", step: 13, title: "Writing summary...", subtitle: "" });
        const summary = await generateSummary(completedSections, inputs);
        send({ type: "summary_complete", summary });

        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Analysis failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
