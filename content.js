var current_page_url = window.location.href;
var mouse_tracking_info = "";
//var mouse_tracking_count = 0;
//var mouse_tracking_group_limit = 100;
var current_site = get_set(current_page_url);
var current_port = get_port(current_page_url);
var current_task = get_task(current_page_url);
var current_taskunit = get_taskunit(current_page_url);
var mouse_tracking_baseline_stamp = (new Date()).getTime();
var mouse_tracking_time_stamp = mouse_tracking_baseline_stamp;
var mouse_tracking_pos_stamp = { 'x': 0, 'y': 0 };
var mouse_tracking_scroll_stamp = {'scrollX':0, 'scrollY':0};
var mouse_tracking_least_move_interval = 20;//ms
var mouse_tracking_least_move_distance = 20;//px

function get_set(url_str) {
    var ret = "";
    var site_re = /http:\/\/([\w\.]+):\w+\/task\/anno\/[0-9a-z]+\/.+\//;
    if (site_re.test(url_str)) {
        ret = RegExp.$1;
    }
    return ret;
}

function get_port(url_str) {
    var port = "";
    var port_re = /http:\/\/[\w\.]+:(\w+)\/task\/anno\/[0-9a-z]+\/.+\//;
    if (port_re.test(url_str)) {
        port = RegExp.$1;
    }
    return port;
}

function get_task(url_str) {
    var task = "";
    var task_re = /http:\/\/[\w\.]+:\w+\/task\/anno\/([0-9a-z]+)\/.+\//;
    if (task_re.test(url_str)) {
        task = RegExp.$1;
    }
    return task;
}

function get_taskunit(url_str) {
    var taskunit = "";
    var taskunit_re = /http:\/\/[\w\.]+:\w+\/task\/anno\/[0-9a-z]+\/(.+)\//;
    if (taskunit_re.test(url_str)) {
        taskunit = RegExp.$1;
    }
    return taskunit;
}

document.onmousemove = log_mouse_tracking;
send_mouse_info(formInfo("PAGE_START", ""), "PAGE_START");

var isTargetWindow = true;
$(window).focus(function() {
   isTargetWindow = true;
   send_mouse_info(formInfo("JUMP_IN", ""), "JUMP_IN");
   mouse_tracking_time_stamp = (new Date()).getTime();
});

$(window).blur(function() {
   if(isTargetWindow)
   {
        send_mouse_info(formInfo("JUMP_OUT", ""), "JUMP_OUT");
        isTargetWindow = false;
   }
});

window.onbeforeunload = function (e){

    send_mouse_info(formInfo("PAGE_END", ""), "PAGE_END");
    //return '';
};


$(window).scroll(function () {
    var c_left = $(this).scrollLeft();
    var c_top = $(this).scrollTop();
    var new_x = mouse_tracking_pos_stamp.x + c_left - mouse_tracking_scroll_stamp.scrollX;
    var new_y = mouse_tracking_pos_stamp.y + c_top - mouse_tracking_scroll_stamp.scrollY;
    var abs_pos_distance = Math.abs(new_x - mouse_tracking_pos_stamp.x) + Math.abs(new_y - mouse_tracking_pos_stamp.y);
    if(abs_pos_distance < mouse_tracking_least_move_distance){
        return;
    }
    var message = "FROM\t" + "x=" + mouse_tracking_pos_stamp.x + "\ty=" + mouse_tracking_pos_stamp.y + "\tTO\tx=" + new_x + "\t" + "y=" + new_y;
    mouse_tracking_scroll_stamp.scrollX = c_left;
    mouse_tracking_scroll_stamp.scrollY = c_top;
    mouse_tracking_pos_stamp.x = new_x;
    mouse_tracking_pos_stamp.y = new_y;
    send_mouse_info(formInfo("SCROLL", message), "SCROLL");
});



function log_mouse_tracking(ev){
    var new_time_stamp = (new Date()).getTime();
    var cur_pos = getMousePos(ev);
    var time_interval = new_time_stamp - mouse_tracking_time_stamp;
    var time_start = mouse_tracking_time_stamp - mouse_tracking_baseline_stamp;
    var time_end = new_time_stamp - mouse_tracking_baseline_stamp;
    var abs_pos_distance = Math.abs(cur_pos.x - mouse_tracking_pos_stamp.x) + Math.abs(cur_pos.y - mouse_tracking_pos_stamp.y);
    if(time_interval < mouse_tracking_least_move_interval || abs_pos_distance < mouse_tracking_least_move_distance){
        return;
    }
    var info = "FROM\tx=" + mouse_tracking_pos_stamp.x + "\ty=" + mouse_tracking_pos_stamp.y + "\tTO\tx=" +cur_pos.x + "\ty=" + cur_pos.y + "\ttime=" + time_interval + "\tstart=" + time_start + "\tend="+ time_end;
    send_mouse_info(formInfo("MOUSE_MOVE", info), "MOUSE_MOVE");
    mouse_tracking_time_stamp = new_time_stamp;
    mouse_tracking_pos_stamp = cur_pos;
}

function time_info(){
    var new_time_stamp = (new Date()).getTime();
    var time_point = new_time_stamp - mouse_tracking_baseline_stamp;
    return time_point;
}

function send_mouse_info(info, action){
    chrome.runtime.sendMessage({mouse_log: info, site_: current_site, port_: current_port, task_id: current_task, unit_tag: current_taskunit, action_: action});
    //mouse_tracking_info = mouse_tracking_info + info;
    //mouse_tracking_count ++;
    //if(mouse_tracking_count >= mouse_tracking_group_limit){
        //ajax_log_message(mouse_tracking_info);
        //mouse_tracking_count = 0;
        //mouse_tracking_info = "";
    //}
}

function getMousePos(ev) {
    //alert("get mouse");
    var e = ev || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var clientLeft = document.body.clientLeft;
    var clientTop = document.body.clientTop;
    var x = e.pageX || e.clientX + scrollX - clientLeft;
    //alert("x:" + x);
    var y = e.pageY || e.clientY + scrollY - clientTop;
    //alert('x: ' + x + '\ny: ' + y);
    return { 'x': x, 'y': y };
}

function formInfo(action_info, log_str){
    var time_str = time_info();
    var abs_time_str = (new Date()).getTime();
    //var info =  "TIME=" + time_str + "\t" + "USER=" + studentID + "\t" + "QUERY=" + currentQueryID + "\t" + "ACTION=" + action_info + "\t" + "INFO:\t" + log_str + "\n";
    var info =  "ABS_TIME=" + abs_time_str + "\t" + "TIME=" + time_str + "\t" + "ACTION=" + action_info + "\t" + "INFO:\t" + log_str + "\n";
    //console.log(info);
    return info;
}
