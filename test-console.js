const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log("ERROR:", msg.text());
        } else {
            console.log(msg.text());
        }
    });
    
    // We need to login first, or just hit the page and see if it fails because it redirects.
    // Actually, we can't login easily without UI automation unless we have a token.
    // Instead, I'll use grep in the source code again to find what I missed.
    await browser.close();
})();
