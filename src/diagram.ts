import * as d3 from 'd3';

import { Graph } from "./graph";
import {dispatch} from 'd3-dispatch';

export class Diagram {

    config: any;
    dispatch: any; //d3.Dispatch<EventTarget>;

    constructor(config: any) {
        if(!config) throw("Diagram endpoints are required");
        if(!config.iconsUrl) throw("'iconsUrl' endpoint is required");
        this.config = config;

        this.dispatch = d3.dispatch('loaded', 'change');
    }

    // Add event listeners.
    on(type: any, listener: any) {
        this.dispatch.on(type, listener);
    }

    // Get graph at courseStep <index>.
    get(index: any) {
        this.resolve(() => {
            this.getGraph(index);
        })
    }

    // Get graph at courseStep <index> where <index> is coerced to remain within courseStep bounds.
    getBounded(index: any) {
        this.resolve(() => {
            index = this.boundedIndex(index);
            this.getGraph(index);
        })
    }

    // Get all courseSteps.
    // The callback receives:
    //  [Array] - courseSteps. An ordered list of courseSteps.
    courseSteps(callback: any) {
        this.resolve(() => {
            callback(this.CourseSteps)
        })
    }
    

    // PRIVATE
    // Private functions assume the data has loaded.
    AllowedMethods: any = ['add', 'update', 'remove'];
    States: any;
    CourseSteps: any;
    StateIds: any = {};


    // Resolve the state (data) of the diagram.
    // Data comes from a remote source so every public function should
    // execute its logic as a callback to resolve();
    resolve(callback: any) {
        if(this.CourseSteps) {
            callback();
        }
        else {
            d3.json(this.contentUrl()).then((courseData: any) => {
                if(courseData) {
                    d3.json(this.diagramUrl()).then((diagramData: any) => {
                        if(diagramData) {
                            this.States = diagramData.states;
                            this.processStateIds(diagramData.states);
                            this.CourseSteps = courseData.steps;
                            this.CourseSteps.forEach((step: any, i: any) => {
                                step.index = i;
                                step.diagramStateIndex = this.StateIds[step.diagramState];
                            })
                            this.dispatch.call('loaded');
                            callback();
                        }
                        else {
                            throw("Could not retrieve data from: " + this.diagramUrl() );
                        }
                    });
                }
                else {
                    throw("Could not retrieve data from: " + this.contentUrl() );
                }
            });
        }
    }

    processStateIds(states: any) {
        states.forEach((state: any, i: any) => {
            if(state.diagramState) {
                this.StateIds[state.diagramState] = i;
            }
        })
    }

    // This is asking me for a courseStep index.
    // diagrams are index dependent based on building the graph.
    // Example: CourseSteps[0] -> States[2]
    // The graph is not directly returned, rather it is emitted on the 'change' event.
    // ex: diagram.on('change', function(graph) {});
    getGraph(index: any) {
        var stateIndex = this.CourseSteps[index].diagramStateIndex,
            states = this.States.slice(0, stateIndex+1);
        var positions = states.reduce((accumulator: any, state: any) => {
                            if(state.positions) {
                                for(const key in state.positions) {
                                    accumulator[key] = state.positions[key];
                                }
                            }
                            return accumulator;
                          }, {});
        var connections = states.reduce((accumulator: any, state: any) => {
                            if(state.connections) {
                                for(const key in state.connections) {
                                    accumulator[key] = state.connections[key];
                                }
                            }
                            return accumulator;
                          }, {});

        var items = JSON.parse(JSON.stringify(states.shift().actions[0].items)),
            graph = new Graph(this.processItems(items)),
            metadata = {};

        // Note this process mutates the graph object in place.
        states.reduce((accumulator: any, state: any) => {
            return this.merge(accumulator, state);
        }, graph);

        graph.position(positions);
        graph.connections(connections);

        graph.setMeta(this.CourseSteps[index]);
        graph.setMeta({ "total" : this.CourseSteps.length });

        this.dispatch.call('change', null, graph); // TODO
    }

    // stay in bounds
    boundedIndex(index: any) {
        if (index < 0) {
            index = 0;
        }
        else if (index > this.CourseSteps.length-1) {
            index = this.CourseSteps.length-1;
        }

        return index;
    }

    merge(graph: any, state: any) {
        var actions = state.actions || [];
        if(actions.length === 0) {
            throw "The diagramState '"+ state.diagramState + "' has 0 action statements."
        }

        actions.forEach((action: any) => {
            this.verifyMethod(action.method);

            switch (action.method) {
                case "add":
                    graph.add(this.processItems(action.items));
                    break;
                case "update":
                    graph.update(action.items);
                    break;
                case "remove":
                    var names = action.items.map((item: any)=> { return item.id });
                    graph.drop(names);
                    break;
            }
        })

        return graph;
    }

    processItems(items: any) {
        items.forEach((d: any) => {
            d.iconsUrl = this.config.iconsUrl;
        })
        return items;
    }

    verifyMethod(method: any) {
        if(this.AllowedMethods.indexOf(method) === -1) {
            throw("The method: '" + method + "' is not recognized."
                    + "\n Supported methods are: " + this.AllowedMethods.toString());
        }
    }

    contentUrl() {
        return this.config.contentUrl + '?' + Math.random();
    }

    diagramUrl() {
        return this.config.diagramUrl + '?' + Math.random();
    }
}
