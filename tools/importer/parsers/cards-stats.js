/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-stats. Base: cards.
 * Source: https://www.abbvie.com/science/our-people/community-of-science.html
 * Generated: 2026-02-25
 *
 * Cards structure (from block library): 2+ columns, multiple rows.
 *   Row 1: block name
 *   Each subsequent row: [component-id, image-cell, text-cell]
 *
 * Source DOM: .dashboardcards contains individual stat cards.
 *   4 instances on page, each with .eyebrow, .data-point, .data-point-suffix, .description
 *   First instance gathers all siblings to create one combined block.
 *
 * UE model fields (card): image (reference), text (richtext)
 *
 * NOTE: Cloudflare blocks headless validation (3 attempts) - parser verified against captured DOM.
 */
export default function parse(element, { document }) {
  // Find all dashboard card containers in the same section
  const section = element.closest('.cmp-container') || element.closest('.grid-row') || element.parentElement;
  const allCards = section ? Array.from(section.querySelectorAll('.dashboardcards .content-container')) : [];

  // If no cards found via section, try from this element directly
  if (allCards.length === 0) {
    const localContent = element.querySelector('.content-container');
    if (localContent) allCards.push(localContent);
  }

  // Skip if this is not the first .dashboardcards instance (already processed)
  const allDashboardCards = section ? Array.from(section.querySelectorAll('.dashboardcards')) : [element];
  if (allDashboardCards[0] !== element && allDashboardCards.indexOf(element) > 0) {
    element.remove();
    return;
  }

  const cells = [];

  for (const card of allCards) {
    const eyebrow = card.querySelector('.eyebrow');
    const dataPoint = card.querySelector('.data-point');
    const suffix = card.querySelector('.data-point-suffix');
    const desc = card.querySelector('.description');

    // Build text content: eyebrow as bold, number+suffix as heading, description as paragraph
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    if (eyebrow) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = eyebrow.textContent.trim();
      p.appendChild(strong);
      textFrag.appendChild(p);
    }

    if (dataPoint) {
      const h2 = document.createElement('h2');
      h2.textContent = dataPoint.textContent.trim() + (suffix ? suffix.textContent.trim() : '');
      textFrag.appendChild(h2);
    }

    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textFrag.appendChild(p);
    }

    // Cards row: [component-id, image-cell (empty for stats), text-cell]
    cells.push(['card', '', textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);

  // Remove remaining .dashboardcards siblings to prevent duplicate processing
  for (let i = 1; i < allDashboardCards.length; i++) {
    if (allDashboardCards[i] && allDashboardCards[i].parentElement) {
      allDashboardCards[i].remove();
    }
  }
}
