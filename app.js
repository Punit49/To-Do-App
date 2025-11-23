const addTaskBtn = document.querySelector("#add-task-btn");
const tasks = document.querySelector(".tasks");
const input = document.querySelector("#addTaskInput");
let itemArray = [];
let itemId = JSON.parse(localStorage.getItem("itemId")) || 1;
let isInputActive = false;
let hoverDiv = document.querySelector(".hoverDiv");
let completedTasks = document.querySelector(".completedTasks")
let pendingTasks = document.querySelector(".pendingTasks")
let filters = document.querySelectorAll(".filters");
let underline = document.querySelector(".underline");
let allTasksDiv = document.querySelector(".allTasks");
const themeIcon = document.querySelector(".theme");


// Load Tasks in thier respective containers -
const loadTasks = (target) => {
    let items = getItem("listItems");
    if(items && items != ""){
        items.forEach(item => {
            let div = makeList(item.data, item.id);
            let label = div.querySelector('label'); 
            let isThere = target.querySelector(`[id="${item.id}"]`);
            const isCompleted = item.completed;
            if(!isThere){
                if(isCompleted){
                    label.classList.add('lineThrough');
                    div.querySelector('input').checked = true;
                }
                else {
                    label.classList.remove('lineThrough');
                    div.querySelector('input').checked = false;
                }
                if(target.classList.contains("completedTasks") && isCompleted) {
                    completedTasks.prepend(div);
                    return;
                }
                else if(!isCompleted && target.classList.contains("pendingTasks")){
                    pendingTasks.prepend(div);
                    return;
                }
            }
        });
    } 
}

// Window load event handling
window.addEventListener('load', async () => {
    
    loadTasks(tasks);
    loadTasks(completedTasks);

    const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
    const completeOrder = JSON.parse(localStorage.getItem("completeOrder"));

    if (pendingOrder) {
        pendingOrder.forEach(id => {
            const item = document.getElementById(id);
            if(item) pendingTasks.appendChild(item);
        });
    }
    if (completeOrder) {
        completeOrder.forEach(id => {
            const item = document.getElementById(id);
            if(item) completedTasks.appendChild(item);
        });
    }
});

const renderItemsDiv = (tab) => {
    let activeDiv = document.querySelector(".activeDiv");
    activeDiv.classList.remove("activeDiv");
    let renderDiv = document.querySelector(`#${tab.dataset.type}`);
    renderDiv.classList.add("activeDiv");
    let target = renderDiv.querySelector(".containerOfTask");
    loadTasks(target);
}

// Handling Filters - 
function moveUnderline(activeTab){
    let rect = activeTab.getBoundingClientRect();
    let parentRect = activeTab.parentElement.getBoundingClientRect();
    
    underline.style.width = `${rect.width}px`;
    underline.style.left = (rect.left - parentRect.left) + "px";
}

filters.forEach((tab) => {
    tab.addEventListener('click', () => {
        let active = document.querySelector(".filters.activeFilter");
        active.classList.remove("activeFilter");
        tab.classList.add('activeFilter');
        renderItemsDiv(tab);
        moveUnderline(tab);
    });
});

moveUnderline(document.querySelector(".filters.activeFilter"));

// Generate Background color for task container - 
const generateColor = () => {
    let colors = ["ADC8FF", "6297F0", "DCC7FF", "B4B9FF", "8966DD"]
    return colors[Math.floor(Math.random() * 5 )];
}

// Delete a task
const deleteTask = (element, e) => {
    let parent = element.parentElement;
    if(parent) parent.removeChild(element);
    let listItems = getItem('listItems');
    let updatedItems = listItems.filter(item => item.id != element.id);
    setItem("listItems", updatedItems);
}

const makePopup = (event) => {
    let popupText = event.target.dataset.text;
    let parent = event.target.parentElement;
    parent.append(hoverDiv);
    hoverDiv.textContent = popupText;
}

// Making task container
const makeList = (data, id = itemId) => {
    let div = document.createElement('div');
    div.classList.add("taskItem");
    div.setAttribute('id', (`${id}`));
    div.setAttribute('draggable', true);

    div.style.backgroundColor = `#${generateColor()}`;
    div.innerHTML = `
        <section class="taskBox">
            <span>
                <input type="checkbox" name="inputCheck" id=task${id} class="inputheckBox">
                <label class="taskData"> ${data} </label>
            </span>
            <span class="iconBox">
                <span class="hoverBoxes">
                    <i class="fa-solid fa-pen editBtn iconHover" data-text="Edit Task"></i>
                </span>
                <span class="hoverBoxes">
                    <i class="fa-solid fa-trash deleteBtn iconHover" data-text="Delete Task"></i>
                </span>
            </span>
        </section>
    `;

    let deleteItem = div.querySelector(".deleteBtn");
    let inputheckBox = div.querySelector('.inputheckBox');

    deleteItem.addEventListener("click", deleteTask);

    inputheckBox.addEventListener('change', (event) => {
        let parent = event.target.closest('div');
        let listItems = getItem("listItems");
        let taskId = parent.getAttribute('id');
        let label = parent.querySelector(".taskData");
        let completeItem = listItems.map((item) => {
            if(item.id == taskId){
                if(item.completed){
                    pendingTasks.prepend(parent);
                    label.classList.remove("lineThrough");
                    item.completed = false;
                }
                else {
                    item.completed = true;
                    label.classList.add("lineThrough");
                    if(!completedTasks.querySelector(`[id="${item.id}"]`)){
                        completedTasks.prepend(parent);
                    }
                }
            } 
            return item;
        });
        setItem('listItems', completeItem);
    })
    return div;
}

