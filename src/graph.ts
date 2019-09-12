import * as d3 from 'd3';
import { Connections, Positions } from './models/diagram';

// The Graph object models our data format as a graph of nodes/items and connections
export class Graph {
    private _dict: any = {};
    private _meta: any = {};
    private _connectionLinks: any[];
    
    constructor(items: any) {
        this._dict = this.dictify(items);
        this._meta = {};
        this._connectionLinks = [];
    }

    meta(key: any) {
        return this._meta[key];
    }

    setMeta(attributes: any) {
        for (const key in attributes) {
            this._meta[key] = attributes[key];
        }
    }

    // Get items mappped from a meta attribute holding item ids
    metaItems(key: any) {
        return this.findAll(this.meta(key));
    }

    // Get an item
    get(key: any) {
        return this._dict[key];
    };

    // Set an item
    set(key: any, value: any) {
        this._dict[key] = value;
    };

    // Get an item or throw error if not found
    find(key: any) {
        if(this.get(key)) {
            return this.get(key);
        }
        else {
            throw "Could not find item using id: " + key;
        }
    }

    getAll(keys: any) {
        var items: any = [];
        this.coerceArray(keys).forEach((name) => {
            if(this.get(name)) {
                items.push(this.get(name));
            }
        });

        return items;
    };

    findAll(keys: any) {
        return this.coerceArray(keys).map((name) => {
            return this.find(name);
        });
    };

    // Delete an item
    _delete(key: any) {
        delete this._dict[key];
    }

    // Add an item to the graph in relation (mapped) to another item
    add(items: any) {
        this.addToDict(items);
    }

    // Update item attributes
    update(items: any) {
        this.coerceArray(items).forEach((item) => {
            for(const key in item) {
                this._dict[item.id][key] = item[key];
            }
        })
    }

    // Drop one or more items from the graph.
    drop(names: any) {
        if(!Array.isArray(names)) {
            names = [names];
        }
        names.forEach((name: any) => {
            this._delete(name);
        })
    }

    // Set x and y coordinates for each item.
    // Note this is mutable service, it mutates the graph.
    position(data: Positions) {
        for(const id in this._dict) {
            this._dict[id]._id = this._dict[id].id || this._dict[id].name;
            var coord = {
                x : data[id][0],
                y : data[id][1] + 130
            }

            this._dict[id].x0 = 600;
            this._dict[id].y0 = 500;
            this._dict[id].x = coord.x;
            this._dict[id].y = coord.y;
        }

        for(const id in this._dict) {
            if(this._dict[id].from && this.get(this._dict[id].from)) {
                var from = this.get(this._dict[id].from);
                this._dict[id].x0 = from.x;
                this._dict[id].y0 = from.y;
            }
        }
    }

    nodes() {
        return d3.values(this._dict);
    }

    connections(data: Connections = null) {
        if (data) {
            this._connectionLinks = [];

            for (const key in data) {
                if (this.get(key)) {
                    this.getAll(data[key]).forEach((item: any) => {
                        this._connectionLinks.push({
                            source: this.get(key),
                            target: item
                        });
                    });
                }
            }
        }
        return this._connectionLinks;
    }

    // Generate a dictionary graph from an ordered Array represenation.
    private dictify(items: any) {
        var dict: any = {};
        items.forEach((item: any, i: any) => {
            dict[item.id] = item;
        });
        return dict;
    }

    private addToDict(items: any) {
        var dict = this.dictify(items);
        for (const key in dict) {
            this.set(key, dict[key]);
        };
    }

    private coerceArray<T>(input: T | Array<T>): Array<T>  {
        return Array.isArray(input) ? input : input ? [input] : [];
    }
}
