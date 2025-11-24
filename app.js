const DOM = {
    addBtn: document.querySelector("#add-task-btn"),
    input: document.querySelector("#addTaskInput"),
    pendingTasks: document.querySelector(".pendingTasks"),
    completedTasks: document.querySelector(".completedTasks"),
    allTasksDiv: document.querySelector(".allTasks"),
    filters: document.querySelectorAll(".filters"),
    underline: document.querySelector(".underline"),
    themeIcon: document.querySelector(".theme"),
    body: document.body,
    hoverDiv: document.querySelector(".hoverDiv")
};

// Set an item in localStorage -
const setItem = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

// Accessing an item from localStorage -
const getItem = (key, fallback = null) => {
    try{
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

let items = getItem("listItems", []);
let itemId = getItem("itemId", []);
let themeMode = getItem("themeMode", "dark");
let selected = null;

// Generate Background color for task container - 
const generateColor = () => {
    let colors = ["ADC8FF", "6297F0", "DCC7FF", "B4B9FF", "8966DD"]
    return colors[Math.floor(Math.random() * colors.length )];
}

// Making task container -
const createTaskElement = (task) => {
    let div = document.createElement('div');
    div.className = "taskItem";
    div.dataset.id = task.id;
    div.draggable = true;
    div.style.backgroundColor = `#${generateColor()}`;

    div.innerHTML = `
        <section class="taskBox flex gap-1">
            <span>
                <input type="checkbox" class="check inputEdit" ${task.completed ? "checked" : ""}>
                <label class="taskData ${task.completed ? "lineThrough" : ""}"> ${task.data} </label>
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
    return div;
}

// Render Tasks
const render = () => {
    DOM.pendingTasks.innerHTML = "";
    DOM.completedTasks.innerHTML = "";

    let pendingOrder = getItem("pendingOrder", []);
    let completeOrder = getItem("completeOrder", []);

    const renderedIds = new Set();

    pendingOrder.forEach(id => {
        const task = items.find(t => t.id == id && !t.completed);
        if (!task) return;
        DOM.pendingTasks.appendChild(createTaskElement(task));
        renderedIds.add(task.id);
    });

    completeOrder.forEach(id => {
        const task = items.find(t => t.id == id && t.completed);
        if (!task) return;
        DOM.completedTasks.appendChild(createTaskElement(task));
        renderedIds.add(task.id);
    });

    items.forEach(task => {
        if (renderedIds.has(task.id)) return;

        if (task.completed) {
            DOM.completedTasks.prepend(createTaskElement(task));
            completeOrder.unshift(task.id);
        } else {
            DOM.pendingTasks.prepend(createTaskElement(task));
            pendingOrder.unshift(task.id);
        }
        renderedIds.add(task.id);
    });

    setItem("pendingOrder", pendingOrder);
    setItem("completeOrder", completeOrder);
};


// Add task
const addTask = () => {
    let text = DOM.input.value.trim();
    if(!text) return;

    if(items.some(t => t.data.toLowerCase() === text.toLowerCase())){
        DOM.input.value = "";
        return;
    }

    const newTask = {
        id: itemId++,
        data: text,
        completed: false
    }

    items.push(newTask);
    setItem("listItems", items);
    setItem("itemId", itemId);

    DOM.pendingTasks.prepend(createTaskElement(newTask));
    saveOrder();
    DOM.input.value = "";
}

// Delete task
const deleteTask = (id) => {
    items = items.filter(t => t.id !== id)
    setItem("listItems", items);
}

// Toggle Complete
const toggleComplete = (id) => {
    items = items.map(t => {
        if(t.id === id) t.completed = !t.completed;
        return t;
    })
    setItem("listItems", items);
}

const startEdit = (element) => {
    const id = Number(element.dataset.id);
    const label = element.querySelector(".taskData");
    const oldText = label.textContent.trim();

    const input = document.createElement("input");
    input.className = "editInput";
    input.value = oldText;
    let oldInput = element.querySelector(".inputEdit");
    oldInput.classList.add("hidden");
    label.replaceWith(input);
    input.focus();

    const finish = () => {
        const newText = input.value.trim() || oldText;

        items = items.map(t => {
            if(t.id === id) t.data = newText;
            return t;
        })

        setItem("listItems", items);

        const newLabel = document.createElement("label");
        newLabel.className = "taskData";
        newLabel.textContent = newText;
        
        if(oldInput.checked){
            newLabel.classList.add("lineThrough");
        }

        if(input) {
            input.replaceWith(newLabel);
            oldInput.classList.remove("hidden");
        }
    }

    input.addEventListener("blur", finish);
    input.addEventListener("keypress", (e) => {
        if(e.key == "Enter") finish();
    })
}

DOM.allTasksDiv.addEventListener("click", (e) => {
    const target = e.target;
    const taskItem = target.closest(".taskItem");
    if(!taskItem) return;

    const id = Number(taskItem.dataset.id);

    if(target.classList.contains("deleteBtn")){
        deleteTask(id);
        taskItem.remove();
    }

    if(target.classList.contains("editBtn")){
        startEdit(taskItem);
    }

    if(target.classList.contains("check")){
        toggleComplete(id);
        render();
    }
})

DOM.allTasksDiv.addEventListener("dblclick", (e) => {
    const taskItem = e.target.closest(".taskItem");
    if(taskItem) startEdit(taskItem);
});

// Drag and Reorder
const saveOrder = () => {
    let pendingOrder = [];
    let completeOrder = [];
    DOM.pendingTasks.querySelectorAll('.taskItem').forEach(item => {
        pendingOrder.push(item.dataset.id);
    });
    DOM.completedTasks.querySelectorAll('.taskItem').forEach(item => {
        completeOrder.push(item.dataset.id);
    });
    localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
    localStorage.setItem("completeOrder", JSON.stringify(completeOrder));
}

DOM.allTasksDiv.addEventListener("dragstart", (e) => {
    selected = e.target.closest(".taskItem");
})

DOM.allTasksDiv.addEventListener("dragover", (e) => {
    e.preventDefault();
    const target = e.target.closest(".taskItem");
    if(target && target !== selected){
        target.parentElement.insertBefore(selected, target);
    }
})

DOM.allTasksDiv.addEventListener("drop", () => {
    selected = null;
    saveOrder();
});

// Handling filter tabs
const moveUnderline = (tab) => {
    const rect = tab.getBoundingClientRect();
    const parent = tab.parentElement.getBoundingClientRect();

    DOM.underline.style.width = `${rect.width}px`;
    DOM.underline.style.left = `${rect.left - parent.left}px`;
};

DOM.filters.forEach(tab => {
    tab.addEventListener("click", () => {

        document.querySelector(".filters.activeFilter")
            ?.classList.remove("activeFilter");

        tab.classList.add("activeFilter");

        moveUnderline(tab);

        document.querySelectorAll(".taskDivs")
            .forEach(div => {
                div.classList.add("hidden");
                div.classList.remove("activeDiv");
            });

        const type = tab.dataset.type;
        const section = document.getElementById(type);

        section.classList.remove("hidden");
        section.classList.add("activeDiv");
    });
});

// Tooltip popup
const makePopup = (event) => {
    let popupText = event.target.dataset.text;
    let parent = event.target.parentElement;
    parent.append(DOM.hoverDiv);
    DOM.hoverDiv.textContent = popupText;
}

DOM.allTasksDiv.addEventListener('mouseover', (event) => {
    if(event.target.classList.contains("iconHover")){
        makePopup(event);
        DOM.hoverDiv.classList.remove('notVisible');
        event.target.addEventListener('mouseleave', (event) => {
            if(event.target.classList.contains("iconHover")){
                DOM.hoverDiv.classList.add('notVisible');
            }
        });
    }
});

// Theme Handling 
if(themeMode === "light") {
    DOM.body.classList.add("light");
    DOM.themeIcon.setAttribute("src", "./dark.png");
}

const toggleTheme = () => {
    DOM.body.classList.toggle("light");
    themeMode = DOM.body.classList.contains("light") ? "light" : "dark";
    setItem("themeMode", themeMode);
    if(themeMode == "light") DOM.themeIcon.setAttribute("src", "./dark.png");
    else DOM.themeIcon.setAttribute("src", "./light(1).png");
}

DOM.addBtn.addEventListener("click", () => {
    addTask();
});

DOM.input.addEventListener("keypress", (e) => {
    if(e.key == "Enter") addTask();
})

DOM.themeIcon.addEventListener("click", () => {
    toggleTheme();
});

render();
moveUnderline(document.querySelector(".filters.activeFilter"));