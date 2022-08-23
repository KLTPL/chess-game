export default class MapOfPiecesOnBoardAtStart {
    constructor(whitesPerspective, map) {
        this.whitesPerspective = whitesPerspective;
        this.map = (map) ? map : this.getDeafultPiecesMapFromPerspective(this.whitesPerspective);
    }
    getDeafultPiecesMapFromPerspective(whitesPerspective) {
        const deafultPiecesMapFromWhitesPerspective = [
            ["b2", "b3", "b4", "b5", "b6", "b4", "b3", "b2"],
            [8, "b1"],
            [4], [8, "empty"],
            [8, "w1"],
            ["w2", "w3", "w4", "w5", "w6", "w4", "w3", "w2"],
        ];
        return (whitesPerspective) ?
            deafultPiecesMapFromWhitesPerspective :
            this.invertMap(deafultPiecesMapFromWhitesPerspective);
    }
    invertMap(map) {
        var _a;
        let newMap = [];
        for (let r = map.length - 1; r >= 0; r--) {
            if (((_a = map[r - 1]) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                newMap[newMap.length] = map[r - 1];
                map.splice(r - 1, 1);
                continue;
            }
            newMap[newMap.length] = [];
            for (let c = map[r].length - 1; c >= 0; c--) {
                if (typeof map[r][c - 1] === "number") {
                    newMap[newMap.length - 1].push(map[r][c - 1], map[r][c]);
                    c--;
                }
                else {
                    newMap[newMap.length - 1].push(map[r][c]);
                }
            }
        }
        return newMap;
    }
}
