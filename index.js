import getScrollElement from './scrollElement.js';
import getTranslateElement from './translateElement.js';
import sendTj from './report.js';

const checks = []
const listenerList = [window]
let reportData = [];
let perNum = 30;
let checkAllWithThrottle = throttle(checkAll, 100, 100)

window.addEventListener('scroll', checkAllWithThrottle)
window.addEventListener('resize', checkAllWithThrottle)

//eventDelegate(document, 'click', '[ck_expose]', checkAllWithThrottle)


const monitor = {
  addListener: function(scrollElement){
    if(scrollElement && listenerList.indexOf(scrollElement) === -1){
      listenerList.push(scrollElement)
      scrollElement.addEventListener('scroll', checkAllWithThrottle)
      checkAllWithThrottle() //加入时检查一遍
    }
  },

  removeListener: function(scrollElement){
    let index = listenerList.indexOf(scrollElement)
    if(scrollElement &&  index!== -1){
      listenerList.splice(index, 1);
      scrollElement.removeEventListener('scroll', checkAllWithThrottle)
    }
  },

  monitor: function (options) {
    let isShown = false;

    if(options.extend && options.extend.perNum) {
      perNum = options.extend.perNum;
    }

    options.offset = options.offset || {x: 0, y: 0}
    options.offset.x = options.offset.x || 0
    options.offset.y = options.offset.y || 0

    options.onShow = options.onShow || function () {}
    options.onHide = options.onHide || function () {}
    
    let check = (scrollElement) => {
      let elements = document.querySelectorAll('[data-expose]');
      for(let i =0; i < elements.length; i++) {
        let element = elements[i];
        let defaultScrollElement = getScrollElement(element)
        if(defaultScrollElement) {
          this.addListener(defaultScrollElement)
        }
        let autoReport = element.getAttribute('data-autoreport');
        if(autoReport != "false") {
          let exposeData = JSON.parse(element.getAttribute('data-expose') || '{}');
          Object.assign(exposeData, options.extend || {});
          scrollElement = defaultScrollElement

          if (rectsIntersect(getPageRect(element, scrollElement), getElementRect(element, options.offset))) {
            //console.log('time', i, new Date().getTime() );
            //setTimeout(() => report(exposeData), 1000 + 50*i);
            exposeData._opertime = Date.parse(new Date()) / 1000 + '';
            reportData.push(exposeData);
            //throttle(report, 100, 1000, exposeData)();
            element.removeAttribute('data-expose');
            //isShown ? options.onShow() : options.onHide()
          }
        }
      }
    }
    check()
    checks.push(check)
    monitor.bindAutoClickTj(options);
  },
  bindAutoClickTj:function(options){
    window.addEventListener('click',(e)=>{
      let target=e.target;
      let now=Date.parse((new Date())) / 1000 + '';
      let reportData=null;
      while(target.nodeName!='BODY'){
        let clickData=target.getAttribute('data-click');
        if(clickData){
          try{
            clickData=JSON.parse(clickData);
            reportData=Object.assign(clickData,{_opertime:now},options.extend);
            break;
          }catch(err){
            console.log(err);
          }
        }
        target=target.parentElement;
      }
      if(reportData){
        monitor.tj(reportData);
      }
    });
  },
  remove: function(check){
    let i = checks.indexOf(check)
    return checks.splice(i, 1)
  },

  update: function () {
    checkAllWithThrottle()
  },
  
  autoSendTj: function(data) {
    sendTj(data);
  },
  tj:function(data){
    let now=Date.parse(new Date()) / 1000 + '';
    if(Array.isArray(data)){
      sendTj(data.map((item)=>{
        return Object.assign(item,{_opertime : now})
      }));
    }else{
      sendTj([Object.assign(data,{_opertime : now})])
    }
  }
}

function checkAll (e) {
  for (let i = 0; i < checks.length; i++) {
    checks[i](e && e.target)
  }
  if(reportData.length) {
    setTimeout(() => reportFunc(), 500);
  }
}

function reportFunc() {
  for (let i = 0; i < Math.ceil(reportData.length/perNum); i++) {
    let data = reportData.slice(i*perNum, (i+1)*perNum);
    sendTj(data);
  }
  reportData = [];
}

function getPageRect (element, scrollElement) {
  let page = scrollElement
  let isHorizontal = false;
  if(scrollElement != document.body && scrollElement != document) {
    let style
    if (window.getComputedStyle) {
        try {
            style = window.getComputedStyle(scrollElement)
        } catch(e) {}
    } else if (node.currentStyle) {
        style = node.currentStyle
    }
    isHorizontal = style ? /(auto|scroll)/.test(style["overflow-x"] || style["overflow"]) : false;
  }
  let x = isHorizontal ? page.scrollLeft : 'pageXOffset' in window ? window.pageXOffset : page.scrollLeft;
  let y = isHorizontal ? window.pageYOffset : 'pageYOffset' in window ? window.pageYOffset : page.scrollTop;
  let w = isHorizontal ? window.innerWidth : 'innerWidth' in window ? window.innerWidth : page.clientWidth;
  let h = isHorizontal ? window.innerHeight : 'innerHeight' in window ? window.innerHeight : page.clientHeight;
  return [x, y, x + w, y + h]
}

function getElementRect (element, offset) {
  let x = 0, y = 0
  let w = element.offsetWidth, h = element.offsetHeight
  let translateElement = getTranslateElement(element);
  if(element.getAttribute('data-transform') == 'true') {
    if(!translateElement) {
      x = 2147483647;
      y = 2147483647;
    } else {
      let translate = translateElement.style.transform,
      translateX = translateElement.style.left || translateElement.style.right,
      translateY = translateElement.style.top || translateElement.style.bottom;
      if(translate) {
        translateX = translate.match(/\.*translate\((.*?)\)/) || translate.match(/\.*translateX\((.*?)\)/);
        translateX = translateX ? parseFloat(translateX[1]) : 0;
        translateY = translate.match(/\.*translate\((.*?)\)/) || translate.match(/\.*translateY\((.*?)\)/);
        translateY = translateY ? translateY[1].indexOf(',') ? parseFloat(translateY[1].split(',')[1]) : parseFloat(translateY[1]) : 0;
      }
      x += Math.abs(translateX)
      y += Math.abs(translateY)
    }
  }
  while (element.offsetParent !== null) {
    x += element.offsetLeft
    y += element.offsetTop
    element = element.offsetParent
  }
  return [x - offset.x, y - offset.y, x + w/2 + offset.x, y + h/2 + offset.y]
}

function rectsIntersect (page, element, offset) {
  //return page[0] < element[2] && page[2] > element[0] && page[1] < element[3] && page[3] > element[1]
  return page[2] > element[2] && page[3] > element[3];
}

function throttle (fn, delay, mustRunDelay, params = '') {
  let timer = null
  let t_start
  return function () {
    let context = this, args = params || arguments, t_curr = +new Date()
    clearTimeout(timer)
    if (!t_start) {
      t_start = t_curr
    }
    if (t_curr - t_start >= mustRunDelay) {
      fn.apply(context, args)
      t_start = t_curr
    }else {
      timer = setTimeout(function () {
        fn.apply(context, args)
      }, delay)
    }
  }
}

export default monitor;