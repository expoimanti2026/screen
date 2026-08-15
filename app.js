/* ============================================================
   MY CLASSROOM SCREENS
   Vanilla JavaScript classroom dashboard
============================================================ */


/* ============================================================
   DATA
============================================================ */

const STORAGE_KEY = "myClassroomScreens_v1";

let appData = loadData();

let currentScreenIndex = 0;

let selectedWidget = null;

let zCounter = 10;

let dragState = null;

let resizeState = null;

let editingChecklistWidget = null;

let noiseAnimationFrame = null;


/* ============================================================
   DEFAULT DATA
============================================================ */

function createDefaultData() {

    return {

        screens: [

            {

                id: createId(),

                name: "Monday",

                widgets: []

            },

            {

                id: createId(),

                name: "Tuesday",

                widgets: []

            }

        ],

        pictograms: []

    };

}


/* ============================================================
   LOAD / SAVE
============================================================ */

function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed = JSON.parse(saved);

            if (
                parsed &&
                Array.isArray(parsed.screens)
            ) {

                return parsed;

            }

        }

    } catch (error) {

        console.error(
            "Could not load saved data:",
            error
        );

    }

    return createDefaultData();
}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

    } catch (error) {

        console.error(
            "Could not save data:",
            error
        );

        alert(
            "The browser could not save this data. Large uploaded images can exceed local storage limits."
        );

    }

}


/* ============================================================
   UTILITIES
============================================================ */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
    );

}


function currentScreen() {

    return appData.screens[currentScreenIndex];

}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


/* ============================================================
   DOM
============================================================ */

const screenCanvas =
    document.getElementById("screenCanvas");

const screenSelect =
    document.getElementById("screenSelect");

const emptyMessage =
    document.getElementById("emptyMessage");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalContent =
    document.getElementById("modalContent");

const textToolbar =
    document.getElementById("textToolbar");

const fontSizeSelect =
    document.getElementById("fontSizeSelect");

const textColorPicker =
    document.getElementById("textColorPicker");

const imageUploadInput =
    document.getElementById("imageUploadInput");

const pictogramUploadInput =
    document.getElementById("pictogramUploadInput");


/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupButtons();

        renderScreenList();

        renderCurrentScreen();

        setupKeyboardNavigation();

    }
);


/* ============================================================
   BUTTONS
============================================================ */

function setupButtons() {
/*
    document
        .getElementById("prevScreenBtn")
        .addEventListener(
            "click",
            previousScreen
        );

    document
        .getElementById("nextScreenBtn")
        .addEventListener(
            "click",
            nextScreen
        );
*/
    document
        .getElementById("addScreenBtn")
        .addEventListener(
            "click",
            addScreen
        );

    document
        .getElementById("renameScreenBtn")
        .addEventListener(
            "click",
            renameScreen
        );

    document
        .getElementById("duplicateScreenBtn")
        .addEventListener(
            "click",
            duplicateScreen
        );

    document
        .getElementById("deleteScreenBtn")
        .addEventListener(
            "click",
            deleteScreen
        );

    document
        .getElementById("addTextBtn")
        .addEventListener(
            "click",
            addTextWidget
        );

    document
        .getElementById("addTimerBtn")
        .addEventListener(
            "click",
            addTimerWidget
        );

    document
        .getElementById("addImageBtn")
        .addEventListener(
            "click",
            () => {

                imageUploadInput.click();

            }
        );

    document
        .getElementById("addChecklistBtn")
        .addEventListener(
            "click",
            addChecklistWidget
        );

    document
        .getElementById("addNoiseBtn")
        .addEventListener(
            "click",
            addNoiseWidget
        );
    document
        .getElementById("addIframeBtn")
        .addEventListener(
            "click",
            addIframeWidget
        );

    

    screenSelect.addEventListener(
        "change",
        () => {

            currentScreenIndex =
                Number(screenSelect.value);

            renderCurrentScreen();

        }
    );

    document
        .getElementById("closeModalBtn")
        .addEventListener(
            "click",
            closeModal
        );

    modalOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target === modalOverlay
            ) {

                closeModal();

            }

        }
    );


    /* Text formatting */

    document
        .querySelectorAll(
            "#textToolbar button"
        )
        .forEach(button => {

            button.addEventListener(
                "mousedown",
                event => {

                    event.preventDefault();

                    const command =
                        button.dataset.command;

                    document.execCommand(
                        command,
                        false,
                        null
                    );

                    saveSelectedTextWidget();

                }
            );

        });


    fontSizeSelect.addEventListener(
        "change",
        () => {

            const size =
                fontSizeSelect.value;

            if (!size) return;

            applyFontSize(size);

        }
    );


    textColorPicker.addEventListener(
        "input",
        () => {

            document.execCommand(
                "foreColor",
                false,
                textColorPicker.value
            );

            saveSelectedTextWidget();

        }
    );


    /* Image upload */

    imageUploadInput.addEventListener(
        "change",
        handleImageUpload
    );


    /* Pictogram upload */

    pictogramUploadInput.addEventListener(
        "change",
        handlePictogramUpload
    );

}


