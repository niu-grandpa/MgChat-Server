export function useCheckParams(fields: string[], obj: Object) {
  for (const field of fields) {
    if (!(field in obj)) {
      return { code: 500, msg: '请检查是否缺失参数' };
    }
  }
  return true;
}
