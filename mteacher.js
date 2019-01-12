require('./Format');
const phantom = require('phantom');
const Step = require('./step');

const timeCache={};
const timeLog=function (key,status) {
    if(status=='start'){

        timeCache[key]=new Date().getTime()
        return new Date().Format('yyyy-MM-dd hh:mm:ss S');
    }else{
        const now=new Date().getTime()
        const duration=now-timeCache[key]
        return duration;
    }
}

class Test{
    constructor(){
        this.runArr=['readingTime','openPage','waitTime','capture','nextTest'];
        this.progress={};
        this.instance=null;
        this.page=null;
        this.urls=[
            'http://movie.weibo.com/moviehomepage',
            'https://www.baidu.com/',
            'https://www.qidian.com/',
        ]
        this.curIndex=0;
        this.curUrl='';
    }
    init(){
        this.progress=new Step(this.runArr,async (step,time)=>{
            // console.log(step)

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

        this.loading=false;
        page.on('onLoadStarted', async (status)=> {
            this.loading=true;
            const url=this.curUrl
            console.log('onLoadStarted',timeLog(url))

        });
        page.on('onLoadFinished', async (status)=> {
            const url=this.curUrl
            this.loading=false;
            if(status=='fail'){
                return;
            }
            setTimeout(()=>{
                if(!this.loading&&this.waitFunc){
                    console.log('onLoadFinished',timeLog(url))
                    this.waitFunc()
                    this.waitFunc=null;
                }
            },5)
        });

        page.on('onConsoleMessage', function(msg, lineNum, sourceId) {
            // console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');

        });
        page.on('onResourceRequested', function(requestData) {
            // console.info('Requesting', requestData.url);
        });
        page.on('onResourceError', function(requestData) {
            // console.info('Requesting', requestData.url);
        });
        page.on('onResourceTimeout', function(requestData) {
            // console.info('Requesting', requestData.url);
        });
        page.on('onError',function (msg,trace) {
            console.error(msg)
            console.error(trace)
        })
        this.instance=instance;
        this.page=page;
        this.progress.waitSecondAndGo(1)
    }
    async openPage(step,time){
        const url=this.urls[this.curIndex++]
        if(url){
            this.curUrl=url;
            this.progress.next()
            console.log('')
            console.log(url,timeLog(url,'start'))

            await this.page.open(url);
            // var script2 = "function(){ console.log(window.phantomVar); }";
            // this.page.evaluateJavaScript(script2);
            // const content = await this.page.property('content');

            console.log('openPage',timeLog(url))


        }else{
            this.progress.waitSecondAndGo(1,'nextTest')
        }

    }
    async waitTime(step,time){
        this.waitFunc=()=>{
            this.progress.waitSecondAndGo(0)
        }

    }
    async capture(step,time){
        await this.page.render('mteacher/'+time+'.png')
        this.progress.waitSecondAndGo(0,'openPage')
    }
    // 结束
    async nextTest(){
        await this.instance.exit();
    }

}
const test=new Test();
test.init()