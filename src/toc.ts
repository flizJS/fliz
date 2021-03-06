import * as d3 from 'd3';
import { Step } from './models/content';

export class TableOfContents {

    d3Toc: any;
    d3StepToggle: any;

    constructor (tocSelector: string, stepToggleSelector: string) {

        this.d3StepToggle = d3.select('body').append('div')
            .attr('id', stepToggleSelector.slice(1))
            .on('click', this.toggle.bind(this));

        var container = document.createElement('div');
        container.id = tocSelector.slice(1);

        this.d3Toc = d3.select(container);
        this.d3Toc.append('h4').text('Table of Contents');
        this.d3Toc.append('ol');

        document.body.appendChild(this.d3Toc.node());
    }

    updateStep(index: number, total: number) {
        var current = index + 1;
        var menu = '<svg viewBox="0 0 90 90" enable-background="new 0 0 90 90" xml:space="preserve">'
                    + '<path d="M29,34h32c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H29c-1.1,0-2,0.9-2,2C27,33.1,27.9,34,29,34z"/>'
                    + '<path d="M61,43H29c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h32c1.1,0,2-0.9,2-2C63,43.9,62.1,43,61,43z"/>'
                    + '<path d="M61,56H29c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h32c1.1,0,2-0.9,2-2C63,56.9,62.1,56,61,56z"/>'
                    + '</svg>'
                    ;

        var count = '<em>'+ current + '</em> of ' + total + menu;
        this.d3StepToggle.html(count);
    }

    // update the table of contents list.
    updateList(steps: Array<Step>, index: number) {
        steps.forEach((step: Step, i: number) => {
            step.active = (i === index);
        });

        var nodes = this.d3Toc.select('ol').selectAll('li')
                    .data(steps)
                    .classed('active', (d: Step) => d.active);

        nodes.exit().remove();

        return nodes.enter()
            .append('li')
                .classed('active', (d: Step) => d.active)
            .append('a')
                .html((d: Step) => d.title);
    }

    toggle() {
        this.d3Toc.classed('active', !this.d3Toc.classed('active'));
    }

    show() {
        this.d3Toc.classed('active', true);
    }

    hide() {
        this.d3Toc.classed('active', false);
    }

    highlight(index: number) {
        this.d3Toc.select('ol').selectAll('li')
            .classed('active', false)
            .filter(':nth-child('+ (index + 1) +')').classed('active', true);
    }
}
