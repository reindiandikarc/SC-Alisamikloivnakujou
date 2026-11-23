// Shim 'he' untuk kode vanXone: he@2 ESM-only tanpa export default,
// sedangkan plugin memakai `import he from 'he'`. Namespace dijadikan default.
import * as ns from 'he'
export * from 'he'
export default ns
