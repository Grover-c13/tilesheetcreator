import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {addTileDef, clearTiles, reset, TilesetState} from "../state";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faEraser,
    faLayerGroup,
    IconDefinition,
    faTrash,
    faTableCellsLarge
} from '@fortawesome/free-solid-svg-icons'



export const ActionBar = (props: {className: string}) => {
    const dispatch = useDispatch()
    const state = useSelector((state: TilesetState) => state)

    const addTileWithTextures = () => {
        const id = (state.nextTileId).toString()
        dispatch(addTileDef({
            tileId: id,
            name: id,
            tileType: "STATIC",
            textures: [
                ...state.selectedTextures
            ]
        }))
    }

    return (
        <div className={props.className}>
            <ActionButton onClick={() => download(state)} icon={faDownload} tooltip="Save Json" />
            <ActionButton onClick={() => addTileWithTextures()} icon={faLayerGroup} tooltip="Add selected textures as one tile" />
            <DangerButton onClick={() => dispatch(clearTiles())} icon={faEraser} tooltip="Remove all tiles" />
            <DangerButton onClick={() => dispatch(reset())} icon={faTrash} tooltip="Reset the project" />
        </div>
    );
}

function download(state: TilesetState) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const anchorEleement = document.createElement('a');
    anchorEleement.setAttribute("href", dataStr);
    anchorEleement.setAttribute("download", "tileset.json");
    anchorEleement.click();
    anchorEleement.remove();
}

export const ActionButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-blue-500 hover:bg-blue-700 text-white font-bold border border-blue-700 rounded block p-2 mb-2 w-10 h-10"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} />
        </button>
    )
}

export const SmallActionButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-blue-500 hover:bg-blue-700 text-white font-bold border border-blue-700 rounded block w-6 h-6 inline-block"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} size={"xs"}/>
        </button>
    )
}


export const DangerButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-red-500 hover:bg-red-700 text-white font-bold border border-red-700 rounded block p-2 mb-2 w-10 h-10"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} />
        </button>
    )
}

export const SmallDangerButton = (props: {onClick: () => void, icon: IconDefinition, tooltip: string}) => {
    return (
        <button
            className={"bg-red-500 hover:bg-red-700 text-white font-bold border border-red-700 rounded block w-6 h-6 inline-block"}
            onClick={() => props.onClick()}
            title={props.tooltip}
        >
            <FontAwesomeIcon icon={props.icon} size={"xs"}/>
        </button>
    )
}

