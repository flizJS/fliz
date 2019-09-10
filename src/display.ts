import * as d3 from 'd3';
import FLIZ from './index';
import { Style } from './style';

export class Display {
    static config = { duration : 500 };

    static nodes(svgContainer: any, _nodes: any) {
        // Update the nodes
        var node = svgContainer.selectAll("g.node")
            .data(_nodes, (d: any) => { return d._id });

        var nodeEnter = node.enter().append("svg:g")
            .attr('class', (d: any) => { return 'node ' + d.icon })
            .attr("transform", (d: any) => {
                return "translate(" + (d.x0 || 0) + "," + (d.y0 || 0) + ")";
            });

        nodeEnter.call(Style.icon);

        nodeEnter
            .filter((d: any) => { return !!d.text })
            .call(Style.text)

        nodeEnter.call(Style.labels);

        // Transition nodes to their new position.
        var nodeUpdate = nodeEnter
            .transition()
            .duration(Display.config.duration)
            .attr("transform", (d: any) => {
                return "translate(" + d.x + "," + d.y + ")";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);


        node.exit().remove();

        return node;
    }

    static nodeOverlays(svgContainer: any, graph: any) {
        var types = ['focus', 'crossOut', "disable"];
        var nodes = svgContainer.selectAll("g.node");

        types.forEach((type: string) => {
            nodes
                .data(graph.metaItems(type), (d: any) => { return d._id })
                .call(Style[type as keyof Style]);
        })
    }

    // Update link connections between items.
    // @param[Array] linkData - formated linkData for d3
    // @param[String] namespace - used to preserve grouping and uniqueness.
    static connectionLinks(svgContainer: any, linkData: any, namespace: any) {
        var line = d3.linkHorizontal()
            .x((d: any) => { return d.x; })
            .y((d: any) => { return d.y; });

        var classname = 'link-' + namespace;
        
        // Update the links.
        var link = svgContainer.selectAll("path." + classname)
            .data(linkData, (d: any) => { return d.source._id + '.' + d.target._id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("svg:path", "g")
            //.style('stroke-opacity', 0)
            .attr("class", (d: any) => {
                return (d.source.public && d.target.public)
                            ? classname + ' public'
                            : classname;
            })
            .attr("d", line);

        link.transition()
            .duration(Display.config.duration)
                .style('stroke-opacity', 1)
                .attr("d", line);


        link.exit().remove();

        return link;
    }

    // Similar to connectionLinks but adds animated directional flow icons.
    // @param[Array] linkData - formated linkData for d3
    // @param[String] namespace - used to preserve grouping and uniqueness.
    // @param[Boolean] reverse - set true to reverse animation direction.
    static livePaths(svgContainer: any, graph: any, namespace: any, reverse: any) {
        var linkData = Display.diagonalFocusPathLinks(graph);
        var pathData = this.connectionLinks(svgContainer, linkData, namespace)
            .call(Style.pulsePath)

        Display.updateFlowIcons(svgContainer, linkData, pathData[0], namespace, reverse);

        return pathData;
    }

    // @param[Array] linkData - formated linkData for d3
    // @param[Array] paths - actual SVG path DOM nodes required.
    // @param[String] namespace - used to preserve grouping and uniqueness.
    static updateFlowIcons(svgContainer: any, linkData: any, paths: any, namespace: any, reverse: any) {
        var markerData: any = [];
        if (paths) {
            paths.map((d: any, i: any) => {
                if(d) {
                    var slope = (linkData[i].target.y - linkData[i].source.y)/
                                    (linkData[i].target.x - linkData[i].source.x);
                    // this coincides with the transform(rotate()) format (clockwise degrees)
                    var degree = Math.atan(slope) * (180/Math.PI);
                    markerData.push({
                        path: d,
                        degree : degree,
                        reverse : reverse,
                        iconsUrl : linkData[i].source.iconsUrl,
                        _id : (linkData[i].source._id + linkData[i].target._id + namespace)
                    });
                }
            });
        }

        var markers = svgContainer.selectAll("g." + namespace)
                        .data(markerData, (d: any) => { return d._id });

        var markersEnter = markers.enter().append("svg:g")
            .attr('class', namespace + ' flow-icon')
            .call(Style.flowIcon)
        ;

        markers.transition()
            .delay(400)
            .duration(1500)
            .attrTween("transform", (d: any) => {
                var l = d.path.getTotalLength()/2; // mid-point
                  return (t: any) => {
                    var offset = t * l;
                    if (d.reverse) {
                        offset = d.path.getTotalLength() - offset;
                    }
                    var p = d.path.getPointAtLength(offset);
                    return "translate(" + p.x + "," + p.y + ")";
                  };
            })

        markers.exit().transition()
            .duration(Display.config.duration)
            .style("fill-opacity", 0)
            .remove();

        return markers;
    }


    static diagonalFocusPathLinks(graph: any) {
        var links: any = [],
            paths: any = [];

        if (graph.metaItems('focusPath').length > 0) {
            paths = [graph.metaItems('focusPath')];
        } else if (graph.meta('focusPaths')) {
            paths = graph.meta('focusPaths').map((path: any) => {
                return graph.findAll(path);
            });
        }

        paths.forEach((path: any) => {
            links = links.concat(this.diagonalPathLinks(path));
        });

        return links;
    }

    static diagonalPathLinks(path: any) {
        var links: any = [];
        path.forEach((d: any, i: any) => {
            if(path[i+1]) {
                links.push({
                    source: d,
                    target: path[i+1]
                });
            }
        });
        return links;
    }
}