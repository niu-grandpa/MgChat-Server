import { db } from '../app';

function useDbCrud() {
  const getTable = (name: string) => db.collection(name);

  const onCreate = () => {};

  const onRead = () => {};

  const onUpdate = () => {};

  const onDelete = () => {};

  return {
    create: onCreate,
    read: onRead,
    update: onUpdate,
    delete: onDelete,
  };
}

export { useDbCrud };
