// Vite injects import.meta.env at build time; give test code the same shape.
if (!(import.meta as any).env) {
  ;(import.meta as any).env = {}
}
