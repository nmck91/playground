/**
 * Football Director Engine - Module Registry
 *
 * Provides a central registry for dependency injection.
 * Allows modules to be registered and retrieved in a type-safe manner.
 *
 * Story 1.4.4 - AC 4: Module Registration System
 */

/**
 * Module Factory Function
 * Returns an instance of a module
 */
type ModuleFactory<T> = () => T;

/**
 * Module Registry Entry
 * Can be either a direct instance or a factory function
 */
type ModuleEntry<T> = {
  instance?: T;
  factory?: ModuleFactory<T>;
  singleton: boolean;
};

/**
 * Module Registry
 *
 * Central registry for managing module instances and their dependencies.
 * Supports both singleton and transient instances.
 *
 * Usage:
 * ```typescript
 * // Register a singleton module
 * registry.register('matchSimulator', createMatchSimulator, { singleton: true });
 *
 * // Register a transient module
 * registry.register('teamGenerator', createTeamGenerator, { singleton: false });
 *
 * // Retrieve a module
 * const matchSimulator = registry.get('matchSimulator');
 * ```
 */
export class ModuleRegistry {
  private modules = new Map<string, ModuleEntry<unknown>>();

  /**
   * Register a module with the registry
   *
   * @param key - Unique identifier for the module
   * @param factory - Factory function to create the module instance
   * @param options - Configuration options
   * @param options.singleton - If true, the same instance is returned on every get() call
   */
  register<T>(
    key: string,
    factory: ModuleFactory<T>,
    options: { singleton: boolean } = { singleton: true }
  ): void {
    if (this.modules.has(key)) {
      throw new Error(`Module '${key}' is already registered`);
    }

    this.modules.set(key, {
      factory,
      singleton: options.singleton,
    });
  }

  /**
   * Register a pre-created module instance
   * Always treated as a singleton
   *
   * @param key - Unique identifier for the module
   * @param instance - Pre-created module instance
   */
  registerInstance<T>(key: string, instance: T): void {
    if (this.modules.has(key)) {
      throw new Error(`Module '${key}' is already registered`);
    }

    this.modules.set(key, {
      instance,
      singleton: true,
    });
  }

  /**
   * Retrieve a module from the registry
   *
   * @param key - Unique identifier for the module
   * @returns The module instance
   * @throws Error if module is not registered
   */
  get<T>(key: string): T {
    const entry = this.modules.get(key) as ModuleEntry<T> | undefined;

    if (!entry) {
      throw new Error(
        `Module '${key}' is not registered. ` +
        `Make sure initializeEngine() is called at application startup. ` +
        `Available modules: ${Array.from(this.modules.keys()).join(', ')}`
      );
    }

    // Return existing instance if singleton
    if (entry.singleton && entry.instance) {
      return entry.instance;
    }

    // Create new instance
    if (!entry.factory) {
      throw new Error(`Module '${key}' has no factory function`);
    }

    const instance = entry.factory();

    // Store instance if singleton
    if (entry.singleton) {
      entry.instance = instance;
    }

    return instance;
  }

  /**
   * Check if a module is registered
   *
   * @param key - Unique identifier for the module
   * @returns True if the module is registered
   */
  has(key: string): boolean {
    return this.modules.has(key);
  }

  /**
   * Unregister a module
   * Useful for testing or hot-reloading
   *
   * @param key - Unique identifier for the module
   */
  unregister(key: string): void {
    this.modules.delete(key);
  }

  /**
   * Clear all registered modules
   * Useful for testing
   */
  clear(): void {
    this.modules.clear();
  }

  /**
   * Get all registered module keys
   *
   * @returns Array of module keys
   */
  keys(): string[] {
    return Array.from(this.modules.keys());
  }
}

/**
 * Global module registry instance
 * Use this for application-wide module registration
 */
export const globalRegistry = new ModuleRegistry();

/**
 * Create a new isolated registry
 * Useful for testing or creating separate module contexts
 */
export function createRegistry(): ModuleRegistry {
  return new ModuleRegistry();
}
