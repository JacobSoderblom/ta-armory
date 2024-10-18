export type Success<Value> = [value: Value, error: undefined] & {
  readonly value: Value;
};

export type Failure<Err> = [value: undefined, error: Err] & {
  readonly error: Err;
};

export type Result<Value = void, Err = void> = Success<Value> | Failure<Err>;

export const isSuccess = <Value = void, Err = void>(
  result: Result<Value, Err>,
): result is Success<Value> => result[1] === undefined && "value" in result;

export const isFailure = <Value = void, Err = void>(
  result: Result<Value, Err>,
): result is Failure<Err> => result[0] === undefined && "error" in result;

export const Ok = <Value = void>(value: Value): Success<Value> => {
  const success = [value, undefined] as Success<Value>;
  Object.defineProperty(success, "value", {
    get() {
      return this[0];
    },
    enumerable: true,
  });
  return success;
};

export const Err = <Err = void>(error: Err): Failure<Err> => {
  const failure = [undefined, error] as Failure<Err>;
  Object.defineProperty(failure, "error", {
    get() {
      return this[1];
    },
    enumerable: true,
  });
  return failure;
};
