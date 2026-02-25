/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-showcase. Base: columns.
 * Source: https://www.abbvie.com/science/our-people/community-of-science.html
 * Generated: 2026-02-25
 *
 * Columns structure (from block library): multiple columns, multiple rows.
 *   Row 1: block name
 *   Row 2+: content cells (one per column)
 *
 * Source DOM: .grid elements with .grid-row containing .grid-cell divs.
 *   Pattern: 5:1:5 grid (image-col, spacer, text-col) or reversed.
 *   Text side has .cmp-header (eyebrow), .cmp-title (subtitle), .cmp-text (paragraph),
 *   and optional CTA link.
 *
 * UE model: columns-showcase is a Columns block - NO field hints required (Rule 4 exception).
 *
 * NOTE: Cloudflare blocks headless validation - parser verified against captured DOM.
 */
export default function parse(element, { document }) {
  // Find the grid-row which contains all column cells
  const gridRow = element.querySelector('.grid-row');
  if (!gridRow) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  // Get all non-spacer grid cells (cells with actual content)
  const gridCells = Array.from(gridRow.querySelectorAll(':scope > .grid-cell'));

  // Identify content cells (skip spacer columns which have no child elements)
  const contentCells = gridCells.filter((cell) => {
    const hasImage = cell.querySelector('.cmp-image, img');
    const hasText = cell.querySelector('.cmp-header, .cmp-title, .cmp-text, h1, h2, h3, h4, h5, p');
    return hasImage || hasText;
  });

  const cells = [];
  const row = [];

  for (const cell of contentCells) {
    const cellFrag = document.createDocumentFragment();

    // Check for image
    const img = cell.querySelector('.cmp-image__image, img');
    if (img) {
      cellFrag.appendChild(img);
    }

    // Check for eyebrow header
    const eyebrow = cell.querySelector('.cmp-header__text, .cmp-header .cmp-header__text');
    if (eyebrow) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = eyebrow.textContent.trim();
      p.appendChild(em);
      cellFrag.appendChild(p);
    }

    // Check for title/subtitle
    const title = cell.querySelector('.cmp-title__text, h5, h4, h3, h2');
    if (title) {
      cellFrag.appendChild(title);
    }

    // Check for text/paragraph
    const textEl = cell.querySelector('.cmp-text p, .cmp-text');
    if (textEl) {
      const paragraphs = cell.querySelectorAll('.cmp-text p');
      if (paragraphs.length > 0) {
        paragraphs.forEach((p) => cellFrag.appendChild(p));
      } else {
        cellFrag.appendChild(textEl);
      }
    }

    // Check for CTA link
    const ctaLink = cell.querySelector('.cmp-teaser__action-link, a[href]');
    if (ctaLink && !img) {
      const p = document.createElement('p');
      p.appendChild(ctaLink);
      cellFrag.appendChild(p);
    }

    // Check for list items (Programs Overview section)
    const titleElements = cell.querySelectorAll('.title .cmp-title__text');
    const textElements = cell.querySelectorAll('.text .cmp-text p');
    if (titleElements.length > 1 && !eyebrow) {
      // Multiple title+text pairs (Programs Overview pattern)
      for (let i = 0; i < titleElements.length; i++) {
        cellFrag.appendChild(titleElements[i]);
        if (textElements[i]) {
          cellFrag.appendChild(textElements[i]);
        }
      }
    }

    row.push(cellFrag);
  }

  if (row.length > 0) {
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-showcase', cells });
  element.replaceWith(block);
}
