import type { Schema, z } from "zod";

export type TypesafeEnvOptions = {
  throw?: boolean;
  warn?: boolean;
  failFast?: boolean;
};

const log =
  (warn: boolean) =>
    (...args: unknown[]) => {
      if (warn) {
        console.warn(...args);
      } else {
        console.error(...args);
      }
    };

export const typesafeEnv =
  <T extends Schema>(
    schema: T,
    opts: TypesafeEnvOptions = { failFast: true, throw: true },
  ) =>
    (envs: Record<string, string>): z.infer<T> => {
      const logger = log(!!opts.warn);
      const result = schema.safeParse(envs);

      if (!result.success && opts.failFast) {
        const msg = `Environment validation failed\n${result.error.errors.map((e) => `${e.path[0]}: ${e.message}`).join("\n")}`;
        if (opts.throw) {
          throw new Error(msg);
        }

        logger(msg);
        return;
      }

      return new Proxy({} as z.infer<T>, {
        get(_, prop: string) {
          if (!result.success) {
            const msg = `Environment validation failed\n${result.error.errors.map((e) => `${e.path[0]}: ${e.message}`).join("\n")}`;
            if (opts.throw) {
              throw new Error(msg);
            }

            logger(msg);
            return;
          }

          return result.data[prop];
        },
      });
    };
