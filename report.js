let ios = window.navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/);

// u need to change !!!
let reportUrl = 'report.test.com';

let params = {
  common: {
      _os_version: ios[2].replace(/_/g, '.')||'',
      _os: ios ? 'ios' : 'android'
  },
  items: [
      {
          _key: 'h5activity',
          _opertime: Date.parse(new Date()) / 1000 + '',
      }
  ]
}


export default function (extend) {
  extend.forEach((item)=>{
    for(let k in item){
        item[k] = typeof item[k] == 'string' ? item[k].replace(/&/g,'%26') : item[k];
    }
  });
  params.items = extend;

  let useBeacon = true;
  if (ios) {
    useBeacon = false;
  }
  if(useBeacon && typeof navigator.sendBeacon == 'function') {
    navigator.sendBeacon(reportUrl, JSON.stringify(params));
  } else {
    $.ajax({
      type: 'POST',
      url: reportUrl,
      data: params,
      dataType: 'json',
      success: function(res) {
        // do something
      }
    })
  }

}