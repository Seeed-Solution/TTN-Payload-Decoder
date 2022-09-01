function decodeUplink(e){var r,t,e=l(e.bytes).toLocaleUpperCase(),s={valid:!0,err:0,payload:e,messages:[]};if(!g(e))return s.valid=!1,s.err=-1,{data:s};if((e.length/2-2)%7!=0)return s.valid=!1,s.err=-2,{data:s};for(var a=c(e),n=0;n<a.length;n++){var u=a[n],i=(f(u.substring(0,2)),f(u.substring(2,6))),u=u.substring(6,14),o=v(i)?b(i,u):d(u);if(h(i))s.messages.push({type:"report_telemetry",measurementId:i,measurementValue:o});else if(v(i)||5===i||6===i)switch(i){case 0:var p=I(o);s.messages.push({type:"upload_version",hardwareVersion:p.ver_hardware,softwareVersion:p.ver_software});break;case 1:break;case 2:r=o;break;case 3:t=o;break;case 7:s.messages.push({type:"upload_battery",battery:o.power},{type:"upload_interval",interval:60*parseInt(o.interval)});break;case 288:s.messages.push({type:"report_remove_sensor",channel:1})}else s.messages.push({type:"unknown_message",dataID:i,dataValue:u})}return t&&r&&s.messages.unshift({type:"upload_sensor_id",channel:1,sensorId:(t+r).toUpperCase()}),{data:s}}function g(e){return!0}function l(e){for(var r="",t=0;t<e.length;t++){var s=e[t],s=(s<0?255+s+1:s).toString(16);r+=s=1===s.length?"0"+s:s}return r}function c(e){for(var r=[],t=0;t<e.length-4;t+=14){var s=e.substring(t,t+14);r.push(s)}return r}function o(e){for(var r=[],t=0;t<e.length;t+=2)r.push(e.substring(t,t+2));return r.reverse(),r}function f(e){e=o(e);return parseInt(e.toString().replace(/,/g,""),16)}function h(e){return 4096<parseInt(e)}function v(e){switch(e){case 0:case 1:case 2:case 3:case 4:case 7:case 288:return!0;default:return!1}}function b(e,r){r=o(r);if(2===e||3===e)return r.join("");var t=p(r),s=[];switch(e){case 0:case 1:for(var a=0;a<t.length;a+=16){var n=t.substring(a,a+16),n=(parseInt(n.substring(0,8),2)||0)+"."+(parseInt(n.substring(8,16),2)||0);s.push(n)}return s.join(",");case 4:for(var u=0;u<t.length;u+=8){var i=(i=parseInt(t.substring(u,u+8),2))<10?"0"+i.toString():i.toString();s.push(i)}return s.join("");case 7:return{interval:parseInt(t.substr(0,16),2),power:parseInt(t.substr(-16,16),2)}}}function d(e){e=p(o(e));if("1"!==e.substring(0,1))return parseInt(e,2)/1e3;for(var r=e.split(""),t=[],s=0;s<r.length;s++){var a=r[s];1===parseInt(a)?t.push(0):t.push(1)}return e=parseInt(t.join(""),2)+1,parseFloat("-"+e/1e3)}function I(e){e=e.split(",");return{ver_hardware:e[0],ver_software:e[1]}}function p(e){for(var r=[],t=0;t<e.length;t++){var s=e[t],a=parseInt(s,16).toString(2),n=a.length;if(8!==a.length)for(var u=0;u<8-n;u++)a="0"+a;r.push(a)}return r.toString().replace(/,/g,"")}