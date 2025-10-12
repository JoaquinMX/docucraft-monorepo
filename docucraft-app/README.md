# New Project Wizard

The new project flow now guides users through three steps before triggering AI generation:

1. **Template selection** – choose a vertical-specific starting point that comes with a recommended tech stack. Templates are defined in [`src/data/projectTemplates.ts`](./src/data/projectTemplates.ts) and grouped by vertical to drive the wizard UI.
2. **Contextual questions** – answer follow-up prompts tailored to the selected template. These responses are stored with the project metadata and forwarded to the worker for richer prompt grounding.
3. **Project details & diagrams** – provide the existing name/description/objectives information and select diagrams as before.

All wizard inputs are persisted in `localStorage` under the existing `projectData` key so anonymous users can continue to the AI response screen without authentication. The worker API now receives structured payloads containing the template metadata, recommended stack, and contextual answers, which are appended to every prompt before generation.

# Known Bugs
- [x] After creating a project, if trying to create another project it will only add params to the URL. (Fixed: Form submission now works correctly on subsequent visits due to using `astro:page-load` event listener.)
- [x] Image selection now updates correctly on page navigation. (Fixed: Added `astro:page-load` event listener to update image selection on page load.)
