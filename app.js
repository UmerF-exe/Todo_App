var task = document.getElementById("task");
var add_btn = document.getElementById("add-btn");
var list = document.getElementById("list");

function addTask(){
   list.innerHTML += `<li><input type='text' value='${task.value}' disabled>
   <i class='fa-solid fa-edit' onclick='editTask(event)'></i>
   <i class='fa-solid fa-trash' onclick='deleteTask(event)'></i></li>`;
   task.value = "";
}
function addTaskEnter(event){
    if(event.keyCode === 13){
        addTask();
    }
}
function deleteTask(event){
    event.target.parentNode.remove();
}
function editTask(event){
    var input = event.target.parentNode.firstChild;
    input.disabled = false;
    input.focus();
    event.target.className = "fa-solid fa-check";
    event.target.setAttribute('onclick','updateTask(event)');
}
function updateTask(event){
    var input = event.target.parentNode.firstChild;
    input.disabled = true;
    event.target.className = "fa-solid fa-edit";
    event.target.setAttribute('onclick','editTask(event)');
}