// Creating and attaching task container
const createTask = (e) => {

    let data = input.value.trim();
    if(data && data != ""){
        let listItems = JSON.parse(localStorage.getItem("listItems")) || [];
        let isItem = listItems.some(item => item.data.toLowerCase() === data.toLowerCase());
        if(isItem) return;
        let div = makeList(data);
        itemId = JSON.parse(localStorage.getItem("itemId")) || itemId;
        let itemObject = {
            data: `${data}`,
            time: Date.now(),
            completed: false, 
            id: itemId
        }
        listItems.push(itemObject);
        setItem("listItems", listItems);
        tasks.prepend(div);
        itemId++;
        localStorage.setItem("itemId", JSON.stringify(itemId)); 
    }
    input.value = "";
};

const makeInput = (data) => {
    let input = document.createElement('input');
    input.setAttribute("id", `input-${data.trim()}`);
    input.classList.add("editInput");
    input.value = data;
    return input;
}

const handleEdit = (input, closedtBox) => {
    let listItems = getItem('listItems');
    let data = closedtBox.querySelector(".taskData");
    input.classList.add('hidden');
    closedtBox.classList.remove("hidden");
    let updatedArray = listItems.map((item) => {
        if(item.data.trim() === data.textContent.trim()){
            item.data = input.value;
        }
        return item;
    });
    setItem("listItems", updatedArray);
    data.textContent = input.value;
}

// Edit Feature
const editFunction = (div, e) => {
    let closestBox = e.target.closest('section');
    if(closestBox != null){
        isInputActive = true;
        closestBox.classList.add("hidden");
        let data = div.querySelector(".taskData");
        let input = makeInput(data.textContent);
        div.append(input);
        input.focus();
        input.addEventListener('keypress', (event) => {
            if(event.key == 'Enter' && isInputActive){
                handleEdit(input, closestBox);
            }
        })
        input.addEventListener('blur', (event) => {
            handleEdit(input, closestBox);
        });
    }
}

// Main Event listener
addTaskBtn.addEventListener('click', createTask);

allTasksDiv.addEventListener('click', (e) => {
    // Edit
    if(e.target.classList.contains("editBtn")){
        const taskItem = e.target.closest(".taskItem");
        editFunction(taskItem, e);
    }
    // Delete
    if(e.target.classList.contains("deleteBtn")){
        const taskItem = e.target.closest(".taskItem");
        const instances = document.querySelectorAll(`[id="${taskItem.id}"]`);
        instances.forEach(task => {
            deleteTask(task, e);
        })
    }
});

allTasksDiv.addEventListener('dblclick', (e) => {
    const taskItem = e.target.closest(".taskItem");
    editFunction(taskItem, e);
});

// Drag and drop 

const saveOrder = () => {
    let pendingOrder = [];
    let completeOrder = [];
    pendingTasks.querySelectorAll('.taskItem').forEach(item => {
        pendingOrder.push(item.id);
    });
    completedTasks.querySelectorAll('.taskItem').forEach(item => {
        completeOrder.push(item.id);
    });
    localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
    localStorage.setItem("completeOrder", JSON.stringify(completeOrder));
}

let selected = null;

allTasksDiv.addEventListener('dragstart', (e) => {
    if(e.target.classList.contains("taskItem")){
        selected = e.target;
    }
});

allTasksDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest(".taskItem");
    if(!target || target === selected) return;
    let parent = target.parentElement;
    parent.insertBefore(selected, target);
});

allTasksDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    selected = null;
    saveOrder();
});

 // Here i used Event Delegation
allTasksDiv.addEventListener('mouseover', (event) => {
    if(event.target.classList.contains("iconHover")){
        makePopup(event);
        hoverDiv.classList.remove('notVisible');
        event.target.addEventListener('mouseleave', (event) => {
            if(event.target.classList.contains("iconHover")){
                hoverDiv.classList.add('notVisible');
            }
        });
    }
});
