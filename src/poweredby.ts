import * as d3 from 'd3';

export class PoweredBy {

    d3poweredBy: any;

    constructor () {
        this.d3poweredBy = d3.select('body').append('div')
            .attr('id', 'poweredby')
            .text('Powered by Fliz')
            .on('click', this.click.bind(this));
    }

    click() {
        window.location.href = "https://www.github.com/flizJS/fliz";
    }
}
