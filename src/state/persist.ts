import {TilesetState} from "./index";

export const saveState = (state: TilesetState) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch {
    }
};

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState) as TilesetState;
    } catch (err) {
        return undefined;
    }
};