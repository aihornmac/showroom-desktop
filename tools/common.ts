export async function run<T>(fn: () => T | PromiseLike<T>): Promise<void> {
  try {
    await fn()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}
