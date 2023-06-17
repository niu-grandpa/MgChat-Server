import { DbTable } from '../types';
import { UseApiHandler } from './types';
import { useDbCrud } from './useDbCrud';

/**
 * useApiHandler
 *
 * 检查客户端传递的参数字段是否缺失、类型是否正确、验证码是否有效，并提供中间件功能
 */
async function useApiHandler({
  response,
  required,
  middleware,
  verifyCaptcha,
}: UseApiHandler) {
  if (required !== undefined) {
    const { target, check, must } = required;
    const map: Record<string, string[]> = {};
    let pass = true;

    // 检查字段是否缺失
    if (must && must.length) {
      for (const key of must) {
        if (!(key in target)) {
          pass = false;
          response.status(500);
          response.send(`接口缺少参数 "${key}", 必填参数项: [${must}]`);
          break;
        }
      }
      if (!pass) return;
    }

    // 检查字段类型是否正确
    check?.forEach(({ type, fields }) => (map[type] = fields));

    for (const type in map) {
      for (const field of map[type]) {
        if (target[field] && typeof target[field] !== type.toLowerCase()) {
          pass = false;
          response.status(500);
          response.send(`参数字段类型错误："${field}" 的类型应为 "${type}"`);
          break;
        }
      }
      if (!pass) return;
    }
  }

  // 检查验证码是否有效
  if (verifyCaptcha && !(await isCaptchaValid(verifyCaptcha))) {
    response.send('验证码无效');
    return;
  }

  // 执行函数中间件
  try {
    while (middleware.length) {
      const fn = middleware.shift()!;
      if ((isAsyncFunction(fn) && (await fn()) === false) || fn() === false) {
        break;
      }
    }
  } catch (e) {
    console.error(`[useApiHandler] error: ${e}`);
  }
}

function isAsyncFunction(fn: any) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}

async function isCaptchaValid(
  data: UseApiHandler['verifyCaptcha']
): Promise<boolean> {
  const { code, phoneNumber } = data!;
  const { read } = useDbCrud();
  return (
    (await read({
      table: DbTable.CAPTCHAS,
      filter: { $and: [{ code }, { phoneNumber }] },
    })) !== null
  );
}

export { useApiHandler };
