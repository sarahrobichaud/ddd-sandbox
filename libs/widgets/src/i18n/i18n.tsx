import en from '../../../../apps/web/APP/i18n/locales/en.json';
type TArgs = [string, Record<string, any>];
type PluralSuffix = '_zero' | '_one' | '_two' | '_few' | '_many' | '_other';

// If a key ends with a plural suffix, strip it.
// e.g. "name_one" -> "name"
type StripPlural<K extends string> = K extends `${infer Base}${PluralSuffix}` ? Base : K;

// For building dotted paths, normalize only the last segment.
type JoinNormalized<P extends string, K extends string> = P extends ''
  ? StripPlural<K>
  : `${P}.${StripPlural<K>}`;

export type TFunction = (key: TArgs[0], args: TArgs[1]) => string;

import React from 'react';
const I18nContext = React.createContext<{ t: TFunction } | null>(null);

export function I18nProvider({ t, children }: React.PropsWithChildren<{ t: TFunction }>) {
  return <I18nContext.Provider value={{ t }}>{children}</I18nContext.Provider>;
}

type Join<P extends string, K extends string> = P extends '' ? K : `${P}.${K}`;
export type FlattenKeys<T, P extends string = ''> = T extends string | number | boolean | null
  ? never
  : T extends readonly any[]
    ? never
    : {
        [K in keyof T & string]: T[K] extends string | number | boolean | null | readonly any[]
          ? JoinNormalized<P, K>
          : // branch: return normalized key + recurse
            JoinNormalized<P, K> | FlattenKeys<T[K], Join<P, K>>;
      }[keyof T & string];

export type AppI18nKey = FlattenKeys<typeof en>;

export function useT() {
  const ctx = React.useContext(I18nContext);

  if (!ctx) {
    return undefined;
  }

  return ctx.t as (key: AppI18nKey, args?: Record<string, any>) => string;
}