/* ============================================================
   SCREEN NAVIGATION
============================================================ */

function setupKeyboardNavigation() {

    document.addEventListener(
        "keydown",
        event => {

            const tag =
                document.activeElement?.tagName;

            const editing =
                document.activeElement?.isContentEditable;

            if (
                editing ||
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT"
            ) {

                return;

            }

            if (event.key === "ArrowLeft") {

                previousScreen();

            }

            if (event.key === "ArrowRight") {

                nextScreen();

            }

        }
    );

}


function previousScreen() {

    if (
        appData.screens.length === 0
    ) return;

    currentScreenIndex--;

    if (
        currentScreenIndex < 0
    ) {

        currentScreenIndex =
            appData.screens.length - 1;

    }

    renderScreenList();

    renderCurrentScreen();

}


function nextScreen() {

    if (
        appData.screens.length === 0
    ) return;

    currentScreenIndex++;

    if (
        currentScreenIndex >=
        appData.screens.length
    ) {

        currentScreenIndex = 0;

    }

    renderScreenList();

    renderCurrentScreen();

}


/* ============================================================
   SCREEN MANAGEMENT
============================================================ */

function renderScreenList() {

    screenSelect.innerHTML = "";

    appData.screens.forEach(
        (screen, index) => {

            const option =
                document.createElement("option");

            option.value = index;

            option.textContent =
                `${index + 1}. ${screen.name}`;

            if (
                index === currentScreenIndex
            ) {

                option.selected = true;

            }

            screenSelect.appendChild(option);

        }
    );

}


function addScreen() {

    const name =
        prompt(
            "Name this screen:",
            `Screen ${appData.screens.length + 1}`
        );

    if (!name) return;

    appData.screens.push({

        id: createId(),

        name: name.trim(),

        widgets: []

    });

    currentScreenIndex =
        appData.screens.length - 1;

    saveData();

    renderScreenList();

    renderCurrentScreen();

}


function renameScreen() {

    const screen =
        currentScreen();

    if (!screen) return;

    const name =
        prompt(
            "New screen name:",
            screen.name
        );

    if (!name) return;

    screen.name =
        name.trim();

    saveData();

    renderScreenList();

}


function duplicateScreen() {

    const original =
        currentScreen();

    if (!original) return;

    const copy =
        JSON.parse(
            JSON.stringify(original)
        );

    copy.id = createId();

    copy.name =
        `${original.name} Copy`;

    copy.widgets.forEach(
        widget => {

            widget.id = createId();

        }
    );

    appData.screens.splice(
        currentScreenIndex + 1,
        0,
        copy
    );

    currentScreenIndex++;

    saveData();

    renderScreenList();

    renderCurrentScreen();

}


function deleteScreen() {

    if (
        appData.screens.length <= 1
    ) {

        alert(
            "You need at least one screen."
        );

        return;

    }

    const screen =
        currentScreen();

    const confirmed =
        confirm(
            `Delete "${screen.name}"?`
        );

    if (!confirmed) return;

    appData.screens.splice(
        currentScreenIndex,
        1
    );

    currentScreenIndex =
        clamp(
            currentScreenIndex,
            0,
            appData.screens.length - 1
        );

    saveData();

    renderScreenList();

    renderCurrentScreen();

}


/* ============================================================
   RENDER SCREEN
============================================================ */

function renderCurrentScreen() {

    stopNoiseMeter();

    selectedWidget = null;

    textToolbar.classList.add(
        "hidden"
    );

    screenCanvas
        .querySelectorAll(".widget")
        .forEach(widget => widget.remove());

    const screen =
        currentScreen();

    if (!screen) return;

    emptyMessage.style.display =
        screen.widgets.length
            ? "none"
            : "block";

    screen.widgets.forEach(
        widgetData => {

            renderWidget(widgetData);

        }
    );

}


/* ============================================================
   WIDGET CREATION
============================================================ */

