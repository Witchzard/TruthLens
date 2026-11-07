/**
 * TruthLens AI - Robust Client-Side API Utility
 * Prevents "Unexpected token '<', '<!doctype'..." crashes by inspecting
 * HTTP status and Content-Type before parsing JSON, and surfacing clear diagnostic errors.
 */

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public isHtmlResponse: boolean;

  constructor(message: string, status: number, code?: string, isHtmlResponse = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isHtmlResponse = isHtmlResponse;
  }
}

/**
 * Validates HTTP response headers and parses JSON safely.
 * If the server returned an HTML page (e.g. from an unhandled SPA route or proxy gateway),
 * provides a diagnostic explanation instead of crashing with a JSON parse error.
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!isJson) {
    let responseText = '';
    try {
      responseText = await response.text();
    } catch {
      responseText = '';
    }

    const trimmed = responseText.trim();
    const isHtml =
      trimmed.startsWith('<') ||
      trimmed.toLowerCase().includes('<!doctype') ||
      trimmed.toLowerCase().includes('<html');

    if (isHtml) {
      throw new ApiError(
        `Server returned an HTML page (HTTP ${response.status}) instead of JSON. The backend route may be unavailable, misrouted, or intercepted by the dev server fallback.`,
        response.status,
        'HTML_RESPONSE_INTERCEPTED',
        true
      );
    }

    throw new ApiError(
      `Server returned non-JSON response (${contentType || 'unknown type'}, HTTP ${response.status}): ${trimmed.slice(0, 160)}`,
      response.status,
      'INVALID_CONTENT_TYPE'
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch (parseErr: any) {
    throw new ApiError(
      `Failed to parse server JSON response: ${parseErr.message}`,
      response.status,
      'JSON_PARSE_ERROR'
    );
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Server responded with HTTP ${response.status}`;
    throw new ApiError(errorMsg, response.status, data?.code || 'SERVER_ERROR');
  }

  return data as T;
}

/**
 * Safe fetch wrapper that always runs parseApiResponse
 */
export async function safeFetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (networkErr: any) {
    throw new ApiError(
      `Network connection failure: ${networkErr.message || 'Unable to reach backend server.'}`,
      0,
      'NETWORK_FAILURE'
    );
  }

  return parseApiResponse<T>(response);
}
