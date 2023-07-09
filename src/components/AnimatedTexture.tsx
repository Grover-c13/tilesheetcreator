import React, {useEffect, useState} from "react";
import {generateBackgroundStyleForTile} from "../utils";
import {SheetTexturePosition} from "../model/TileDef";
import { useSelector } from "react-redux";
import { TilesetState } from "../state";

const TICK_FRAME_EVERY_X_MS = 60;

export function AnimatedTexture(props: { textures: SheetTexturePosition[], className: string}) {
    const sheetTextures = useSelector((state: TilesetState) => state.textures)

    const [frame, setFrame] = useState(0)
    useEffect(() => {
        let reqId: number;
        let then = Date.now()
        const playAnim = () => {
            const now = Date.now();
            const elapsed = now - then;

            if (elapsed > TICK_FRAME_EVERY_X_MS) {
                if (props.textures.length === 0) {
                    setFrame(0)
                } else {
                    setFrame((frame+1) % props.textures.length)
                }
                then = Date.now()
            }

            reqId = requestAnimationFrame(playAnim)
        }

        reqId = requestAnimationFrame(playAnim);
        return () => cancelAnimationFrame(reqId);
    }, [frame, props.textures])

    const backgroundCss = props.textures.length === 0 ? {} : generateBackgroundStyleForTile(props.textures[frame], sheetTextures[props.textures[frame].sheetId])
    return (
        <div style={backgroundCss} className={"w-[16px] h-[16px] " + props.className}/>
    );
}