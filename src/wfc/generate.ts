import { faLessThanEqual } from "@fortawesome/free-solid-svg-icons";
import { TilePlacementConstraint } from "../model/TileDef";
import { TilesetState } from "../state";

export function generate(tilesheet: TilesetState, width: number, height: number) {
    let tileLayer: string[][][] = []
    const banned: string[][][] = []
    let firstPick = true;

    for (let row = 0; row < width; row++) {
        tileLayer[row] = []
        banned[row] = []
        for (let col = 0; col < height; col++) {
            const allTiles = Object.keys(tilesheet.tiles)
            tileLayer[row][col] = allTiles
            banned[row][col] = []
        }
    }

    const constraints = reflexConstraints(tilesheet.constraints)
    const lookup = createConstraintLookup(constraints)

    while (!areAllAssigned(tileLayer)) {
        const nextPos = firstPick ? {row: Math.floor(Math.random()*width), col: Math.floor(Math.random()*height)} : findLowestConstraints(tileLayer)
        console.log(nextPos)
        firstPick = false
        const assignment = selectValue(tileLayer[nextPos.row][nextPos.col], banned[nextPos.row][nextPos.col])

        if (assignment === undefined) {
            return []
        }
        const beforePropState = [...tileLayer.map(l => [...l.map(t => [...t])])]

        // TODO: on invalid, unwind - go back to pre-propagation state and ban original choice
        // if we run out of choices, restart
        let propagationStack = [{row: nextPos.row, col: nextPos.col, constraints: [assignment]}]
        while (propagationStack.length > 0) {
            const current = propagationStack.pop()
            if (!isPositionInBounds(tileLayer, current.row, current.col)) continue

            if (current.constraints.length === 0) {
                console.error("INVALID WFC - rolling back")
                banned[nextPos.row][nextPos.col].push(assignment)
                propagationStack = []
                tileLayer = beforePropState
            } else {
                tileLayer[current.row][current.col] = current.constraints
                const calc = calculateConstraintsAroundTile(current.constraints, lookup)

                const propagate = (dir: "top" | "bottom" | "left" | "right", rx: number, ry: number) => {
                    const currentConstraints = safeGet(tileLayer, current.row+ry, current.col+rx)
                    const newConstraints = intersect(calc[dir], currentConstraints)
                    
                    if (!arraysEqual(currentConstraints, newConstraints)) {
                        propagationStack.push({row: current.row+ry, col: current.col+rx, constraints: newConstraints})
                    }
                }
   
                propagate("top", 0, -1)
                propagate("bottom", 0, 1)
                propagate("left", -1, 0)
                propagate("right", 1, 0)
            }
        }
    }

    return tileLayer
}

function selectValue(ids: string[], banned: string[]) {
    const unbannedOptions = ids.filter(id => !banned.includes(id))
    if (unbannedOptions.length === 0) return undefined
    return unbannedOptions[Math.floor(Math.random()*unbannedOptions.length)]
}

function areAllAssigned(tilemap: string[][][]) {
    for (const row of tilemap) {
        for (const tiles of row) {
            if (tiles.length > 1) {
                return false
            }
        }
    }

    return true
}

function findLowestConstraints(tilemap: string[][][]): {row: number, col: number} {
    let lowestRow, lowestCol;
    let smallest = 99999999;
    for (const row in tilemap) {
        for (const col in tilemap) {
            const choices = tilemap[row][col].length
            if (choices == 2) {
                return {row: Number(row), col: Number(col)}
            } else if (choices > 2 && choices < smallest) {
                smallest = choices
                lowestRow = row
                lowestCol = col
            }
        }
    }


    return {row: Number(lowestRow), col: Number(lowestCol)}
}

function reflexConstraints(constraints: TilePlacementConstraint[]): TilePlacementConstraint[] {
    return [...constraints, ...constraints.map(it => {
        return {
            sourceTileId: it.constraintTileId,
            constraintTileId: it.sourceTileId,
            relativeX: -it.relativeX,
            relativeY: -it.relativeY,
            relativeLayer: -it.relativeLayer
        }
    })]
}

export type OutputConstraints = {
    top: string[],
    bottom: string[],
    left: string[],
    right: string[]
}

function calculateConstraintsAroundTile(tileOptions: string[], constraintLookup: { [key: string]: TilePlacementConstraint[] }): OutputConstraints {
    const getTileOptions = (tileId: string, x: number, y: number): string[] => {
        return [...
            constraintLookup[tileId]
            .filter(c => c.sourceTileId === tileId && c.relativeX === x && c.relativeY === y)
            .map(c => c.constraintTileId)
        ]
    }

    return {
        top: union(...tileOptions.map(t => getTileOptions(t, 0, 1))),
        bottom: union(...tileOptions.map(t => getTileOptions(t, 0, -1))),
        left: union(...tileOptions.map(t => getTileOptions(t, -1, 0))),
        right: union(...tileOptions.map(t => getTileOptions(t, 1, 0))),
    }
}


function intersect(...arrs: string[][]) {
    return [...new Set(arrs.reduce((a, b) => a.filter(Set.prototype.has, new Set(b))))];
}

function union(...arrs: string[][]) {
    return arrs.reduce((a, b) => [...new Set([...a, ...b])]) 
}


function isPositionInBounds(tilearray: string[][][], x: number, y: number): boolean {
    if (x < 0) return false
    if (x >= tilearray.length) return false
    if (y < 0) return false
    if (y >= tilearray[x].length) return false
    return true
}

function safeGet(tilearray: string[][][], row: number, col: number): string[] {
    if (!isPositionInBounds(tilearray, row, col)) {
        return []
    }

    return tilearray[row][col]
}

function arraysEqual(a: string[], b: string[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    a.sort()
    b.sort()

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function createConstraintLookup(constraints: TilePlacementConstraint[]) {
    const lookup: { [key: string]: TilePlacementConstraint[] } = {}
    for (const c of constraints) {
        if (!(c.sourceTileId in lookup)) {
            lookup[c.sourceTileId] = []
        }

        lookup[c.sourceTileId].push(c)
    }

    return lookup
  }