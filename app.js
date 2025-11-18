const addTaskBtn = document.querySelector("#add-task-btn");
const tasks = document.querySelector(".tasks");
const input = document.querySelector("#addTaskInput");
let itemArray = [];
let itemId = JSON.parse(localStorage.getItem("itemId")) || 1;
let isInputActive = false;
let hoverDiv = document.querySelector(".hoverDiv");
let completedTasks = document.querySelector(".completedTasks")
let completedTaskArray = JSON.parse(localStorage.getItem("completedTask")) || [];

// Set an item in localStorage -
const setItem = (target, data) => {
    localStorage.setItem(target, JSON.stringify(data));
}

// Accessing an item from localStorage -
const getItem = (target) => {
    return JSON.parse(localStorage.getItem(target)) || [];
}

// Window load event handling
window.addEventListener('load', () => {
    let items = getItem("listItems");
    if(items && items != ""){
        items.forEach(item => {
            let div = makeList(item.data, item.id);
            if(item.completed){
                completedTasks.prepend(div);
                div.querySelector(".inputheckBox").checked = true;
            }
            else{
                tasks.prepend(div);
            }
        });
    } 
})

// Generate Background color for task container - 
const generateColor = () => {
    let colors = ["ADC8FF", "6297F0", "DCC7FF", "B4B9FF", "8966DD"]
    return colors[Math.floor(Math.random() * 5 )];
}

// Delete a task
const deleteTask = (e) => {
    let item = e.target.closest('div');
    let itemId = item.getAttribute('id');
    let listItems = getItem('listItems');
    let isCompleted = listItems.filter(item => item.id == itemId);
    let updatedItems = listItems.filter(item => item.id != itemId);
    setItem("listItems", updatedItems);
    if(isCompleted[0].completed){
        completedTasks.removeChild(item);
        return;
    }
    tasks.removeChild(item);
}

const makePopup = (event, icon) => {
    let popupText = event.target.dataset.text;
    let parent = icon.parentElement;
    parent.append(hoverDiv);
    hoverDiv.textContent = popupText;
}

// Making task container
const makeList = (data, id = itemId) => {
    let div = document.createElement('div');
    div.classList.add("taskItem");
    div.setAttribute('id', (`${id}`));

    div.style.backgroundColor = `#${generateColor()}`;
    div.innerHTML = `
        <section class="taskBox">
            <span>
                <input type="checkbox" name="inputCheck" id=task${id} class="inputheckBox">
                <label class="taskData" for=task${id}> ${data} </label>
            </span>
            <span>
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
    let editBtn = div.querySelector('.editBtn');
    let iconHover = div.querySelectorAll('.iconHover');
    let inputheckBox = div.querySelector('.inputheckBox');

    deleteItem.addEventListener("click", deleteTask);

    editBtn.addEventListener('click', (e) => {
         editFunction(div, e);
    })

    div.addEventListener("dblclick", (e) => {
         editFunction(div, e);
    });

    iconHover.forEach((icon) => {
        icon.addEventListener("mouseover", (event) => {
            makePopup(event, icon);
            hoverDiv.classList.remove('notVisible');
        });
        icon.addEventListener("mouseleave", (event) => {
            hoverDiv.classList.add('notVisible');
        });
    })

    inputheckBox.addEventListener('change', (event) => {
        let parent = event.target.closest('div');
        let listItems = getItem("listItems");
        let taskId = parent.getAttribute('id');
        let label = parent.querySelector(".taskData");
        let completeItem = listItems.map((item) => {
            if(item.id == taskId){
                if(item.completed){
                    label.classList.remove("lineThrough");
                    item.completed = false;
                }
                else {
                    item.completed = true;
                    label.classList.add("lineThrough");
                }
            } 
            return item;
        });
        setItem('listItems', completeItem);
        if(inputheckBox.checked){
            completedTasks.prepend(parent);
        }
        else{
            tasks.prepend(parent);
        }
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
};

const makeInput = (data) => {
    let input = document.createElement('input');
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
        if(item.data === data.textContent){
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
            if(isInputActive){
               handleEdit(input, closestBox);
            }
        });
    }
}

// Main Event listener
addTaskBtn.addEventListener('click', createTask);