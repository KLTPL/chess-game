import { queryDB } from "../connect";

export type Translation = {
  text_key: string;
  translated_text: string;
};

export default async function getTranslation(
  translationTable: string,
  langCode: string
): Promise<Translation[]> {
  return (
    await queryDB(
      `
    SELECT text_key, translated_text
    FROM ${translationTable}
    WHERE language_code = $1
  `,
      [langCode]
    )
  ).rows;
}
