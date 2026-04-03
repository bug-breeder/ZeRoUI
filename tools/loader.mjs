/**
 * Node.js ESM loader hooks for the ZeppOS page preview tool.
 * Usage: node --no-warnings --loader tools/loader.mjs tools/preview.mjs [page]
 *
 * resolve() — redirects @zos/* bare specifiers to local mocks.
 * load()    — forces project .js files (pages/, utils/) to be parsed as ESM,
 *             overriding the default CJS inference from the missing "type":"module"
 *             in zepp-meditation's package.json.
 */

const MOCKS_BASE = new URL('./mocks/', import.meta.url);

const ZOS_MOCKS = {
  '@zos/ui': 'zos-ui.mjs',
  '@zos/router': 'zos-router.mjs',
  '@zos/storage': 'zos-storage.mjs',
  '@zos/sensor': 'zos-sensor.mjs',
  '@zos/interaction': 'zos-interaction.mjs',
};

export async function resolve(specifier, context, nextResolve) {
  if (ZOS_MOCKS[specifier]) {
    return {
      shortCircuit: true,
      url: new URL(ZOS_MOCKS[specifier], MOCKS_BASE).href,
    };
  }

  // ZeppOS pages use extensionless relative imports (e.g. '../../utils/storage').
  // Node.js ESM requires explicit extensions — append .js when missing.
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
    return nextResolve(specifier + '.js', context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // zepp-meditation's package.json has no "type":"module", so Node.js would try
  // to parse pages/*.js and utils/*.js as CJS and fail on import statements.
  // The format override here tells Node.js to parse them as ESM regardless.
  const isProjectJs =
    url.endsWith('.js') &&
    !url.includes('/node_modules/') &&
    (url.includes('/pages/') || url.includes('/utils/'));

  if (isProjectJs) {
    return nextLoad(url, { ...context, format: 'module' });
  }
  return nextLoad(url, context);
}
