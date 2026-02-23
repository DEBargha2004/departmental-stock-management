export async function catchError<T>(
  promise: Promise<T>,
): Promise<[null, T] | [Error, null]> {
  try {
    const res = await promise;
    return [null, res];
  } catch (error) {
    return [error as Error, null];
  }
}
