import { IConvroute } from "./types";

/**
 * Identity function that just returns the convroute passed to it. Convenience
 * function for typing as an IConvroute the default export of a file, so you
 * can write this:
 *
 * ```ts
 * import { Convexpress } from "convexpress";
 *
 * export default Convexpress.convroute({
 *   // ...
 * });
 * ```
 *
 * instead of this:
 *
 * ```ts
 * import { IConvroute } from "convexpress";
 *
 * const convroute: IConvroute = {
 *     // ...
 * };
 * export default convroute;
 * ```
 */
export default function convroute(_convroute: IConvroute): IConvroute {
    return _convroute;
}
