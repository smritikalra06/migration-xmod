/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-science. Base: hero.
 * Source: https://www.abbvie.com/science/our-people/community-of-science.html
 * Generated: 2026-02-25
 *
 * Hero structure (from block library): 1 column, 3 rows max.
 *   Row 1: block name
 *   Row 2: background image (optional)
 *   Row 3: text content (heading, subheading, paragraph, CTA)
 *
 * Source DOM: #container-8c952d1cb2 contains bg image.
 *   Sibling .overlap-predecessor div contains h1 heading and paragraph.
 *
 * UE model fields: image (reference), imageAlt (collapsed), text (richtext)
 *
 * NOTE: Validator cannot test against live URL due to Cloudflare protection.
 * Selectors verified against captured DOM in migration-work/cleaned.html.
 * Cloudflare blocks headless validation - parser verified manually.
 */
export default function parse(element, { document }) {
  // Extract background image from within the matched container
  const bgImage = element.querySelector('img.cmp-container__bg-image, img[class*="bg"]');

  // Navigate to sibling container for text content
  // The text is in a sibling div with class overlap-predecessor
  const parent = element.parentElement;
  const textContainer = parent ? parent.nextElementSibling : null;

  // Extract heading (h1) from the text container
  const heading = textContainer
    ? textContainer.querySelector('h1.cmp-title__text, h1, h2')
    : null;

  // Extract paragraph from the text container
  const description = textContainer
    ? textContainer.querySelector('.cmp-text p, .text p, p')
    : null;

  // Build cells matching hero block library structure: 2 rows (image + text)
  const cells = [];

  // Row 1: Background image with field hint
  if (bgImage) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(bgImage);
    cells.push([imgFrag]);
  }

  // Row 2: Text content (heading + paragraph) with field hint
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (heading) textFrag.appendChild(heading);
  if (description) textFrag.appendChild(description);
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-science', cells });
  element.replaceWith(block);
}