function createWidget(
    type,
    x = 100,
    y = 100,
    width = 300,
    height = 200
) {

    const widget = {

        id: createId(),

        type,

        x,

        y,

        width,

        height,

        zIndex: ++zCounter

    };

    currentScreen().widgets.push(widget);

    saveData();

    renderWidget(widget);

    selectWidget(
        document.querySelector(
            `[data-widget-id="${widget.id}"]`
        )
    );

    return widget;

}


/* ============================================================
   TEXT WIDGET
============================================================ */

function addTextWidget() {

    const widget =
        createWidget(
            "text",
            120,
            100,
            400,
            250
        );

    widget.html =
        "<h2>Type your text here</h2><p>Double-click to edit.</p>";

    saveData();

    renderCurrentScreen();

}


function renderTextWidget(
    content,
    widgetData
) {

    const editor =
        document.createElement("div");

    editor.className =
        "text-widget-content";

    editor.contentEditable = true;

    editor.innerHTML =
        widgetData.html ||
        "<p>Type your text here...</p>";

    editor.addEventListener(
        "input",
        () => {

            widgetData.html =
                editor.innerHTML;

            saveData();

        }
    );

    editor.addEventListener(
        "focus",
        () => {

            textToolbar.classList.remove(
                "hidden"
            );

        }
    );

    editor.addEventListener(
        "blur",
        () => {

            setTimeout(
                () => {

                    if (
                        !textToolbar.matches(":hover")
                    ) {

                        textToolbar.classList.add(
                            "hidden"
                        );

                    }

                },
                200
            );

        }
    );

    content.appendChild(editor);

}


function applyFontSize(size) {

    const selection =
        window.getSelection();

    if (
        !selection ||
        selection.rangeCount === 0
    ) return;

    document.execCommand(
        "fontSize",
        false,
        "7"
    );

    const fonts =
        document.querySelectorAll(
            'font[size="7"]'
        );

    fonts.forEach(
        font => {

            font.removeAttribute("size");

            font.style.fontSize =
                `${size}px`;

        }
    );

    saveSelectedTextWidget();

}


function saveSelectedTextWidget() {

    if (!selectedWidget) return;

    const editor =
        selectedWidget.querySelector(
            ".text-widget-content"
        );

    if (!editor) return;

    const data =
        getWidgetData(
            selectedWidget.dataset.widgetId
        );

    if (data) {

        data.html =
            editor.innerHTML;

        saveData();

    }

}


/* ============================================================
   TIMER WIDGET
============================================================ */

function addTimerWidget() {

    const widget =
        createWidget(
            "timer",
            200,
            120,
            360,
            260
        );

    widget.duration =
        5 * 60;

    widget.remaining =
        widget.duration;

    widget.running = false;

    saveData();

    renderCurrentScreen();

}


function formatTime(seconds) {

    seconds =
        Math.max(
            0,
            Math.round(seconds)
        );

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


function renderTimerWidget(
    content,
    widgetData
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "timer-display";

    const display =
        document.createElement("div");

    display.className =
        "timer-time";

    display.textContent =
        formatTime(
            widgetData.remaining ??
            widgetData.duration ??
            300
        );

    const buttons =
        document.createElement("div");

    buttons.className =
        "timer-buttons";

    const start =
        document.createElement("button");

    start.textContent =
        widgetData.running
            ? "Pause"
            : "Start";

    const reset =
        document.createElement("button");

    reset.textContent =
        "Reset";

    const presets =
        document.createElement("div");

    presets.className =
        "timer-presets";

    [
        ["1 min", 60],
        ["5 min", 300],
        ["10 min", 600],
        ["15 min", 900],
        ["20 min",1200]
    ].forEach(
        ([label, seconds]) => {

            const button =
                document.createElement("button");

            button.textContent = label;

            button.addEventListener(
                "click",
                () => {

                    widgetData.duration =
                        seconds;

                    widgetData.remaining =
                        seconds;

                    widgetData.running =
                        false;

                    saveData();

                    renderCurrentScreen();

                }
            );

            presets.appendChild(button);

        }
    );


    start.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            widgetData.running =
                !widgetData.running;

            if (
                widgetData.running
            ) {

                widgetData.lastTick =
                    Date.now();

            }

            saveData();

            updateTimerDisplay(
                display,
                widgetData
            );

            start.textContent =
                widgetData.running
                    ? "Pause"
                    : "Start";

            if (
                widgetData.running
            ) {

                runTimer(
                    widgetData,
                    display,
                    start
                );

            }

        }
    );


    reset.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            widgetData.remaining =
                widgetData.duration;

            widgetData.running =
                false;

            saveData();

            updateTimerDisplay(
                display,
                widgetData
            );

            start.textContent =
                "Start";

        }
    );


    buttons.appendChild(start);
    buttons.appendChild(reset);

    wrapper.appendChild(display);
    wrapper.appendChild(buttons);
    wrapper.appendChild(presets);

    content.appendChild(wrapper);

    if (
        widgetData.running
    ) {

        runTimer(
            widgetData,
            display,
            start
        );

    }

}


