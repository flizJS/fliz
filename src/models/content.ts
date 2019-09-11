export interface ContentData {
    steps: Array<Step>;
}

export interface Step {
    title: string;
    diagramState: string;
    focus: string | Array<string>;
    focusPath?: Array<string> | Array<Array<String>>;

    active?: boolean;
    diagramStateIndex?: any;
}