import express from 'express';
import { crudHandler } from '.';
import { useCreate } from '../../../hooks';
import { useGenerateUid } from '../../../hooks/useGenerateUid';
import { UserInfo, UserStatus } from '../../../types';
import { registerFields } from '../../fields';

const registerApi = express.Router();

registerApi.post('/register', (req, res) =>
  crudHandler({
    req,
    res,
    fields: registerFields,
    next: () => {
      // 初始化新用户数据
      initNewUserData(req.body).then(() =>
        useCreate({ req, res, tableProps: 'allUsers' })
      );
    },
  })
);

const initNewUserData = async (data: UserInfo) => {
  data.id = '';
  data.icon = '';
  data.city = '';
  data.age = 0;
  data.level = 1;
  data.credit = 0;
  data.gender = 2;
  data.privilege = 0;
  data.upgradeDays = 0;
  data.activeTime = 0;
  data.friends = [];
  data.groups = [];
  data.loginTime = 0;
  data.createTime = 0;
  data.password = '';
  data.phoneNumber = '';
  data.status = UserStatus.OFFLINE;
  data.account = await useGenerateUid();
};

export { registerApi };
