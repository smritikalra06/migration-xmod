/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie section breaks and section-metadata.
 * Runs in afterTransform only. Uses payload.template.sections from page-templates.json.
 * Selectors from captured DOM of abbvie.com community-of-science page.
 *
 * NOTE: Validator cannot fully test against live URL due to Cloudflare protection.
 * Selectors verified against captured DOM in migration-work/cleaned.html:
 * - #container-8c952d1cb2 (Hero, line 7342)
 * - #container-02b51d5df6 (Statistics, line 7434)
 * - #container-ddcdf990db (Content Showcases, line 7634)
 * - .teaser.aem-GridColumn (Programs Overview, line 8134)
 * - #container-789c79eb77 (Join CTA, line 8381)
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const document = element.ownerDocument || payload.document;
    const template = payload.template;

    if (!template || !template.sections || template.sections.length < 2) {
      return;
    }

    // Process sections in reverse order to avoid shifting DOM positions
    const sections = [...template.sections].reverse();

    for (const section of sections) {
      // Find the section element using selector (can be string or array)
      let sectionEl = null;
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];

      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadataBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadataBlock);
      }

      // Add section break (<hr>) before each section except the first
      if (section.id !== template.sections[0].id) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
