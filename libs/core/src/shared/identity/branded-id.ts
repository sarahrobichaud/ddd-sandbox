export type BrandedString<Brand extends string> = string & {
  readonly brand: Brand;
};
