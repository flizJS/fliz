import * as d3 from 'd3';
import { Graph } from './graph';
import { Step, ContentData } from './models/content';
import { DiagramData, State, Positions, Connections, Action, Item } from './models/diagram';


export class Diagram {

    config: any;
    dispatch: d3.Dispatch<EventTarget>;

    private _allowedMethods: any = ['add', 'update', 'remove'];
    private _states: Array<State>;
    private _courseSteps: Array<Step>;
    private _stateIds: any = {};

    constructor(config: any) {
        if (!config) throw("Diagram endpoints are required");
        if (!config.iconsUrl) throw("'iconsUrl' endpoint is required");

        this.config = config;

        this.dispatch = d3.dispatch('loaded', 'change');
    }

    // Add event listeners
    on(type: any, callback: any) {
        this.dispatch.on(type, callback);
    }

    // Get graph at courseStep <index>
    get(index: number) {
        this.resolve(() => {
            this.getGraph(index);
        });
    }

    // Get graph at courseStep <index> where <index> is coerced to remain within courseStep bounds
    getBounded(index: number) {
        this.resolve(() => {
            index = this.boundedIndex(index);
            this.getGraph(index);
        });
    }

    // Get all courseSteps
    courseSteps(callback: (courseSteps: any) => any) {
        this.resolve(() => {
            callback(this._courseSteps);
        });
    }

    // Resolve the state (data) of the diagram.
    // Data comes from a remote source so every public function should
    // execute its logic as a callback to resolve();
    resolve(callback: () => any) {
        if (this._courseSteps) {
            callback();
        } else {
            d3.json(this.contentUrl()).then((courseData: ContentData) => {
                if (courseData) {
                    d3.json(this.diagramUrl()).then((diagramData: DiagramData) => {
                        if (diagramData) {
                            this._states = diagramData.states;
                            this.processStateIds(diagramData.states);
                            this._courseSteps = courseData.steps;
                            this._courseSteps.forEach((step: any, i: any) => {
                                step.index = i;
                                step.diagramStateIndex = this._stateIds[step.diagramState];
                            })
                            this.dispatch.call('loaded');
                            callback();
                        } else {
                            throw("Could not retrieve data from: " + this.diagramUrl() );
                        }
                    });
                } else {
                    throw("Could not retrieve data from: " + this.contentUrl() );
                }
            });
        }
    }

    processStateIds(states: any) {
        states.forEach((state: any, i: any) => {
            if (state.diagramState) {
                this._stateIds[state.diagramState] = i;
            }
        })
    }

    // This is asking for a courseStep index.
    // diagrams are index dependent based on building the graph.
    // Example: CourseSteps[0] -> States[2]
    // The graph is not directly returned, rather it is emitted on the 'change' event.
    // ex: diagram.on('change', function(graph) {});
    getGraph(index: number) {
        var stateIndex = this._courseSteps[index].diagramStateIndex,
            states = this._states.slice(0, stateIndex + 1);
        var positions: Positions = states.reduce((accumulator: any, state: State) => {
                            if (state.positions) {
                                for (const key in state.positions) {
                                    accumulator[key] = state.positions[key];
                                }
                            }
                            return accumulator;
                          }, {});
        var connections: Connections = states.reduce((accumulator: any, state: State) => {
                            if (state.connections) {
                                for (const key in state.connections) {
                                    accumulator[key] = state.connections[key];
                                }
                            }
                            return accumulator;
                          }, {});

        var items = JSON.parse(JSON.stringify(states.shift().actions[0].items)),
            graph = new Graph(this.processItems(items));

        // Note this process mutates the graph object in place.
        states.reduce((accumulator: any, state: State) => {
            return this.merge(accumulator, state);
        }, graph);

        graph.position(positions);
        graph.connections(connections);

        graph.setMeta(this._courseSteps[index]);
        graph.setMeta({ "total" : this._courseSteps.length });

        this.dispatch.call('change', null, graph);
    }

    boundedIndex(index: number) {
        if (index < 0) {
            index = 0;
        }
        else if (index > this._courseSteps.length-1) {
            index = this._courseSteps.length-1;
        }
        return index;
    }

    merge(graph: any, state: State) {
        var actions = state.actions || [];
        if (actions.length === 0) {
            throw "The diagramState '"+ state.diagramState + "' has 0 action statements."
        }

        actions.forEach((action: Action) => {
            this.verifyMethod(action.method);

            switch (action.method) {
                case "add":
                    graph.add(this.processItems(action.items));
                    break;
                case "update":
                    graph.update(action.items);
                    break;
                case "remove":
                    var names = action.items.map((item: Item)=> item.id);
                    graph.drop(names);
                    break;
            }
        });

        return graph;
    }

    processItems(items: Array<Item>) {
        items.forEach((d: Item) => {
            d.iconsUrl = this.config.iconsUrl;
        });
        return items;
    }

    verifyMethod(method: string) {
        if (this._allowedMethods.indexOf(method) === -1) {
            throw("The method: '" + method + "' is not recognized."
                    + "\n Supported methods are: " + this._allowedMethods.toString());
        }
    }

    contentUrl() {
        return this.config.contentUrl + '?' + Math.random();
    }

    diagramUrl() {
        return this.config.diagramUrl + '?' + Math.random();
    }
}
