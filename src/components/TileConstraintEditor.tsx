import React from "react";
import { TileDef, TilePlacementConstraint } from "../model/TileDef";
import { DragTypes } from "../CommonTypes";
import { useDrop } from "react-dnd";
import { TilesetState, addConstraint, removeConstraint } from "../state";
import { useDispatch, useSelector } from "react-redux";
import { Tile } from "./Tile";
import { DangerButton, SmallDangerButton } from "./ActionBar";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const TOP = {x: 0, y: 1, layer: 0, reverseSource: false}
const BOTTOM = {x: 0, y: 1, layer: 0, reverseSource: true}
const RIGHT = {x: 1, y: 0, layer: 0, reverseSource: false}
const LEFT = {x: 1, y: 0, layer: 0, reverseSource: true}


export const TileContraintEditor = ({tile}: {tile: TileDef}) => {
    const constraints = useSelector((state: TilesetState) => state.constraints.filter(c => c.sourceTileId === tile.tileId || c.constraintTileId === tile.tileId))
    const tilesheet = useSelector((state: TilesetState) => state.tiles)
    const dispatch = useDispatch()

    return (
        <div>
            <h1 className="font-bold">Tile Constraints</h1>
            <h2 className="font-semibold">Add</h2>
            <div>
                <div>
                    <div className="inline-block w-16 h-16">&nbsp;</div>
                    <DropableSquare tile={tile} position={TOP}>Top</DropableSquare>
                    <div className="inline-block w-16 h-16">&nbsp;</div>
                </div>
                <div>
                    <DropableSquare tile={tile} position={LEFT}>Left</DropableSquare>
                    <div className="inline-block w-16 h-16">&nbsp;</div>
                    <DropableSquare tile={tile} position={RIGHT}>Right</DropableSquare>
                </div>
                <div>
                    <div className="inline-block w-16 h-16">&nbsp;</div>
                    <DropableSquare tile={tile} position={BOTTOM}>Bottom</DropableSquare>
                    <div className="inline-block w-16 h-16">&nbsp;</div>
                </div>
            </div>
            <h2 className="mt-5 font-semibold">Constraints</h2>
            <div className={"flex flex-col"}>
                {constraints.map(c => <Constraint selectedTile={tile.tileId} constraint={c}/>)}
            </div>
            <hr />
        </div>
    )
}


type RelativePosition =  {x: number, y: number, layer: number, reverseSource: boolean}
const DropableSquare = ({tile, position, children}: {tile: TileDef, position: RelativePosition, children: String | JSX.Element}) => {
    const dispatch = useDispatch()
    const [, drop] = useDrop(() => ({
        accept: DragTypes.Tile,
        drop: (e: TileDef) => {
            if (position.reverseSource) {
                dispatch(addConstraint(
                    {
                        sourceTileId: e.tileId,
                        constraintTileId: tile.tileId,
                        relativeX: position.x,
                        relativeY: position.y,
                        relativeLayer: position.layer 
                    }
                ))
            } else {
                dispatch(addConstraint(
                    {
                        sourceTileId: tile.tileId,
                        constraintTileId: e.tileId,
                        relativeX: position.x,
                        relativeY: position.y,
                        relativeLayer: position.layer 
                    }
                ))
            }
     
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
    if (position.reverseSource) {
        if (arePositionEquals(position, BOTTOM)) return "Bottom"
        if (arePositionEquals(position, LEFT)) return "Left"
    } else {
        if (arePositionEquals(position, TOP)) return "Top"
        if (arePositionEquals(position, RIGHT)) return "Right"
    }
}

function arePositionEquals(a: RelativePosition, b: RelativePosition): boolean {
    return a.x === b.x && a.y === b.y && a.layer === b.layer
}

export const Constraint = (props: {selectedTile: String, constraint: TilePlacementConstraint}) => {
    const dispatch = useDispatch()
    const tilesheet = useSelector((state: TilesetState) => state.tiles)

    let label = "Unknown"

    let constraintedTileId = undefined;
    if (props.constraint.sourceTileId === props.constraint.constraintTileId) {
        constraintedTileId = props.constraint.constraintTileId
        if (props.constraint.relativeX == 1 && props.constraint.relativeY == 0) label = "Left/Right"
        if (props.constraint.relativeX == 0 && props.constraint.relativeY == 1) label = "Top/Bottom"
    } else if (props.selectedTile == props.constraint.sourceTileId) {
        constraintedTileId = props.constraint.constraintTileId
        if (props.constraint.relativeX == 1 && props.constraint.relativeY == 0) label = "Right"
        if (props.constraint.relativeX == 0 && props.constraint.relativeY == 1) label = "Top"
    } else {
        constraintedTileId = props.constraint.sourceTileId
        if (props.constraint.relativeX == 1 && props.constraint.relativeY == 0) label = "Left"
        if (props.constraint.relativeX == 0 && props.constraint.relativeY == 1) label = "Bottom"
    }

    return (
        <div className="flex flex-row justify-between items-baseline">
            <div>
                <Tile tileDef={tilesheet[constraintedTileId]} hideSelection={true} displayTileId={false} />
                <span>{constraintedTileId}</span>
            </div>
            <span>{label}</span>
            <SmallDangerButton onClick={() => {dispatch(removeConstraint(props.constraint))}} icon={faTrash} tooltip="Remove Constraint" />
        </div>
    )
}