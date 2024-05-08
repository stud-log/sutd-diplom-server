import { FindOrCreateOptions, ModelStatic } from "sequelize";

import { Model } from "sequelize-typescript";

export async function updateOrCreate<T extends Model>(
  model: ModelStatic<T>,
  options: FindOrCreateOptions
): Promise<T> {
  const [ instance, created ] = await model.findOrCreate({
    where: options.where,
    defaults: options.defaults,
  });
  
  if (!created) {
    await instance.update(options.defaults);
  }
  
  return instance as T;
}