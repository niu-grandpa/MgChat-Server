import { UseApiHandler } from './types';

/**
 * useApiHandler
 *
 * 检查客户端调用的接口传递的参数字段是否缺失与类型是否正确，并提供中间件功能
 */
async function useApiHandler({
  response,
  required,
  middleware,
}: UseApiHandler) {
  if (required !== undefined) {
    const { target, check } = required;
    const map: Record<string, string[]> = {};

    check.forEach(({ type, fields }) => {
      map[type] = fields;
    });

    let pass = true;
    // 检查字段类型是否正确
    Object.keys(map).forEach(type => {
      const fields = map[type];
      for (const field of fields) {
        if (target[field] && typeof target[field] !== type.toLowerCase()) {
          pass = false;
          response.status(500);
          response.send(`参数字段类型错误："${field}" 的类型应为 "${type}"`);
          break;
        }
      }
    });

    if (!pass) return;

    // 执行函数中间件
    try {
      while (middleware.length) {
        const fn = middleware.shift()!;
        if ((await fn()) === false) break;
      }
    } catch (e) {
      console.log(`[useApiHandler] error: ${e}`);
    }
  }
}

export { useApiHandler };
