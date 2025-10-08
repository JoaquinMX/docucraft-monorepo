# New Project Wizard

The **New Project** flow now guides builders through a three-step wizard to capture structured context before kicking off AI generation:

1. **Template selection** – choose from curated vertical templates that bundle a summary, recommended tech stack, and compliance expectations.
2. **Contextual questions** – answer follow-up prompts specific to the chosen template (e.g., regulatory scope, fulfillment model, regional coverage). Responses are stored as structured data instead of a single free-form paragraph.
3. **Project details & diagrams** – provide the existing name, description, objectives, hero image, and diagram checklist.

All wizard inputs (project details, selected template metadata, and contextual answers) are persisted to `localStorage.projectData` so anonymous users can continue the flow on the AI response page or after registering an account.

# Known Bugs
- [x] After creating a project, if trying to create another project it will only add params to the URL. (Fixed: Form submission now works correctly on subsequent visits due to using `astro:page-load` event listener.)
- [x] Image selection now updates correctly on page navigation. (Fixed: Added `astro:page-load` event listener to update image selection on page load.)
