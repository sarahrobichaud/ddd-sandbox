import { DomainErrorOld, ValidationErrorOld } from "#shared/domain/domain-error";

export type Identifier = string;
export type VersionIdentifier = string;

export interface Identifiable {
  id: Identifier;
}

export interface Auditable {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt: Date | null;
}

export interface Versionable {
  version: VersionIdentifier;
}

export interface WithRichValues {
  values: Record<string, any>;
}

export interface EntityCandidate extends Identifiable, Auditable, SoftDeletable, Versionable, WithRichValues {}

export type FactoryError = ValidationErrorOld[];
export type BehaviorError = DomainErrorOld;

export type FactoryResult<T> = [null, T] | [FactoryError, null];
export type BehaviorResult<T> = [null, T] | [BehaviorError, null];
