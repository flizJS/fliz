export class Description {

    private d3Container: any;

    constructor(container: any) {
        this.d3Container = container
            .append('g')
            .attr('class', 'description')
            .attr("text-anchor", 'middle')
            .attr('transform', 'translate(600,50)');
    }

    update(heading: string, content: string) {
        this.d3Container
            .style('opacity', 0)
            .selectAll('text').remove();

        var width = this.d3Container
            .append('svg:text')
            .text(heading)
            .attr('y', 0)
            .node().clientWidth;

        // line-break if needed
        if (width > 1050) {
            var words = heading.split(' '),
                half = Math.ceil(words.length / 2),
                firstLine = words.slice(0, half).join(' '),
                secondLine = words.slice(half, words.length).join(' ');

            this.d3Container
                .selectAll('text').remove();

            this.d3Container
                .append('svg:text')
                .text(firstLine);

            this.d3Container
                .append('svg:text')
                .attr('y', 40)
                .text(secondLine);
        } else if (content && content.length > 0) {
            this.d3Container
                .append("foreignObject")
                .attr('transform', 'translate(-400,20)')
                .attr("width", 800)
                .attr("height", 100)
                .append("xhtml:body")
                .append('xhtml:div')
                .attr('class', 'sub-description')
                .html(content);
        }

        this.d3Container
            .transition()
            .delay(100)
            .duration(200)
            .style('opacity', 1);
    }
}
