import { ApplicationError } from 'src/library/error';
import { RouterContext } from 'src/types/context';
import tryToCatch from 'try-to-catch';

export function koaCallback(controller: (params: any) => Promise<any>) {
  return async (ctx: RouterContext & { files?: any }): Promise<void> => {
    const [err, httpResponse] = await tryToCatch(() => controller(ctx));
    if (err) {
      if (err instanceof ApplicationError) {
        ctx.status = err.status;
        ctx.body = { error: err.message };
        return;
      }

      ctx.status = 500;
      ctx.body = {
        error: 'An unkown error occurred.',
      };
      return;
    }

    ctx.set({
      'Content-Type': 'application/json',
    });
    ctx.type = 'json';
    ctx.status = httpResponse.status;
    ctx.body = httpResponse.body;
  };
}
