
# Fire Javascript Event When a Element is expose to  View

## Usage
`tnpm i auto-report`

```javascript

import Report from 'auto-report';

Report.monitor({
  extend: {
    _key: 'test', 
    pagetype: 2,            // 自定义 上报参数
    areaid: window.AREAID,   // 自定义 上报参数
    perNum: 30              // 非必须 单次上报元素曝光数据 默认30
  }
});
```

- 在需要上报的元素上增加 data-expose/data-click属性，值为 json 格式的上报数据
格式如下
``` 
//必选
data-expose={JSON.stringify({   
  subid: 100,
  pos: 1,
  moduletype: 4,
  contentid: '',
  modulepos: Shelf.v_niche[0].v_card[0].tjreport
    .split('_')
    .pop()
    .split('-')[0],
  moduleid: Shelf.id
})}
//兼容 Carousel 轮播组件(非必选）
data-transform={true} 
```

- 手动上报
```
Report.tj({
  _key: 'channelexposure',
  xxx:'xxx'
})
Report.tj([{
  _key: 'channelexposure',
  xxx:'xxx'
},{
  _key: 'channelexposure',
  xxx:'xxx2'
}])
```

## Changelog
1.0.4 增加data-transform属性 兼容 Carousel 轮播组件曝光上报

