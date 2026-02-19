import {
  DomainActionResult,
  DomainException,
  EntityNotFoundException,
  EntityResult,
  PersistenceException,
  ValidationResult,
  ValueResult,
} from "#shared/application/errors/domain-errors";

export class Service {
  /**
   * Unwrap a result and throw an error if the operation fails
   * @param result
   * @throws ValidationException if the operation fails with some validation errors
   * @throws BusinessRuleException if the operation fails with some business rules violations but no validation errors
   * @throws DomainException as a fallback
   * @returns The instance of the result
   */
  protected unwrapOrThrow<T>(
    result: DomainActionResult<T> | EntityResult<T> | ValueResult<T> | ValidationResult<T>
  ): T {
    if (!result.ok) {
      DomainException.throwAppropriate(result.errors);
    }
    return result.instance;
  }

  /**
   * Proxy a repository to wrap all methods with error handling
   * @param repository - The repository to proxy
   * @param repositoryName - The name of the repository
   * @returns The proxied repository
   */
  protected proxyRepository<T extends Record<string, any>>(
    repository: T,
    repositoryName: string = (repository as any).constructor.name
  ): T {
    return new Proxy(repository, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        // Only wrap functions
        if (typeof value !== "function") {
          return value;
        }

        // Return wrapped function with correct this binding
        return async (...args: any[]) => {
          try {
            return await (value as (...args: any[]) => Promise<any>).apply(target, args);
          } catch (error) {
            throw new PersistenceException(`${repositoryName}.${String(prop)} failed`, error, {
              method: String(prop),
              args,
            });
          }
        };
      },
    });
  }
}
