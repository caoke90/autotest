const phantom = require('phantom');

(async function() {
    const instance = await phantom.create();
    const page = await instance.createPage();

    await page.on('onResourceRequested', function(requestData) {
        console.info('Requesting', requestData.url);
    });
    await page.on('onError',function (msg,trace) {
        console.log(msg)
        console.log(trace)
    })

    await page.open('http://10.200.4.201:3001/');

    await page.render('a.png')

    await instance.exit();
})();