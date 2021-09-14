import React from 'react';
/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 */
export declare function createCtx<A extends {} | null>(): readonly [() => A, React.Provider<A | undefined>];
