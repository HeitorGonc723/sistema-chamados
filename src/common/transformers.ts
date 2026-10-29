import { Transform } from 'class-transformer';

/** Remove espaços do início e do fim de textos. */
export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** Remove espaços e converte para minúsculas (usado em e-mails). */
export const TrimLower = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
