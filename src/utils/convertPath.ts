/**
 * Converts path parameters from the express format to the openapi format.
 * Example:
 *
 * /user/:id/roles/:role -> /user/{id}/roles/{role}
 */
export default function convertPath(expressPath: string): string {
    return expressPath.replace(/:(\w+)/g, "{$1}");
}
