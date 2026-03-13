function deepPick(schema: any, propertyPath: string) {
  const properties = propertyPath.split('.');

  if (properties.length === 0) {
    return schema;
  }

  const currentProperty = properties[0];
  if (properties.length === 1) {
    return schema.pick({ [currentProperty]: true });
  }

  const nextPropertyPath = properties.slice(1, properties.length).join('.');
  const nextSchema = schema.shape[currentProperty];
  if (!nextSchema) return schema;

  return deepPick(nextSchema, nextPropertyPath);
}
