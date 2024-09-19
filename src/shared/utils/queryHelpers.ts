import { Order } from "sequelize";

/**
 * Parse string into array of type `T`
 * Calls given function on parsed array if `value` is not falsy and if parsed array has elements
 */
export const useArrayFromStringParam = <T>(value?: string, cb?: (parsedArray: T[]) => void) => {
  if(!value) return;
  const arr = JSON.parse(value) as T[];
  if(!arr.length) return;
  if(cb) cb(arr);
};

/**
 * Parse string of mui x-data-grid into type `Order`
 * If sortmodel is incorrect return `defaultSort`. In other cases return `[ 'createdAt', 'ASC' ]`
 */
export const useSortModel = (sortModel?: string, defaultSort?: [string, string]): Order => {
  const m = sortModel
    ? (JSON.parse(sortModel) as { sortModel: { field: string; sort: string }[] })
    : false;
  if(!m) {
    return defaultSort ? defaultSort : [ [ 'createdAt', 'ASC' ] ];
  }

  return m.sortModel.map(i => [ i.field, i.sort ]);
};