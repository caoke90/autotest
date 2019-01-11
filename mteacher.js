// const phantom = require('phantom');
const Step = require('./step');
//
// (async function() {
//     const instance = await phantom.create();
//     const page = await instance.createPage();
//
//     await page.on('onResourceRequested', function(requestData) {
//         console.info('Requesting', requestData.url);
//     });
//     await page.on('onError',function (msg,trace) {
//         console.log(msg)
//         console.log(trace)
//     })
//
//     await page.open('http://10.200.4.201:3001/');
//
//     await page.render('a.png')
//
//     await instance.exit();
// })();


class Test{
    constructor(){
        Object.assign(this,{
            runArr:['readingPaper','nextQuestion'],
            progress:{}, //进度控制器
        })
    }
    init(){
        this.progress=new Step(this.runArr,(step,time)=>{
            console.log(step)
            this[step](step,time);
        })
        this.progress.run();
    }
    //页面准备
    readingPaper(){
        
    }

}
const test=new Test();
test.init()