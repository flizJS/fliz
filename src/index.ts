import * as d3 from 'd3';
import '../style/index.scss';
import { Description } from './description';
import { Diagram } from './diagram';
import { Display } from './display';
import { Graph } from './graph';
import { Navigation } from './navigation';

export default class FLIZ {

    public diagram: Diagram;
    public description: Description;
    public navigation: Navigation;

    public world: any; // TODO: Type
    public step: number;

    constructor(options: any) {
        this.diagram = new Diagram(options);

        this.world = d3.select('body')
            .append('div')
            .attr('id', 'world')
            .append("svg:svg")
            .attr('viewBox', '0 0 1200 600')
            .append("svg:g");

        this.description = new Description(this.world);

        this.navigation = new Navigation({
            diagram: this.diagram,
            selector: '#prev-next',
            tocSelector: '#table-of-contents',
            stepToggleSelector: '#steps-count'
        });

        this.diagram.on('change', (graph: Graph) => {
            this.description.update(graph.meta('title'), graph.meta('content'));

            Display.nodes(this.world, graph.nodes());
            Display.nodeOverlays(this.world, graph);
            Display.connectionLinks(this.world, graph.connections(), 'connect');
            Display.livePaths(this.world, graph, 'focusPath', false);

            this.navigation.update(graph.meta('index'), graph.meta('total'));
        });

        this.step = parseInt(window.location.hash.substring(1));

        this.step = (this.step > 0) ? (this.step - 1) : 0;

        this.diagram.get(this.step);
    }
}