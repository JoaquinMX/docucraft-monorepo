# Known Bugs
- [x] After creating a project, if trying to create another project it will only add params to the URL. (Fixed: Form submission now works correctly on subsequent visits due to using `astro:page-load` event listener.)
- [x] Image selection now updates correctly on page navigation. (Fixed: Added `astro:page-load` event listener to update image selection on page load.)

## New Project wizard

The `/new-project` experience now guides makers through a three-step flow that captures richer context for AI diagram generation:

1. **Template selection** – Users choose from curated vertical templates defined in [`src/data/projectTemplates.ts`](./src/data/projectTemplates.ts). Each template packages a vertical description, recommended tech stack, and follow-up question schema.
2. **Contextual questions** – Based on the chosen template, the wizard dynamically renders follow-up questions (text, select, and multi-select). Answers are validated before advancing and displayed alongside the recommended stack so users understand how the prompt will be tailored.
3. **Project details & diagrams** – The existing project metadata form and diagram checklist remain as the final step before submission.

The wizard persists template metadata and structured answers into `localStorage.projectData` so anonymous sessions can still complete the flow and later hydrate the worker request. Those new fields are included in the Cloudflare Worker payload, enabling prompts to reference the vertical and contextual responses when generating diagrams.
