import { TableOfContents } from "./toc";
import * as d3 from 'd3';


export class Navigation {
    current: number;
    tableOfContents: TableOfContents;
    config: any;
    
    constructor(config: any) {
        this.config = config;
        this.current = 0;
        this.tableOfContents = new TableOfContents(config.tocSelector, config.stepToggleSelector);

        this.config.diagram.on('loaded', () => {
            this.config.diagram.courseSteps((steps: any) => {
                this.draw();

                this.tableOfContents.updateList(steps, null)
                    .on('click', (d: any, i: any) => {
                        d3.event.preventDefault();
                        this.navigate(i);
                        this.tableOfContents.hide();
                    })

                d3.select("body")
                    .on("keydown", () => {
                        if(d3.event.keyCode === 39) // right arrow
                            this.next();
                        else if(d3.event.keyCode === 37) // left arrow
                            this.previous();
                    })
            })
        });
    }

    update(index: any, total: any) {
        this.current = index;
        this.tableOfContents.updateStep(index, total);
        this.tableOfContents.highlight(this.current);
        window.location.replace("#" + (this.current +1));
    }

    next() {
        this.navigate(this.current + 1);
    }

    previous() {
        this.navigate(this.current - 1);
    }

    navigate(index: any) {
        this.config.diagram.getBounded(index);
    }

    draw() {
        var container = document.createElement("div");
        container.id = this.config.selector.slice(1);

        var d3C = d3.select(container);
        d3C.append('svg')
            .attr('class', 'previous')
            .on('click', this.previous.bind(this))
            .attr('x', 0)
            .attr('y', 0)
            .attr('viewBox', '0 0 20 20')
            .attr('enable-background', 'new 0 0 20 20')
            .append('path')
                .attr('transform', 'translate(20,0), scale(-1,1)')
                .attr('d', 'M2.679,18.436c0,0.86,0.609,1.212,1.354,0.782l14.612-8.437c0.745-0.43,0.745-1.134,0-1.563L4.033,0.782   c-0.745-0.43-1.354-0.078-1.354,0.782V18.436z');

        d3C.append('svg')
            .attr('class', 'next')
            .on('click', this.next.bind(this))
            .attr('x', 0)
            .attr('y', 0)
            .attr('viewBox', '0 0 20 20')
            .attr('enable-background', 'new 0 0 20 20')
            .append('path')
                .attr('d', 'M2.679,18.436c0,0.86,0.609,1.212,1.354,0.782l14.612-8.437c0.745-0.43,0.745-1.134,0-1.563L4.033,0.782   c-0.745-0.43-1.354-0.078-1.354,0.782V18.436z');

        var wrap = document.createElement("div");
        wrap.id = 'prev-next-wrap';
        wrap.appendChild(container);

        document.body.appendChild(wrap);
    }
}
