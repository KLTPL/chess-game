export function pieceFENToId(pieceFEN: string) {
  switch (pieceFEN) {
    case "r":
      return 2;
    case "n":
      return 3;
    case "b":
      return 4;
    case "q":
      return 5;
    case "k":
      return 6;
    case "p":
      return 1;
    default:
      return null as never;
  }
}
