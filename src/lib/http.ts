export function jsonError(error: string, status: number) {
  return Response.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function jsonSuccess(
  data: Record<string, unknown> = {},
  status = 200
) {
  return Response.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

export async function readJson<T>(
  request: Request
): Promise<
  { ok: true; data: T } | { ok: false; response: Response }
> {
  try {
    const data = (await request.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: jsonError("Invalid JSON", 400),
    };
  }
}

export async function parseResponseJson(response: Response): Promise<{
  success?: boolean;
  error?: string;
  [key: string]: any;
}> {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      error: "Invalid response",
    };
  }
}
