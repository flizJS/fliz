export interface DiagramData {
    states: Array<State>;
}

export interface State {
    diagramState: string;
    actions: Array<Action>;
    positions: Positions;
    connections: Connections
}

export interface Positions {
    [key: string]: [number, number];
}

export interface Connections {
    [key: string]: string | Array<string>;
}

export interface Action {
    method: string;
    items: Array<Item>;
}

export interface Item {
    id: string;
    icon: string;
    from: string;

    iconsUrl?: string;
}