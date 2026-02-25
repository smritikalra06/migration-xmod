/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroScienceParser from './parsers/hero-science.js';
import cardsStatsParser from './parsers/cards-stats.js';
import columnsShowcaseParser from './parsers/columns-showcase.js';

// TRANSFORMER IMPORTS
import abbvieCleanupTransformer from './transformers/abbvie-cleanup.js';
import abbvieSectionsTransformer from './transformers/abbvie-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'community-of-science',
  description: 'Science community page showcasing AbbVie\'s community of scientists and researchers',
  urls: [
    'https://www.abbvie.com/science/our-people/community-of-science.html'
  ],
  blocks: [
    {
      name: 'hero-science',
      instances: ['#container-8c952d1cb2']
    },
    {
      name: 'cards-stats',
      instances: ['.dashboardcards']
    },
    {
      name: 'columns-showcase',
      instances: [
        '#container-ddcdf990db .grid:nth-of-type(1)',
        '#container-ddcdf990db .grid:nth-of-type(2)',
        '#container-ddcdf990db .grid:nth-of-type(3)',
        '#container-ddcdf990db .grid:nth-of-type(4)',
        '#container-ddcdf990db .grid:nth-of-type(5)',
        '.grid.aem-GridColumn',
        '#container-789c79eb77 .grid'
      ]
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '#container-8c952d1cb2',
      style: null,
      blocks: ['hero-science'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'Statistics Dashboard',
      selector: '#container-02b51d5df6',
      style: 'grey',
      blocks: ['cards-stats'],
      defaultContent: []
    },
    {
      id: 'section-3',
      name: 'Content Showcases',
      selector: '#container-ddcdf990db',
      style: 'lavender',
      blocks: ['columns-showcase'],
      defaultContent: []
    },
    {
      id: 'section-4',
      name: 'Programs Overview',
      selector: '.teaser.aem-GridColumn',
      style: null,
      blocks: ['columns-showcase'],
      defaultContent: [
        '.cmp-teaser__pretitle',
        '.cmp-teaser__title',
        '.cmp-teaser__description'
      ]
    },
    {
      id: 'section-5',
      name: 'Join CTA',
      selector: '#container-789c79eb77',
      style: 'lavender',
      blocks: ['columns-showcase'],
      defaultContent: []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero-science': heroScienceParser,
  'cards-stats': cardsStatsParser,
  'columns-showcase': columnsShowcaseParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  abbvieCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [abbvieSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
