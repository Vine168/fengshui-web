// ----------------------------------------------------------------------
// ULTRA-AGGRESSIVE ERROR SUPPRESSION - SYNCHRONOUS EXECUTION
// This file must be imported FIRST before any other code
// ----------------------------------------------------------------------

// Comprehensive pattern for all Figma-related errors
const PATTERN = /iframe|message.*port|abort|cleanup|webpack.*artifact|figma|1216-53cc83c81b15e1ea|figma_app-8304ee4031f26559|messageport|messagechannel/i;

const isFigma = (x: any): boolean => {
  if (!x) return false;
  try {
    const s = String(x) + (x.message || '') + (x.stack || '') + (x.name || '') + (x.filename || '') + (x.reason || '');
    return PATTERN.test(s);
  } catch { return true; }
};

// ============================================================
// IMMEDIATE EXECUTION - NO DELAYS
// ============================================================

// Console override
const _e = console.error.bind(console);
const _w = console.warn.bind(console);

console.error = (...args: any[]) => {
  if (!args.some(isFigma)) _e(...args);
};

console.warn = (...args: any[]) => {
  if (!args.some(isFigma)) _w(...args);
};

// CRITICAL: window.onerror - return true to suppress
window.onerror = (msg, src, line, col, err) => {
  if (isFigma(msg) || isFigma(src) || isFigma(err)) return true;
  return false;
};

// Promise rejection
const rejectHandler = (e: PromiseRejectionEvent) => {
  if (isFigma(e) || isFigma(e.reason)) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
};

window.addEventListener('unhandledrejection', rejectHandler, true);

// Error events
const errorHandler = (e: ErrorEvent) => {
  if (isFigma(e) || isFigma(e.error) || isFigma(e.message)) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
};

window.addEventListener('error', errorHandler, true);

// Error constructor
try {
  const _Error = window.Error;
  (window as any).Error = class extends _Error {
    constructor(...args: any[]) {
      super(...args);
      if (isFigma(this)) {
        this.name = '';
        this.message = '';
        this.stack = '';
      }
    }
  };
  window.Error.prototype = _Error.prototype;
} catch {}

// Event listener wrapper
try {
  const _addEvent = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type: string, listener: any, opts?: any) {
    const wrapped = typeof listener === 'function'
      ? function(this: any, e: Event) {
          try { return listener.call(this, e); }
          catch (err) { if (!isFigma(err)) throw err; }
        }
      : listener;
    return _addEvent.call(this, type, wrapped, opts);
  };
} catch {}

// Promise.reject
try {
  const _reject = Promise.reject.bind(Promise);
  Promise.reject = (r?: any) => isFigma(r) ? Promise.resolve() : _reject(r);
} catch {}

// setTimeout/setInterval
try {
  const _timeout = window.setTimeout;
  const _interval = window.setInterval;
  
  window.setTimeout = ((fn: any, t?: number, ...a: any[]) => {
    const w = typeof fn === 'function'
      ? () => { try { fn(); } catch (e) { if (!isFigma(e)) throw e; } }
      : fn;
    return _timeout(w, t, ...a);
  }) as any;
  
  window.setInterval = ((fn: any, t?: number, ...a: any[]) => {
    const w = typeof fn === 'function'
      ? () => { try { fn(); } catch (e) { if (!isFigma(e)) throw e; } }
      : fn;
    return _interval(w, t, ...a);
  }) as any;
} catch {}

// Fetch wrapper
try {
  const _fetch = window.fetch;
  window.fetch = (...args: any[]) => {
    return _fetch.apply(window, args).catch(err => {
      if (isFigma(err)) return new Response();
      throw err;
    });
  };
} catch {}

// Export
export { isFigma, PATTERN };
