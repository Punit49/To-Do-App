const addTaskBtn = document.querySelector("#add-task-btn");
const tasks = document.querySelector(".tasks");
const input = document.querySelector("#addTaskInput");
let itemArray = [];
let itemId = JSON.parse(localStorage.getItem("itemId")) || 1;
let isInputActive = false;
let hoverDiv = document.querySelector(".hoverDiv");

// Set an item in localStorage -
const setItem = (target, data) => {
    localStorage.setItem(target, JSON.stringify(data));
}

// Accessing an item from localStorage -
const getItem = (target) => {
    return JSON.parse(localStorage.getItem(target));
}

// Window load event handling
window.addEventListener('load', () => {
    let items = getItem("listItems").reverse();
    if(items && items != ""){
        items.forEach(item => {
            let div = makeList(item.data, item.id);
            tasks.append(div);
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
    tasks.removeChild(item);
    let listItems = getItem('listItems');
    let updatedItems = listItems.filter(item => item.id != itemId);
    setItem("listItems", updatedItems);
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
            <p class="taskData">${data}</p>
            <span>
                <span class="hoverBoxes">
                    <i class="fa-solid fa-pen editBtn iconHover" data-text="Edit Task"></i>
                </span>
                <span class="hoverBoxes">
                    <i class="fa-solid fa-trash deleteBtn iconHover" data-text="Delete Task"></i>
                </span>
            </>
        </section>
    `;
    let deleteItem = div.querySelector(".deleteBtn");
    deleteItem.addEventListener("click", deleteTask);
    let editBtn = div.querySelector('.editBtn');
    let iconHover = div.querySelectorAll('.iconHover');
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
    let closedtBox = e.target.closest('section');
    if(closedtBox != null){
        isInputActive = true;
        console.log(closedtBox);
        closedtBox.classList.add("hidden");
        let data = div.querySelector(".taskData");
        let input = makeInput(data.textContent);
        div.append(input);
        input.focus();
        input.addEventListener('keypress', (event) => {
            if(event.key == 'Enter' && isInputActive){
                handleEdit(input, closedtBox);
            }
        })
        input.addEventListener('blur', (event) => {
            if(isInputActive){
               handleEdit(input, closedtBox);
            }
        });
    }
}

// Main Event listener
addTaskBtn.addEventListener('click', createTask);