function updateTimerDisplay(
    display,
    widgetData
) {

    display.textContent =
        formatTime(
            widgetData.remaining
        );

}

function playTimerSound() {
    const audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    const notes = [880, 660, 880];

    notes.forEach((frequency, index) => {

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        const startTime =
            audioContext.currentTime +
            index * 0.25;

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            startTime
        );

        gain.gain.setValueAtTime(
            0.001,
            startTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.35,
            startTime + 0.03
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.2
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.22);
    });
}


function runTimer(
    widgetData,
    display,
    startButton
) {

    function tick() {

        if (
            !widgetData.running
        ) return;

        const now =
            Date.now();

        const elapsed =
            (now - widgetData.lastTick) /
            1000;

        widgetData.remaining -=
            elapsed;

        widgetData.lastTick =
            now;

        if (
            widgetData.remaining <= 0
        ) {

            widgetData.remaining = 0;

            widgetData.running =
                false;

            display.textContent =
                "00:00";

            startButton.textContent =
                "Start";
            playTimerSound();
            saveData();

            return;

        }

        display.textContent =
            formatTime(
                widgetData.remaining
            );

        requestAnimationFrame(tick);

    }

    requestAnimationFrame(tick);

}


/* ============================================================
   IMAGE WIDGET
============================================================ */

function handleImageUpload(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        () => {

            const widget =
                createWidget(
                    "image",
                    150,
                    100,
                    400,
                    300
                );

            widget.src =
                reader.result;

            widget.name =
                file.name;

            saveData();

            renderCurrentScreen();

        };

    reader.readAsDataURL(file);

    event.target.value = "";

}


function renderImageWidget(
    content,
    widgetData
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "image-widget";

    const img =
        document.createElement("img");

    img.src =
        widgetData.src;

    img.alt =
        widgetData.name ||
        "Classroom image";

    wrapper.appendChild(img);

    content.appendChild(wrapper);

}


/* ============================================================
   CHECKLIST
============================================================ */

function addChecklistWidget() {

    const widget =
        createWidget(
            "checklist",
            100,
            100,
            500,
            400
        );

    widget.items = [

        {

            id: createId(),

            text: "Get ready",

            pictogram: null,

            checked: false

        },

        {

            id: createId(),

            text: "Complete your work",

            pictogram: null,

            checked: false

        }

    ];

    saveData();

    renderCurrentScreen();

    openChecklistEditor(
        widget
    );

}


function renderChecklistWidget(
    content,
    widgetData
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "checklist";

    const items =
        widgetData.items || [];

    items.forEach(
        item => {

            const row =
                document.createElement("div");

            row.className =
                "check-item";

            if (item.checked) {

                row.classList.add(
                    "completed"
                );

            }


            if (item.pictogram) {

                const img =
                    document.createElement("img");

                img.src =
                    item.pictogram;

                row.appendChild(img);

            } else {

                const blank =
                    document.createElement("div");

                row.appendChild(blank);

            }


            const text =
                document.createElement("div");

            text.className =
                "check-item-text";

            text.textContent =
                item.text;

            row.appendChild(text);


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.checked =
                !!item.checked;

            checkbox.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );

            checkbox.addEventListener(
                "change",
                () => {

                    item.checked =
                        checkbox.checked;

                    row.classList.toggle(
                        "completed",
                        item.checked
                    );

                    saveData();

                }
            );

            row.appendChild(checkbox);

            wrapper.appendChild(row);

        }
    );


    const controls =
        document.createElement("div");

    controls.className =
        "checklist-controls";

    const edit =
        document.createElement("button");

    edit.textContent =
        "⚙";

    edit.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openChecklistEditor(
                widgetData
            );

        }
    );

    controls.appendChild(edit);

    wrapper.appendChild(controls);

    content.appendChild(wrapper);

}


/* ============================================================
   CHECKLIST EDITOR
============================================================ */

