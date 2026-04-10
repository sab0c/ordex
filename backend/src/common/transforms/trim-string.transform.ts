import { TransformFnParams } from 'class-transformer';

export function trimStringTransform({ value }: TransformFnParams): string {
  return typeof value === 'string' ? value.trim() : (value as string);
}
