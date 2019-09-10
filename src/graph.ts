import * as d3 from 'd3';

// The Graph object models our data format as a graph of nodes/items and connections.
export class Graph {
    __dict__: any = {};
    __meta__: any = {};
    __connectionLinks__: any[];
    
    constructor(items: any) {
        this.__dict__ = this.dictify(items);
        this.__meta__ = {};
        this.__connectionLinks__ = [];
    }

    meta(key: any) {
        return this.__meta__[key];
    }

    setMeta(attributes: any) {
        for (const key in attributes) {
            this.__meta__[key] = attributes[key];
        }
    }

    // Get items mappped from a meta attribute holding item ids.
    metaItems(key: any) {
        return this.findAll(this.meta(key));
    }

    // Get an item.
    get(key: any) {
        return this.__dict__[key];
    };

    // Set an item.
    set(key: any, value: any) {
        this.__dict__[key] = value;
    };

    // Get an item or throw error if not found.
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
        })

        return items;
    };

    findAll(keys: any) {
        return this.coerceArray(keys).map((name) => {
            return this.find(name);
        })
    };

    // Delete an item.
    _delete(key: any) {
        delete this.__dict__[key];
    }

    // Add an item to the graph in relation (mapped) to another item.
    add(items: any) {
        this.addToDict(items);
    }

    // Update item attributes.
    update(items: any) {
        this.coerceArray(items).forEach((item) => {
            for(const key in item) {
                this.__dict__[item.id][key] = item[key];
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
    position(data: any) {
        for(const id in this.__dict__) {
            this.__dict__[id]._id = this.__dict__[id].id || this.__dict__[id].name;
            var coord = {
                x : data[id][0],
                y : data[id][1] + 130
            }

            this.__dict__[id].x0 = 600;
            this.__dict__[id].y0 = 500;
            this.__dict__[id].x = coord.x;
            this.__dict__[id].y = coord.y;
        }

        for(const id in this.__dict__) {
            if(this.__dict__[id].from && this.get(this.__dict__[id].from)) {
                var from = this.get(this.__dict__[id].from);
                this.__dict__[id].x0 = from.x;
                this.__dict__[id].y0 = from.y;
            }
        }
    }

    nodes() {
        return d3.values(this.__dict__);
    }

    connections(data: any) {
        if(data) {
            this.__connectionLinks__ = [];

            for(const key in data) {
                if(this.get(key)) {
                    this.getAll(data[key]).forEach((item:any) => {
                        this.__connectionLinks__.push({
                            source: this.get(key),
                            target: item
                        });
                    })
                }
            }
        }

        return this.__connectionLinks__;
    }

    // Private

    // Generate a dictionary graph from an ordered Array represenation.
    dictify(items: any) {
        var dict: any = {};
        items.forEach((item: any, i: any) => {
            dict[item.id] = item;
        })

        return dict;
    }

    addToDict(items: any) {
        var dict = this.dictify(items);
        for (const key in dict) {
            this.set(key, dict[key]);
        };
    }

    coerceArray(input: any) {
        var result = [];
        if(Array.isArray(input)) {
            result = input;
        }
        else if(input) {
            result.push(input);
        }
        return result;
    }
}
