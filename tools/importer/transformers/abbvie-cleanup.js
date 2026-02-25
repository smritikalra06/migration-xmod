/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: AbbVie cleanup. Selectors from captured DOM of abbvie.com.
 * Removes non-authorable content: header, footer, nav, breadcrumbs, skip links, tracking elements.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie/consent overlays, chat widgets (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '[class*="cookie"]',
      '[id*="onetrust"]',
      '[class*="consent"]',
    ]);
  }
  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      // Header/navigation experience fragment
      '.cmp-experiencefragment--header',
      // Footer experience fragment
      '.cmp-experiencefragment--footer',
      // Breadcrumb navigation
      '.breadcrumb.abbvie-breadcrumb',
      // Skip to main content link
      '.skip-link',
      // YouTube player div
      '#yt-player-initiated',
      // Iframes and link tags
      'iframe',
      'link',
      'noscript',
    ]);

    // Remove tracking/data-layer attributes
    element.querySelectorAll('[data-cmp-data-layer]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
    });
    element.querySelectorAll('[data-warn-on-departure]').forEach((el) => {
      el.removeAttribute('data-warn-on-departure');
    });
  }
}