function openChecklistEditor(
    widgetData
) {

    editingChecklistWidget =
        widgetData;

    let html = `

        <h2>Checklist</h2>

        <p>
            Each item can have a pictogram,
            text and checkbox.
        </p>

        <div class="checklist-editor"
             id="checklistEditor">
        </div>

        <div>

            <button
                class="secondary-button"
                id="addChecklistItemBtn">

                + Add item

            </button>

            <button
                class="secondary-button"
                id="uploadPictogramBtn">

                🖼 Add pictogram

            </button>

        </div>

        <h3>Pictogram bank</h3>

        <p>
            Click a pictogram to add it to
            the selected checklist item.
        </p>

        <div
            class="pictogram-bank"
            id="pictogramBank">
        </div>

        <div class="modal-buttons">

            <button
                class="primary-button"
                id="saveChecklistBtn">

                Save checklist

            </button>

            <button
                class="secondary-button"
                id="cancelChecklistBtn">

                Cancel

            </button>

        </div>
    `;

    modalContent.innerHTML =
        html;

    modalOverlay.classList.remove(
        "hidden"
    );

    renderChecklistEditor();

    document
        .getElementById("addChecklistItemBtn")
        .addEventListener(
            "click",
            () => {

                widgetData.items.push({

                    id: createId(),

                    text: "New activity",

                    pictogram: null,

                    checked: false

                });

                renderChecklistEditor();

            }
        );


    document
        .getElementById("uploadPictogramBtn")
        .addEventListener(
            "click",
            () => {

                pictogramUploadInput.click();

            }
        );


    document
        .getElementById("saveChecklistBtn")
        .addEventListener(
            "click",
            () => {

                saveData();

                closeModal();

                renderCurrentScreen();

            }
        );


    document
        .getElementById("cancelChecklistBtn")
        .addEventListener(
            "click",
            () => {

                closeModal();

            }
        );


    renderPictogramBank();

}


function renderChecklistEditor() {

    const editor =
        document.getElementById(
            "checklistEditor"
        );

    if (!editor) return;

    editor.innerHTML = "";

    editingChecklistWidget.items.forEach(
        item => {

            const row =
                document.createElement("div");

            row.className =
                "checklist-item-editor";


            const preview =
                document.createElement("img");

            preview.className =
                "pictogram-preview";

            if (item.pictogram) {

                preview.src =
                    item.pictogram;

            }

            row.appendChild(preview);


            const text =
                document.createElement("input");

            text.type =
                "text";

            text.value =
                item.text;

            text.addEventListener(
                "input",
                () => {

                    item.text =
                        text.value;

                }
            );

            row.appendChild(text);


            const select =
                document.createElement(
                    "select"
                );

            const noneOption =
                document.createElement(
                    "option"
                );

            noneOption.value = "";

            noneOption.textContent =
                "No pictogram";

            select.appendChild(
                noneOption
            );


            appData.pictograms.forEach(
                pictogram => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        pictogram.id;

                    option.textContent =
                        pictogram.name;

                    if (
                        item.pictogramId ===
                        pictogram.id
                    ) {

                        option.selected = true;

                    }

                    select.appendChild(
                        option
                    );

                }
            );


            select.addEventListener(
                "change",
                () => {

                    const selected =
                        appData.pictograms.find(
                            p =>
                                p.id ===
                                select.value
                        );

                    if (selected) {

                        item.pictogram =
                            selected.src;

                        item.pictogramId =
                            selected.id;

                    } else {

                        item.pictogram =
                            null;

                        item.pictogramId =
                            null;

                    }

                    if (
                        item.pictogram
                    ) {

                        preview.src =
                            item.pictogram;

                    } else {

                        preview.removeAttribute(
                            "src"
                        );

                    }

                }
            );

            row.appendChild(select);


            const remove =
                document.createElement(
                    "button"
                );

            remove.className =
                "remove-check-item";

            remove.textContent =
                "×";

            remove.addEventListener(
                "click",
                () => {

                    editingChecklistWidget.items =
                        editingChecklistWidget.items
                            .filter(
                                i =>
                                    i.id !==
                                    item.id
                            );

                    renderChecklistEditor();

                }
            );

            row.appendChild(remove);

            editor.appendChild(row);

        }
    );

}


/* ============================================================
   PICTOGRAM BANK
============================================================ */

function handlePictogramUpload(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        () => {

            const pictogram = {

                id: createId(),

                name:
                    file.name.replace(
                        /\.[^/.]+$/,
                        ""
                    ),

                src:
                    reader.result

            };

            appData.pictograms.push(
                pictogram
            );

            saveData();

            renderPictogramBank();

            renderChecklistEditor();

        };

    reader.readAsDataURL(file);

    event.target.value = "";

}


