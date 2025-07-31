# Known Bugs
- [x] After creating a project, if trying to create another project it will only add params to the URL. (Fixed: Form submission now works correctly on subsequent visits due to using `astro:page-load` event listener.)
- [x] Image selection now updates correctly on page navigation. (Fixed: Added `astro:page-load` event listener to update image selection on page load.)
