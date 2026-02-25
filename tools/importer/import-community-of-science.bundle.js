var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-community-of-science.js
  var import_community_of_science_exports = {};
  __export(import_community_of_science_exports, {
    default: () => import_community_of_science_default
  });

  // tools/importer/parsers/hero-science.js
  function parse(element, { document }) {
    const bgImage = element.querySelector('img.cmp-container__bg-image, img[class*="bg"]');
    const parent = element.parentElement;
    const textContainer = parent ? parent.nextElementSibling : null;
    const heading = textContainer ? textContainer.querySelector("h1.cmp-title__text, h1, h2") : null;
    const description = textContainer ? textContainer.querySelector(".cmp-text p, .text p, p") : null;
    const cells = [];
    if (bgImage) {
      const imgFrag = document.createDocumentFragment();
      imgFrag.appendChild(document.createComment(" field:image "));
      imgFrag.appendChild(bgImage);
      cells.push([imgFrag]);
    }
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(" field:text "));
    if (heading) textFrag.appendChild(heading);
    if (description) textFrag.appendChild(description);
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-science", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stats.js
  function parse2(element, { document }) {
    const section = element.closest(".cmp-container") || element.closest(".grid-row") || element.parentElement;
    const allCards = section ? Array.from(section.querySelectorAll(".dashboardcards .content-container")) : [];
    if (allCards.length === 0) {
      const localContent = element.querySelector(".content-container");
      if (localContent) allCards.push(localContent);
    }
    const allDashboardCards = section ? Array.from(section.querySelectorAll(".dashboardcards")) : [element];
    if (allDashboardCards[0] !== element && allDashboardCards.indexOf(element) > 0) {
      element.remove();
      return;
    }
    const cells = [];
    for (const card of allCards) {
      const eyebrow = card.querySelector(".eyebrow");
      const dataPoint = card.querySelector(".data-point");
      const suffix = card.querySelector(".data-point-suffix");
      const desc = card.querySelector(".description");
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (eyebrow) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = eyebrow.textContent.trim();
        p.appendChild(strong);
        textFrag.appendChild(p);
      }
      if (dataPoint) {
        const h2 = document.createElement("h2");
        h2.textContent = dataPoint.textContent.trim() + (suffix ? suffix.textContent.trim() : "");
        textFrag.appendChild(h2);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        textFrag.appendChild(p);
      }
      cells.push(["card", "", textFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stats", cells });
    element.replaceWith(block);
    for (let i = 1; i < allDashboardCards.length; i++) {
      if (allDashboardCards[i] && allDashboardCards[i].parentElement) {
        allDashboardCards[i].remove();
      }
    }
  }

  // tools/importer/parsers/columns-showcase.js
  function parse3(element, { document }) {
    const gridRow = element.querySelector(".grid-row");
    if (!gridRow) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const gridCells = Array.from(gridRow.querySelectorAll(":scope > .grid-cell"));
    const contentCells = gridCells.filter((cell) => {
      const hasImage = cell.querySelector(".cmp-image, img");
      const hasText = cell.querySelector(".cmp-header, .cmp-title, .cmp-text, h1, h2, h3, h4, h5, p");
      return hasImage || hasText;
    });
    const cells = [];
    const row = [];
    for (const cell of contentCells) {
      const cellFrag = document.createDocumentFragment();
      const img = cell.querySelector(".cmp-image__image, img");
      if (img) {
        cellFrag.appendChild(img);
      }
      const eyebrow = cell.querySelector(".cmp-header__text, .cmp-header .cmp-header__text");
      if (eyebrow) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = eyebrow.textContent.trim();
        p.appendChild(em);
        cellFrag.appendChild(p);
      }
      const title = cell.querySelector(".cmp-title__text, h5, h4, h3, h2");
      if (title) {
        cellFrag.appendChild(title);
      }
      const textEl = cell.querySelector(".cmp-text p, .cmp-text");
      if (textEl) {
        const paragraphs = cell.querySelectorAll(".cmp-text p");
        if (paragraphs.length > 0) {
          paragraphs.forEach((p) => cellFrag.appendChild(p));
        } else {
          cellFrag.appendChild(textEl);
        }
      }
      const ctaLink = cell.querySelector(".cmp-teaser__action-link, a[href]");
      if (ctaLink && !img) {
        const p = document.createElement("p");
        p.appendChild(ctaLink);
        cellFrag.appendChild(p);
      }
      const titleElements = cell.querySelectorAll(".title .cmp-title__text");
      const textElements = cell.querySelectorAll(".text .cmp-text p");
      if (titleElements.length > 1 && !eyebrow) {
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
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/abbvie-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        '[class*="cookie"]',
        '[id*="onetrust"]',
        '[class*="consent"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header/navigation experience fragment
        ".cmp-experiencefragment--header",
        // Footer experience fragment
        ".cmp-experiencefragment--footer",
        // Breadcrumb navigation
        ".breadcrumb.abbvie-breadcrumb",
        // Skip to main content link
        ".skip-link",
        // YouTube player div
        "#yt-player-initiated",
        // Iframes and link tags
        "iframe",
        "link",
        "noscript"
      ]);
      element.querySelectorAll("[data-cmp-data-layer]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
      });
      element.querySelectorAll("[data-warn-on-departure]").forEach((el) => {
        el.removeAttribute("data-warn-on-departure");
      });
    }
  }

  // tools/importer/transformers/abbvie-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const document = element.ownerDocument || payload.document;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) {
        return;
      }
      const sections = [...template.sections].reverse();
      for (const section of sections) {
        let sectionEl = null;
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadataBlock);
        }
        if (section.id !== template.sections[0].id) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-community-of-science.js
  var PAGE_TEMPLATE = {
    name: "community-of-science",
    description: "Science community page showcasing AbbVie's community of scientists and researchers",
    urls: [
      "https://www.abbvie.com/science/our-people/community-of-science.html"
    ],
    blocks: [
      {
        name: "hero-science",
        instances: ["#container-8c952d1cb2"]
      },
      {
        name: "cards-stats",
        instances: [".dashboardcards"]
      },
      {
        name: "columns-showcase",
        instances: [
          "#container-ddcdf990db .grid:nth-of-type(1)",
          "#container-ddcdf990db .grid:nth-of-type(2)",
          "#container-ddcdf990db .grid:nth-of-type(3)",
          "#container-ddcdf990db .grid:nth-of-type(4)",
          "#container-ddcdf990db .grid:nth-of-type(5)",
          ".grid.aem-GridColumn",
          "#container-789c79eb77 .grid"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: "#container-8c952d1cb2",
        style: null,
        blocks: ["hero-science"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Statistics Dashboard",
        selector: "#container-02b51d5df6",
        style: "grey",
        blocks: ["cards-stats"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Content Showcases",
        selector: "#container-ddcdf990db",
        style: "lavender",
        blocks: ["columns-showcase"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Programs Overview",
        selector: ".teaser.aem-GridColumn",
        style: null,
        blocks: ["columns-showcase"],
        defaultContent: [
          ".cmp-teaser__pretitle",
          ".cmp-teaser__title",
          ".cmp-teaser__description"
        ]
      },
      {
        id: "section-5",
        name: "Join CTA",
        selector: "#container-789c79eb77",
        style: "lavender",
        blocks: ["columns-showcase"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "hero-science": parse,
    "cards-stats": parse2,
    "columns-showcase": parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_community_of_science_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_community_of_science_exports);
})();
