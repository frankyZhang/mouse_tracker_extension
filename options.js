/**
 * Created by franky on 16/4/12.
 */
var username = localStorage.username || '2012012172';
document.getElementById('username').value = username;
document.getElementById('save').onclick = function(){
    localStorage.username = document.getElementById('username').value;
    alert('保存成功!');
};