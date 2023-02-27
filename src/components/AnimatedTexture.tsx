import React, {useEffect, useState} from "react";
import {generateBackgroundStyleForTile} from "../utils";
import {SheetPos} from "../model/TileDef";

const TICK_FRAME_EVERY_X_MS = 60;

export function AnimatedTexture(props: {image: string, textures: SheetPos[], className: string}) {
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

    const backgroundCss = props.textures.length === 0 ? {} : generateBackgroundStyleForTile(props.textures[frame], props.image)
    return (
        <div style={backgroundCss} className={"w-[16px] h-[16px] " + props.className}/>
    );
}