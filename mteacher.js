const phantom = require('phantom');
const Step = require('./step');


class Test{
    constructor(){
        this.runArr=['readingTime','openPage','waitTime','capture','nextTest'];
        this.progress={};
        this.instance=null;
        this.page=null;

    }
    init(){
        this.progress=new Step(this.runArr,async (step,time)=>{
            console.log(step)

            this[step](step,time);
        })
        this.progress.run();
    }
    //页面准备
    async readingTime(step,time){
        const instance = await phantom.create();
        const page = await instance.createPage();

        await page.property('viewportSize', { width: 375, height: 667 });
        await page.setting('userAgent',"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1")

        page.on('onResourceRequested', function(requestData) {
            console.info('Requesting', requestData.url);
        });
        page.on('onError',function (msg,trace) {
            console.log(msg)
            console.log(trace)
        })
        page.on('onUrlChanged',function (targetUrl) {
            console.log('New URL: ' + targetUrl);
        })
        this.instance=instance;
        this.page=page;
        this.progress.waitSecondAndGo(1)
    }
    async openPage(step,time){
        await this.page.open('https://www.baidu.com/');
        this.progress.waitSecondAndGo(0)
    }
    async waitTime(step,time){
        this.progress.waitSecondAndGo(3)
    }
    async capture(step,time){
        await this.page.render('mteacher/a.png')
        this.progress.waitSecondAndGo(0)
    }
    // 结束
    async nextTest(){
        await this.instance.exit();
    }

}
const test=new Test();
test.init()