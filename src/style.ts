export class Style {

    static duration : 500;

    static text(nodes: any) {
        nodes.append("svg:text")
                .attr('class', 'text-bg')
                .attr("dy", 65)
                .attr("text-anchor", (d: any) => d['text-anchor'] || 'middle')
                .text((d: any) => d.text);

        nodes.append("svg:text")
            .attr("dy", 65)
            .attr("text-anchor", (d: any) => d['text-anchor'] || 'middle')
            .text((d: any) => d.text);

        return nodes;
    }

    static clicker(nodes: any) {
        nodes.append('circle')
            .attr('class', 'clicker')
            .attr('r', 50);

        return nodes;
    }

    static icon(nodes: any) {
        nodes.append('circle')
            .attr('class', 'icon-bg')
            .attr('r', 14);

        nodes.append('g').append('use')
            .attr('xlink:href', (d: any) => d.iconsUrl + '#' + d.icon)
            .attr('class', (d: any) =>  "icon " + d.icon)
            .attr('height', (d: any) => d.depth > 0 ? 20 : 30 )
            .attr('width', (d: any) => d.depth > 0 ? 20 : 30 );

        nodes.call(Style.clicker);

        return nodes;
    };

    static labels(nodes: any) {
        nodes.append("svg:text")
                .attr('class', 'text-bg')
                .attr("dy", 35)
                .attr("text-anchor", "middle")
                .text((d: any) => d.name || d.id)

        nodes.append("svg:text")
                .attr("dy", 35)
                .attr("text-anchor", "middle")
                .text((d: any) => d.name || d.id);

        return nodes;
    }

    static focus(nodes: any) {
        nodes.selectAll("use")
            .transition()
            .duration(Style.duration)
                .attr('x', -30)
                .attr('y', -30)
                .attr('height', 60)
                .attr('width', 60)
            .transition()
            .duration(Style.duration)
                .attr('x', -25)
                .attr('y', -25)
                .attr('height', 50)
                .attr('width', 50);

        nodes.exit().selectAll("use").transition()
            .duration(Style.duration)
                .attr('x', -15)
                .attr('y', -15)
                .attr('height', 30)
                .attr('width', 30);

        nodes.selectAll("circle.software")
            .transition()
                .duration(Style.duration)
                .attr('r', 20)
            .transition()
                .duration(Style.duration)
                .attr('r', 16);


        nodes.exit().selectAll("circle.software").transition()
            .duration(Style.duration)
            .attr('r', 8);

        nodes.insert('svg:circle', 'g')
            .attr('class', 'focus')
            .attr('r', 0)
            .transition()
                .duration(Style.duration)
                .attr('r', 60)
            .transition()
                .duration(Style.duration)
                .attr('r', 50);

        nodes.exit().selectAll("circle.focus").transition()
            .duration(Style.duration)
            .attr('r', 0)
            .remove();

        return nodes;
    }

    static crossOut(nodes: any) {
        var size = 30;
        var nodesEnter = nodes.append('use')
            .attr('xlink:href', (d: any) => d.iconsUrl + '#cross-out')
            .attr('class', 'cross-out')
            .attr('x', -(size/2))
            .attr('y', -(size/2))
            .attr('height', size)
            .attr('width', size);

        nodes.exit()
            .selectAll("use.cross-out").remove();

        return nodes;
    }

    static disable(nodes: any) {
        nodes.style('opacity', 0.7);

        nodes.exit()
            .style('opacity', 1);

        return nodes;
    }

    static pulsePath(nodes: any) {
        nodes
            .transition()
                .duration(Style.duration)
                .style('stroke-opacity', 1)
                .style('stroke-width', 4)
            .transition()
                .duration(Style.duration)
                .style('stroke-width', 2)

        return nodes;
    }

    static flowIcon(nodes: any) {
        nodes.append('use')
            .attr('xlink:href', (d: any) => d.iconsUrl + '#flow-icon')
            .attr('height', 20)
            .attr('width', 20)
            .attr('x', -10)
            .attr('y', -10)
            .attr('transform', (d: any) => 'rotate(' + (d.degree + (d.reverse ? 180 : 0)) + ')');

        return nodes;
    }
}