function renderPictogramBank() {

    const bank =
        document.getElementById(
            "pictogramBank"
        );

    if (!bank) return;

    bank.innerHTML = "";

    if (
        appData.pictograms.length === 0
    ) {

        bank.innerHTML = `
            <p>
                Your pictogram bank is empty.
                Click "Add pictogram" to upload
                your first pictogram.
            </p>
        `;

        return;

    }


    appData.pictograms.forEach(
        pictogram => {

            const card =
                document.createElement("div");

            card.className =
                "pictogram-card";

            const img =
                document.createElement("img");

            img.src =
                pictogram.src;

            const name =
                document.createElement("span");

            name.textContent =
                pictogram.name;

            card.appendChild(img);

            card.appendChild(name);


            card.addEventListener(
                "click",
                () => {

                    if (
                        !editingChecklistWidget
                    ) return;

                    /*
                     * Put the pictogram on the
                     * most recently selected item.
                     */

                    const items =
                        editingChecklistWidget.items;

                    if (!items.length) {

                        return;

                    }

                    let item =
                        items[items.length - 1];

                    item.pictogram =
                        pictogram.src;

                    item.pictogramId =
                        pictogram.id;

                    renderChecklistEditor();

                }
            );

            bank.appendChild(card);

        }
    );

}


/* ============================================================
   NOISE METER
============================================================ */

function addNoiseWidget() {

    const widget =
        createWidget(
            "noise",
            150,
            100,
            450,
            220
        );

    widget.active =
        false;

    saveData();

    renderCurrentScreen();

}


function renderNoiseWidget(
    content,
    widgetData
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "noise-widget";


    const level =
        document.createElement("div");

    level.className =
        "noise-level";


    const bar =
        document.createElement("div");

    bar.className =
        "noise-bar";


    level.appendChild(bar);


    const label =
        document.createElement("div");

    label.className =
        "noise-label";

    label.textContent =
        "Microphone off";


    const button =
        document.createElement("button");

    button.className =
        "noise-start";

    button.textContent =
        "Start microphone";


    button.addEventListener(
        "click",
        async event => {

            event.stopPropagation();

            if (
                widgetData.active
            ) {

                stopNoiseMeter();

                widgetData.active =
                    false;

                button.textContent =
                    "Start microphone";

                label.textContent =
                    "Microphone off";

                return;

            }

            try {

                await startNoiseMeter(
                    bar,
                    label,
                    widgetData,
                    button
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Microphone access was not allowed. Please allow microphone access in your browser."
                );

            }

        }
    );


    wrapper.appendChild(level);

    wrapper.appendChild(label);

    wrapper.appendChild(button);

    content.appendChild(wrapper);

}


let audioContext = null;
let analyser = null;
let microphoneStream = null;


async function startNoiseMeter(
    bar,
    label,
    widgetData,
    button
) {

    microphoneStream =
        await navigator.mediaDevices
            .getUserMedia({
                audio: true
            });

    audioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    analyser =
        audioContext.createAnalyser();

    analyser.fftSize =
        256;

    const source =
        audioContext.createMediaStreamSource(
            microphoneStream
        );

    source.connect(analyser);

    const dataArray =
        new Uint8Array(
            analyser.frequencyBinCount
        );

    widgetData.active =
        true;

    button.textContent =
        "Stop microphone";


    function measure() {

        if (
            !widgetData.active ||
            !analyser
        ) return;

        analyser.getByteTimeDomainData(
            dataArray
        );

        let sum = 0;

        for (
            let i = 0;
            i < dataArray.length;
            i++
        ) {

            const normalized =
                (dataArray[i] - 128) /
                128;

            sum +=
                normalized *
                normalized;

        }

        const rms =
            Math.sqrt(
                sum /
                dataArray.length
            );

        /*
         * This is a relative classroom noise
         * meter rather than a calibrated dB meter.
         */

        let percentage =
            Math.min(
                100,
                rms * 500
            );

        percentage =
            Math.max(
                0,
                percentage
            );

        bar.style.width =
            `${percentage}%`;


        if (
            percentage < 30
        ) {

            bar.style.background =
                "#22c55e";

            label.textContent =
                "🤫 Quiet";

        } else if (
            percentage < 65
        ) {

            bar.style.background =
                "#eab308";

            label.textContent =
                "🙂 Moderate";

        } else {

            bar.style.background =
                "#ef4444";

            label.textContent =
                "🔊 Loud";

        }

        noiseAnimationFrame =
            requestAnimationFrame(
                measure
            );

    }

    measure();

}


