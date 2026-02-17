import { BehaviorError, EntityCandidate, Identifier, FactoryError } from "#shared/domain/types";
import { randomUUID } from "node:crypto";
import { ValidationErrorOld } from "./domain-error";

export class Entity<Props extends EntityCandidate> {
  protected _props: Props;
  protected _values: Props["values"];

  constructor(props: Props) {
    this._props = props;
    this._values = props.values;
  }

  protected static get defaultValues(): Omit<EntityCandidate, "values"> {
    return {
      id: this.generateId(),
      version: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }

  public get id(): Identifier {
    return this._props.id;
  }

  public get version(): Identifier {
    return this._props.version;
  }

  static generateId(): Identifier {
    return randomUUID();
  }

  public toPersistence(): Props {
    return this._props;
  }

  public touch(): void {
    this._props.updatedAt = new Date();
  }

  public delete(): void {
    this._props.deletedAt = new Date();
    this.touch();
  }

  public restore(): void {
    this._props.deletedAt = null;
    this.touch();
  }

  protected static factorySuccess<T>(data: T): [null, T] {
    return [null, data];
  }

  protected static factoryError(errors: ValidationErrorOld[]): [ValidationErrorOld[], null] {
    return [errors, null];
  }

  protected static behaviorSuccess<T>(data: T): [null, T] {
    return [null, data];
  }

  protected static behaviorError(error: BehaviorError): [BehaviorError, null] {
    return [error, null];
  }
}
