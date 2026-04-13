const NORMALIZED_SEARCH_SOURCE =
  'áàâãäåÁÀÂÃÄÅéèêëÉÈÊËíìîïÍÌÎÏóòôõöÓÒÔÕÖúùûüÚÙÛÜçÇñÑýÿÝ';

const NORMALIZED_SEARCH_TARGET =
  'aaaaaaAAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUcCnNyyY';

export function normalizeTextForSearch(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getPostgresAccentInsensitiveExpression(column: string): string {
  return `LOWER(TRANSLATE(${column}, '${NORMALIZED_SEARCH_SOURCE}', '${NORMALIZED_SEARCH_TARGET}'))`;
}
