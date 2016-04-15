var mouse_tracking_count = 0;
var mouse_tracking_group_limit = 100;
var mouse_tracking_info = "";
var current_url = "";


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    current_url = sender.tab.url;
    info = String(request.mouse_log).trim() + '\t' + "SITE=" + current_url + '\n';
    site = String(request.site_);
    if(site == "10.129.248.54"){
        localStorage.site = site;
    }
    port = String(request.port_);
    if(port != ""){
        localStorage.port = port;
    }
    taskid = String(request.task_id);
    if(taskid != ""){
        localStorage.taskid = taskid;
    }
    unittag = String(request.unit_tag);
    if(unittag != ""){
        localStorage.unittag = unittag;
    }
    action = String(request.action_);
    send_mouse_info(info, localStorage.site, localStorage.port, localStorage.username, localStorage.taskid, localStorage.unittag, action);

});


//chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  //
    //if(tab.url.match(/https:\/\/s\.taobao\.com\/*/)){
      //  if(changeInfo.status == "complete") {
        //    chrome.tabs.executeScript(null, {file: "content_link.js"});
//        }
  //  }
    //else{
      //  chrome.tabs.executeScript(null, {file: "content_link.js"});
//    }

//});

//chrome.tabs.onActivated.addListener(function(activeInfo){
        //chrome.tabs.query({active: true,lastFocusedWindow: true}, function(tab){
            //var active_url = tab[0].url;
        //});
    //});

function send_mouse_info(info, site, port, username, taskid, unittag, action){
    mouse_tracking_info = mouse_tracking_info + info;
    mouse_tracking_count ++;
    if(action == "PAGE_END"){
        ajax_log_message(mouse_tracking_info, site, port, username, taskid, unittag);
        mouse_tracking_count = 0;
        mouse_tracking_info = "";
    }
    else {
        if(mouse_tracking_count >= mouse_tracking_group_limit){
            ajax_log_message(mouse_tracking_info, site, port, username, taskid, unittag);
            mouse_tracking_count = 0;
            mouse_tracking_info = "";
        }
    }
}

function ajax_log_message(log_str, site, port, username, taskid, unittag){
    //console.log(log_str);
    var encode_str = log_str;
    //alert(encode_str + "\n");
    var log_url = "http://" + site + ":" + port + "/task/ExtensionLogService/" + username + "/" + taskid + '/' + unittag + '/';
    $.ajax({
        type:'POST',
        url:log_url,
        data:{
            mouse_message:encode_str
        },
        complete: function (jqXHR, textStatus) {
            //alert(textStatus + "----" + jqXHR.status + "----" + jqXHR.readyState);
        }
    });

}
