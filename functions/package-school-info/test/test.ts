import { NeisCrawler } from "../src/data/NeisCrawler";

describe('School info parser', function() {

    this.timeout(50000);

    it('parses text from school info', (done) => {
        const neisCrawler = new NeisCrawler();
        neisCrawler.get()
        .then(data => console.log(data))
        .then(done);
    });
});