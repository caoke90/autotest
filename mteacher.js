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
            'http://www.w3school.com.cn/',
            'http://zystatic.17zuoye.com/mteacher/list.html',
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
                    console.log('')
                    this.waitFunc()
                    this.waitFunc=null;
                }
            },5)
        });
        
        page.on('onConsoleMessage',async (msg, lineNum, sourceId) =>{
            // console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
            const url=this.curUrl
            const time=this.progress.hasRunTimes['openPage']
            if (msg.indexOf("PHANTOM_FUNCTION") === 0) {
                console.log('DOMContentLoaded',timeLog(url))
                this.page.render('dist/mteacher/DOMContentLoaded'+time+'.png')
            }else if (msg.indexOf("PHANTOM_userAction") === 0) {
                console.log('userActionTime',timeLog(url))
                this.page.render('dist/mteacher/userActionTime'+time+'.png')
            }else {
                console.log(msg);
            }
        });
        page.on('onInitialized', async ()=>{
            this.loading=true;
            const url=this.curUrl
            console.log('onInitialized',timeLog(url))
            page.evaluate(function () {
                if(!window.PHANTOM_used){
                    window.PHANTOM_used=true;
                    document.addEventListener('DOMContentLoaded', function() {
                        console.log("PHANTOM_FUNCTION");
                    }, false);
                    document.onreadystatechange = function() {
                        if (this.readyState == "complete") {
                            console.log("PHANTOM_userAction");
                        }
                    }
                }

            });
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
            console.log(url,timeLog(url,'start'))

            await this.page.open(url);

            // const content = await this.page.property('content');


            // console.log('openPage',timeLog(url))

        }else{
            this.progress.waitSecondAndGo(5,'nextTest')
        }

    }
    async waitTime(step,time){
        this.waitFunc=()=>{
            this.progress.waitSecondAndGo(0)
        }

    }
    async capture(step,time){
        // await this.page.render('dist/mteacher/onLoadFinished'+time+'.png')
        this.progress.waitSecondAndGo(0,'openPage')
    }
    // 结束
    async nextTest(){
        console.log('结束')
        await this.page.close();
        await this.instance.exit();
    }

}
const test=new Test();
test.init()