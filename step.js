/*
* 流程控制器
* 作者：caoke
* */

class Step{
  //初始化
  constructor(stepArr,callback){

    this.stepArr=stepArr;
    this.curIndex=0;
    this.isPaused=false;
    this.nextMode=null;
    this.curStep=this.stepArr[this.curIndex];
    this.hasRunTimes={};
    this.stepArr.forEach( (step)=> {
      this.hasRunTimes[step]=0;
    })
    this.callback=callback;
  }
  callback(){
    this.go()
  }
  // 运行当前流程
  run(){
    this.curStep=this.stepArr[this.curIndex]
    if(this.curStep){
      this.hasRunTimes[this.curStep]++
      this.callback&&this.callback.apply(this,[this.curStep,this.hasRunTimes[this.curStep]])
    }
  }
  // 跳转到某个流程
  go(step){
    this.clear()
    if(step){
      this.curIndex=this.stepArr.indexOf(step)
    }else{
      this.curIndex++
    }
    this.run()
  }

  // 进入下一个流程
  next(){
    if(this.nextMode){
      this.go(this.nextMode.nextStep)
    }else{
      this.go()
    }
  }

  // 自动进入下一步
  waitSecondAndGo(second,step){
    if(!this.isPaused){
      this.stopTimer()
    }
    const mode={
      startTime:new Date().getTime(),
      allSecond:second,
      leftSecond:second*1000,
      nextStep:step,
      timer:null,
    }

    //获得下一步
    if(this.nextMode==null||mode.leftSecond<this.nextMode.leftSecond){
      this.nextMode=mode;
    }

    if(!this.isPaused){
      this.startTimer()
    }

  }
  // 暂停
  pause(){
    if(!this.isPaused){
      this.isPaused=true;
      this.stopTimer()

    }

  }
  // 继续
  repause(){
    if(this.isPaused){
      this.isPaused=false;
      this.startTimer()
    }

  }
  stopTimer(){
    if(this.nextMode&&this.nextMode.timer){
      const duration=new Date().getTime()-this.nextMode.startTime;
      this.nextMode.leftSecond=this.nextMode.leftSecond-duration;

      clearTimeout(this.nextMode.timer);
      this.nextMode.timer=null;
    }
  }
  startTimer(){
    if(this.nextMode&&this.nextMode.timer==null){
      this.nextMode.startTime=new Date().getTime();
      this.nextMode.timer=setTimeout(() => {
        this.go(this.nextMode.nextStep)
      },this.nextMode.leftSecond)
    }
  }
  // 销毁
  clear(){
    if(this.nextMode){
      if(this.nextMode.timer){
        clearTimeout(this.nextMode.timer);
        this.nextMode.timer=null
      }
      this.nextMode=null
    }
  }
}
module.exports=Step;
