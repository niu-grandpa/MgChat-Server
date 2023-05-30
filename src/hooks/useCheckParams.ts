export function useCheckParams(fields: string[], obj: Object) {
  for (const field of fields) {
    if (!field.startsWith('?') && !(field in obj)) {
      return { code: 500, msg: `缺少参数字段: "${field}"` };
    }
  }
  return true;
}
