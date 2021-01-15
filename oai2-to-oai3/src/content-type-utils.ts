import { JsonPointer } from "@azure-tools/datastore";
import { OpenAPI2Operation } from "./oai2";

/**
 * Resolve the list of content types produced by an operation.
 * @param operationProduces: List of content type produces by the operation.
 * @param globalProduces: List of default content type produced by the API.
 * @returns list of produced content types. Array will have at least one entry.
 * @throws {Error} if no content type could be resolved.
 */
export const resolveOperationProduces = (
  jsonPointer: JsonPointer,
  operation: OpenAPI2Operation,
  globalProduces: string[],
): string[] => {
  const operationProduces = operation.produces;
  const produces = operationProduces
    ? operationProduces.indexOf("application/json") !== -1
      ? operationProduces
      : [...new Set([...operationProduces])]
    : globalProduces;

  console.error("Produces", produces);

  // default
  if (produces.length === 0 || (produces.length === 1 && produces[0] === "*/*")) {
    throw new Error(
      `Operation '${operation.operationId}' (${jsonPointer}) is missing a produces field and there isn't any global value. Please add "produces": [<contentType>]"`,
    );
  }

  return produces;
};

/**
 * Resolve the list of content types consumed by an operation.
 * @param operationConsumes: List of content type consumed by the operation.
 * @param globalConsumes: List of default content type consumed by the API.
 */
export const resolveOperationConsumes = (
  operation: OpenAPI2Operation,
  globalConsumes: string[],
): string[] => {
  const operationConsumes = operation.consumes;
  return operationConsumes
    ? operationConsumes.indexOf("application/octet-stream") !== -1
      ? operationConsumes
      : [...new Set([...operationConsumes])]
    : globalConsumes;
};