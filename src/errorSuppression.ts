const PATTERN = /iframe|message.*port|abort|cleanup|webpack.*artifact|figma|1216-53cc83c81b15e1ea|figma_app-8304ee4031f26559|messageport|messagechannel/i;

const isFigma = (x: any): boolean => {
  if (!x) return false;
  try {
    const s = String(x) + (x.message || '') + (x.stack || '') + (x.name || '') + (x.filename || '') + (x.reason || '');
    return PATTERN.test(s);
  } catch {
    return true;
  }
};

// Keep this file intentionally lightweight. Aggressive global monkey-patching
// can interfere with browser extensions and DevTools, so we only expose the
// matcher for callers that still want to filter known Figma-only noise.
export { isFigma, PATTERN };
