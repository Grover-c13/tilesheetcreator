import React from "react";
import { TileDef, TilePlacementConstraint } from "../model/TileDef";
import { DragTypes } from "../CommonTypes";
import { useDrop } from "react-dnd";
import { TilesetState, addConstraint, removeConstraint } from "../state";
import { useDispatch, useSelector } from "react-redux";
import { Tile } from "./Tile";
import { DangerButton, SmallDangerButton } from "./ActionBar";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const TOP = {x: 0, y: 1, layer: 0}
const RIGHT = {x: 1, y: 0, layer: 0}
const ABOVE = {x: 0, y: 0, layer: 1}

export const TileContraintEditor = ({tile}: {tile: TileDef}) => {
    const constraints = useSelector((state: TilesetState) => state.constraints.filter(c => c.sourceTileId === tile.tileId))
    const tilesheet = useSelector((state: TilesetState) => state.tiles)
    const dispatch = useDispatch()

    return (
        <div>
            <h1 className="font-bold">Tile Constraints</h1>
            <h2 className="font-semibold">Add</h2>
            <div>
                <div>
                    <DropableSquare tile={tile} position={TOP}>Top</DropableSquare>
                </div>
                <div>
                    <DropableSquare tile={tile} position={ABOVE}>Above</DropableSquare>
                    <DropableSquare tile={tile} position={RIGHT}>Right</DropableSquare>
                </div>
            </div>
            <h2 className="mt-5 font-semibold">Constraints</h2>
            <div className={"flex flex-col"}>
                {constraints.map(c => <div className={"flex flex-row justify-between items-baseline"}>
                    <div>
                        <Tile tileDef={tilesheet[c.constraintTileId]} ignoreSelection={false} displayTileId={false} />
                        <span>{c.constraintTileId}</span>
                    </div>
                    <span>{mapPositionToLabel({x: c.relativeX, y: c.relativeY, layer: c.relativeLayer})}</span>
                    <SmallDangerButton onClick={() => {dispatch(removeConstraint(c))}} icon={faTrash} tooltip="Remove Constraint" />
                </div>)}
            </div>
            <hr />
        </div>
    )
}


type RelativePosition =  {x: number, y: number, layer: number}
const DropableSquare = ({tile, position, children}: {tile: TileDef, position: RelativePosition, children: String | JSX.Element}) => {
    const dispatch = useDispatch()
    const [, drop] = useDrop(() => ({
        accept: DragTypes.Tile,
        drop: (e: TileDef) => {
            dispatch(addConstraint(
                {
                    sourceTileId: tile.tileId,
                    constraintTileId: e.tileId,
                    relativeX: position.x,
                    relativeY: position.y,
                    relativeLayer: position.layer 
                }
            ))
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [tile])

    return (
        <div ref={drop} className="border-dashed border-2 border-grey-500 inline-block w-16 h-16">{children}</div>
    )
}

function mapPositionToLabel(position: RelativePosition) {
    if (arePositionEquals(position, TOP)) return "Top"
    if (arePositionEquals(position, RIGHT)) return "Right"
    if (arePositionEquals(position, ABOVE)) return "Above"
}

function arePositionEquals(a: RelativePosition, b: RelativePosition): boolean {
    return a.x === b.x && a.y === b.y && a.layer === b.layer
}