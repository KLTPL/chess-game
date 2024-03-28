import { v4 as uuidv4 } from "uuid";
export default async function generateUniqueDisplayId(
  isDisplayIdUnique: (displayId: string) => Promise<boolean>
): Promise<string> {
  let displayId = uuidv4();
  while (!(await isDisplayIdUnique(displayId))) {
    displayId = uuidv4();
  }
  return displayId;
}
