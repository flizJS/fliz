window.FLIZ = {};

FLIZ = function(options) {
    var diagram = new FLIZ.Diagram(options);

    // SVG visualization
    var world = d3.select('body').append('div').attr('id', 'world')
                    .append("svg:svg")
                        .attr('viewBox','0 0 1200 600')
                        .append("svg:g")
    ;
    // Textual description
    var description = new FLIZ.Description(world);

    // Navigation components
    var navigation = new FLIZ.Navigation({
        diagram : diagram,
        selector : '#prev-next',
        tocSelector : '#table-of-contents',
        stepToggleSelector : '#steps-count'
    })

    diagram.on('change', function(graph) {
        description.update(graph.meta('title'), graph.meta('content'));

        FLIZ.Display.nodes(world, graph.nodes());
        FLIZ.Display.nodeOverlays(world, graph);
        FLIZ.Display.connectionLinks(world, graph.connections(), 'connect');
        FLIZ.Display.livePaths(world, graph, 'focusPath');

        navigation.update(graph.meta('index'), graph.meta('total'));
    })

    // Discern and load the step from the URL.
    var step = parseInt(window.location.hash.substring(1));
    step = (step > 0) ? (step - 1) : 0;
    diagram.get(step);
}