function stopNoiseMeter() {

    if (
        noiseAnimationFrame
    ) {

        cancelAnimationFrame(
            noiseAnimationFrame
        );

        noiseAnimationFrame =
            null;

    }

    if (
        microphoneStream
    ) {

        microphoneStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        microphoneStream = null;

    }

    if (
        audioContext
    ) {

        audioContext.close();

        audioContext = null;

    }

    analyser = null;

}

/* ============================================================
   IFRAME / EMBED WIDGET
============================================================ */

function addIframeWidget() {

    const url = prompt(
        "Paste the URL to embed:"
    );

    if (!url) return;

    const widget =
        createWidget(
            "iframe",
            120,
            100,
            600,
            400
        );

    widget.url =
        url.trim();

    saveData();

    renderCurrentScreen();

}


function renderIframeWidget(
    content,
    widgetData
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "iframe-widget";


    const iframe =
        document.createElement("iframe");

    iframe.src =
        widgetData.url;

    iframe.title =
        "Embedded content";

    iframe.setAttribute(
        "allowfullscreen",
        ""
    );

    iframe.setAttribute(
        "allow",
        "fullscreen; autoplay; clipboard-write; encrypted-media"
    );

    iframe.loading =
        "lazy";


    wrapper.appendChild(
        iframe
    );

    content.appendChild(
        wrapper
    );

}


/* ============================================================
   WIDGET RENDERING
============================================================ */

function renderWidget(
    widgetData
) {

    const widget =
        document.createElement("div");

    widget.className =
        "widget";

    widget.dataset.widgetId =
        widgetData.id;

    widget.style.left =
        `${widgetData.x}px`;

    widget.style.top =
        `${widgetData.y}px`;

    widget.style.width =
        `${widgetData.width}px`;

    widget.style.height =
        `${widgetData.height}px`;

    widget.style.zIndex =
        widgetData.zIndex || ++zCounter;


    const header =
        document.createElement("div");

    header.className =
        "widget-header";


    const title =
        document.createElement("div");

    title.className =
        "widget-title";

    title.textContent =
        getWidgetTitle(
            widgetData.type
        );


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "widget-delete";

    deleteButton.textContent =
        "×";

    deleteButton.title =
        "Delete widget";


    deleteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            deleteWidget(
                widgetData.id
            );

        }
    );


    header.appendChild(title);

    header.appendChild(deleteButton);

    widget.appendChild(header);


    const content =
        document.createElement("div");

    content.className =
        "widget-content";


    switch (
        widgetData.type
    ) {

        case "text":

            renderTextWidget(
                content,
                widgetData
            );

            break;


        case "timer":

            renderTimerWidget(
                content,
                widgetData
            );

            break;


        case "image":

            renderImageWidget(
                content,
                widgetData
            );

            break;


        case "checklist":

            renderChecklistWidget(
                content,
                widgetData
            );

            break;


        case "noise":

            renderNoiseWidget(
                content,
                widgetData
            );

            break;
        case "iframe":

            renderIframeWidget(
                content,
                widgetData
            );

            break;


    }


    widget.appendChild(content);


    const resizeHandle =
        document.createElement("div");

    resizeHandle.className =
        "resize-handle";

    widget.appendChild(
        resizeHandle
    );


    setupWidgetInteractions(
        widget,
        widgetData,
        header,
        resizeHandle
    );


    screenCanvas.appendChild(
        widget
    );

}


function getWidgetTitle(type) {

    const titles = {

        text: "📝 ",

        timer: "⏱ ",

        image: "🖼 ",

        checklist: "☑ ",

        noise: "🎤 ",
        iframe:"🌐"

    };

    return (
        titles[type] ||
        "Widget"
    );

}


/* ============================================================
   DRAG + RESIZE
============================================================ */

