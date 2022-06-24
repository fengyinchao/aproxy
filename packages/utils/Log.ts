import createDebug from 'debug';

const DEBUG_NAMESPACES = '@aproxy/bridge,@aproxy/client,@aproxy/server';

createDebug.enable(DEBUG_NAMESPACES);

export { createDebug };
