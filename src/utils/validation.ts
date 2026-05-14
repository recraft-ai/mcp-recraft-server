/**
 * Validation helpers for Recraft model/parameter compatibility.
 *
 * Recraft V4 and V4.1 are style-less generations — they do not accept the
 * legacy `style` or `substyle` parameters. The API rejects such combinations,
 * but we reject earlier to give the caller a clear message and avoid burning
 * a request on a guaranteed failure.
 */

const V4_MODEL_PREFIX = "recraftv4"

export function isV4Model(model: string | undefined): boolean {
  return typeof model === "string" && model.startsWith(V4_MODEL_PREFIX)
}

export function validateV4StyleCompatibility(
  model: string | undefined,
  style: string | undefined,
  substyle: string | undefined,
): void {
  if (!isV4Model(model)) {
    return
  }
  if (style !== undefined || substyle !== undefined) {
    throw new Error(
      `Recraft ${model} is style-less and does not accept 'style' or 'substyle'. ` +
      `Use 'styleID' for custom styles created from reference images, ` +
      `or switch to 'recraftv3' for the legacy style+substyle workflow.`
    )
  }
}
