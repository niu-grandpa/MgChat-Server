import { Express } from 'express';
import MessageApi from './api/message';
import UserApi from './api/user';

function useRegisterApi(app: Express) {
  /**
   * 设置允许跨域
   */
  app.all('*', (req, res, next) => {
    const { origin, Origin, referer, Referer } = req.headers;
    const allowOrigin = origin || Origin || referer || Referer || '*';
    res.header('Access-Control-Allow-Origin', allowOrigin);
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true'); //可以带cookies
    res.header('X-Powered-By', 'Express');
    if (req.method == 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  /**
   * 接口注册
   */

  // 批量注册user接口
  UserApi.forEach(api => app.use('/api/user', api));
  // 消息接口
  app.use('/api/message', MessageApi);
}

export default useRegisterApi;
