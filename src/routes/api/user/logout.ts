import express from 'express';
import { useDbCrud } from '../../../hooks';
import { DbTable, DbUser, UserStatus } from '../../../types';
import { settlementUserLevelAndCredit } from './../../../core/index';

const logoutApi = express.Router();
const { read, update } = useDbCrud();

logoutApi.post('/logout', async (request, response) => {
  const common = {
    table: DbTable.USER,
    filter: { account: request.body.account },
  };
  const user = (await read(common)) as unknown as DbUser.UserInfo;

  user.status = UserStatus.OFFLINE;
  user.timeInfo.logoutTime = Date.now();

  settlementUserLevelAndCredit(user);

  await update({
    ...common,
    response,
    update: {
      $set: user,
    },
  });
});

export { logoutApi };