function setupWidgetInteractions(
    element,
    widgetData,
    header,
    resizeHandle
) {

    element.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.closest(
                    "button,input,select"
                )
            ) return;

            selectWidget(
                element
            );

            bringToFront(
                element,
                widgetData
            );

        }
    );


    header.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.closest("button")
            ) return;

            event.preventDefault();

            selectWidget(
                element
            );

            const rect =
                element.getBoundingClientRect();

            dragState = {

                element,

                widgetData,

                startX:
                    event.clientX,

                startY:
                    event.clientY,

                originalX:
                    widgetData.x,

                originalY:
                    widgetData.y,

                canvasWidth:
                    screenCanvas.clientWidth,

                canvasHeight:
                    screenCanvas.clientHeight

            };

            header.setPointerCapture(
                event.pointerId
            );

        }
    );


    header.addEventListener(
        "pointermove",
        event => {

            if (
                !dragState ||
                dragState.element !== element
            ) return;

            const dx =
                event.clientX -
                dragState.startX;

            const dy =
                event.clientY -
                dragState.startY;

            widgetData.x =
                clamp(
                    dragState.originalX + dx,
                    0,
                    Math.max(
                        0,
                        screenCanvas.clientWidth -
                        widgetData.width
                    )
                );

            widgetData.y =
                clamp(
                    dragState.originalY + dy,
                    0,
                    Math.max(
                        0,
                        screenCanvas.clientHeight -
                        widgetData.height
                    )
                );

            element.style.left =
                `${widgetData.x}px`;

            element.style.top =
                `${widgetData.y}px`;

        }
    );


    header.addEventListener(
        "pointerup",
        () => {

            if (!dragState) return;

            saveData();

            dragState = null;

        }
    );


    /* RESIZE */

    resizeHandle.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            event.stopPropagation();

            selectWidget(
                element
            );

            resizeState = {

                element,

                widgetData,

                startX:
                    event.clientX,

                startY:
                    event.clientY,

                originalWidth:
                    widgetData.width,

                originalHeight:
                    widgetData.height

            };

            resizeHandle.setPointerCapture(
                event.pointerId
            );

        }
    );


    resizeHandle.addEventListener(
        "pointermove",
        event => {

            if (
                !resizeState ||
                resizeState.element !== element
            ) return;

            const dx =
                event.clientX -
                resizeState.startX;

            const dy =
                event.clientY -
                resizeState.startY;

            widgetData.width =
                Math.max(
                    120,
                    resizeState.originalWidth +
                    dx
                );

            widgetData.height =
                Math.max(
                    80,
                    resizeState.originalHeight +
                    dy
                );

            widgetData.width =
                Math.min(
                    widgetData.width,
                    screenCanvas.clientWidth -
                    widgetData.x
                );

            widgetData.height =
                Math.min(
                    widgetData.height,
                    screenCanvas.clientHeight -
                    widgetData.y
                );

            element.style.width =
                `${widgetData.width}px`;

            element.style.height =
                `${widgetData.height}px`;

        }
    );


    resizeHandle.addEventListener(
        "pointerup",
        () => {

            saveData();

            resizeState = null;

        }
    );

}


/* ============================================================
   SELECT WIDGET
============================================================ */

function selectWidget(
    element
) {

    if (!element) return;

    document
        .querySelectorAll(".widget")
        .forEach(
            widget => {

                widget.classList.remove(
                    "selected"
                );

            }
        );

    element.classList.add(
        "selected"
    );

    selectedWidget =
        element;

    const data =
        getWidgetData(
            element.dataset.widgetId
        );

    if (
        data &&
        data.type === "text"
    ) {

        textToolbar.classList.remove(
            "hidden"
        );

    } else {

        textToolbar.classList.add(
            "hidden"
        );

    }

}


function bringToFront(
    element,
    widgetData
) {

    widgetData.zIndex =
        ++zCounter;

    element.style.zIndex =
        widgetData.zIndex;

    saveData();

}


/* ============================================================
   FIND WIDGET DATA
============================================================ */

function getWidgetData(
    id
) {

    return currentScreen()
        .widgets
        .find(
            widget =>
                widget.id === id
        );

}


/* ============================================================
   DELETE WIDGET
============================================================ */

function deleteWidget(id) {

    const screen =
        currentScreen();

    screen.widgets =
        screen.widgets.filter(
            widget =>
                widget.id !== id
        );

    saveData();

    renderCurrentScreen();

}


/* ============================================================
   MODAL
============================================================ */

function closeModal() {

    modalOverlay.classList.add(
        "hidden"
    );

    editingChecklistWidget =
        null;

}


/* ============================================================
   CLICK OUTSIDE WIDGET
============================================================ */

screenCanvas.addEventListener(
    "pointerdown",
    event => {

        if (
            event.target === screenCanvas
        ) {

            document
                .querySelectorAll(".widget")
                .forEach(
                    widget =>
                        widget.classList.remove(
                            "selected"
                        )
                );

            selectedWidget = null;

            textToolbar.classList.add(
                "hidden"
            );

        }

    }
);


/* ============================================================
   SAVE BEFORE LEAVING
============================================================ */

window.addEventListener(
    "beforeunload",
    () => {

        saveData();

    }
);
