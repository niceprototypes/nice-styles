/**
 * Registry initialization.
 *
 * Imported by the main entry point (index.ts) so the registry is seeded
 * before any getter is called.
 */

// Side-effect import — mutates the singleton in `./registry/createRegistry.ts`.
import './registry/index.js'