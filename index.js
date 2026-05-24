const grid =
    document.getElementById("grid");

const colorPicker =
    document.getElementById("color-picker");

const eraseButton =
    document.getElementById("erase-button");

const clearButton =
    document.getElementById("clear-button");

const brushSize =
    document.getElementById("brush-size");

const infoCount =
    document.getElementById("info-count");

const infoRow =
    document.getElementById("info-row");

const infoCol =
    document.getElementById("info-col");

const statusText =
    document.getElementById("status");



let currentColor = "#000000";

let eraseMode = false;

let isDrawing = false;

let debounceTimeout;



// AUTO SAVE (DEBOUNCE)


function autoSave(){

    statusText.textContent =
        "Auto zapis...";

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {

        const state =
            getGridState();

        localStorage.setItem(
            "pixel-art-state",
            JSON.stringify(state)
        );

        statusText.textContent =
            "Auto zapisano";

    }, 1000);

}




// TWORZENIE SIATKI


for(let i = 0; i < 16; i++){

    for(let j = 0; j < 16; j++){

        const cell =
            document.createElement("div");

        cell.classList.add("cell");

        cell.dataset.row = i;

        cell.dataset.col = j;

        grid.appendChild(cell);
    }
}




// LICZENIE POKOLOROWANYCH PÓL


function updatePaintedCount(){

    const cells =
        document.querySelectorAll(".cell");

    let count = 0;

    cells.forEach((cell) => {

        const color =
            getComputedStyle(cell)
                .backgroundColor;

        if(
            color !==
            "rgb(255, 255, 255)"
        ){

            count++;
        }
    });

    infoCount.textContent = count;
}




// KOLOROWANIE


function colorCell(cell){

    if(!cell) return;

    if(eraseMode){

        cell.style.backgroundColor =
            "white";

    }else{

        cell.style.backgroundColor =
            currentColor;
    }

    updatePaintedCount();

    autoSave();
}




// PĘDZEL


function paintBrush(row, col){

    const size =
        parseInt(brushSize.value);

    for(let i = 0; i < size; i++){

        for(let j = 0; j < size; j++){

            const targetCell =
                document.querySelector(
                    `.cell[data-row="${row+i}"][data-col="${col+j}"]`
                );

            colorCell(targetCell);
        }
    }
}




// DELEGACJA ZDARZEŃ


grid.addEventListener(
    "mousedown",
    (e) => {

        if(
            !e.target.classList.contains("cell")
        ) return;

        isDrawing = true;

        const row =
            Number(e.target.dataset.row);

        const col =
            Number(e.target.dataset.col);

        infoRow.textContent =
            `Row: ${row}`;

        infoCol.textContent =
            `Col: ${col}`;

        paintBrush(row, col);
    }
);



grid.addEventListener(
    "mouseover",
    (e) => {

        if(!isDrawing) return;

        if(
            !e.target.classList.contains("cell")
        ) return;

        const row =
            Number(e.target.dataset.row);

        const col =
            Number(e.target.dataset.col);

        paintBrush(row, col);
    }
);



document.addEventListener(
    "mouseup",
    () => {

        isDrawing = false;
    }
);




// COLOR PICKER


colorPicker.addEventListener(
    "input",
    (e) => {

        currentColor =
            e.target.value;

        eraseMode = false;
    }
);




// GUMKA


eraseButton.addEventListener(
    "click",
    () => {

        eraseMode = !eraseMode;
    }
);




// WYCZYŚĆ


clearButton.addEventListener(
    "click",
    () => {

        const cells =
            document.querySelectorAll(".cell");

        cells.forEach((cell) => {

            cell.style.backgroundColor =
                "white";
        });

        updatePaintedCount();

        autoSave();
    }
);




// SKRÓTY KLAWIATUROWE


document.addEventListener(
    "keydown",
    (e) => {

        if(e.key === "c"){

            clearButton.click();
        }

        if(e.key === "e"){

            eraseMode = !eraseMode;
        }

        if(e.key === "1"){

            brushSize.value = "1";
        }

        if(e.key === "2"){

            brushSize.value = "2";
        }

        if(e.key === "3"){

            brushSize.value = "3";
        }
    }
);




// POBRANIE STANU SIATKI


function getGridState(){

    const cells =
        document.querySelectorAll(".cell");

    const state = [];

    cells.forEach((cell) => {

        state.push(
            getComputedStyle(cell)
                .backgroundColor
        );
    });

    return state;
}




// POBIERANIE PALET


async function loadPalette(id){

    try{

        statusText.textContent =
            "Ładowanie palety...";

        const response =
            await fetch(
                `http://localhost:1080/palety/${id}`
            );

        if(!response.ok){

            throw new Error(
                "Błąd HTTP"
            );
        }

        const paleta =
            await response.json();

        console.log(paleta);

        const container =
            document.getElementById(
                "palette-container"
            );

        container.innerHTML = "";



        // TWORZENIE KOLORÓW

        paleta.colors.forEach((color) => {

            const colorBox =
                document.createElement("div");

            colorBox.classList.add(
                "palette-color"
            );

            colorBox.style.backgroundColor =
                color;



            // WYBÓR KOLORU

            colorBox.addEventListener(
                "click",
                () => {

                    currentColor =
                        color;

                    eraseMode = false;

                    colorPicker.value =
                        color;
                }
            );

            container.appendChild(
                colorBox
            );
        });

        statusText.textContent =
            `Załadowano ${paleta.name}`;
    }

    catch(error){

        statusText.textContent =
            "Błąd pobierania palety";

        console.log(error);
    }
}




// PRZYCISKI PALET


document.getElementById("paleta1")
    .addEventListener(
        "click",
        () => {

            loadPalette(1);
        }
    );


document.getElementById("paleta2")
    .addEventListener(
        "click",
        () => {

            loadPalette(2);
        }
    );


document.getElementById("paleta3")
    .addEventListener(
        "click",
        () => {

            loadPalette(3);
        }
    );




// ZAPIS


async function saveGrid(){

    const gridState =
        getGridState();

    localStorage.setItem(
        "pixel-art-state",
        JSON.stringify(gridState)
    );

    try{

        const response =
            await fetch(
                "https://jsonplaceholder.typicode.com/posts",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        grid: gridState
                    })
                }
            );

        if(!response.ok){

            throw new Error(
                "Błąd zapisu"
            );
        }

        await response.json();

        statusText.textContent =
            "Zapisano";
    }

    catch(error){

        statusText.textContent =
            "Błąd zapisu";

        console.log(error);
    }
}




// WCZYTYWANIE


function loadGrid(){

    fetch(
        "https://jsonplaceholder.typicode.com/posts/1"
    )

        .then((response) => {

            if(!response.ok){

                throw new Error(
                    "Błąd HTTP"
                );
            }

            return response.json();
        })

        .then(() => {

            const savedState =
                JSON.parse(
                    localStorage.getItem(
                        "pixel-art-state"
                    )
                );

            if(!savedState) return;

            const cells =
                document.querySelectorAll(".cell");

            cells.forEach((cell, index) => {

                cell.style.backgroundColor =
                    savedState[index];
            });

            updatePaintedCount();

            statusText.textContent =
                "Wczytano";
        })

        .catch((error) => {

            statusText.textContent =
                "Błąd wczytywania";

            console.log(error);
        });
}




// PRZYCISKI SAVE / LOAD


document.getElementById("save-button")
    .addEventListener(
        "click",
        saveGrid
    );


document.getElementById("load-button")
    .addEventListener(
        "click",
        loadGrid
    );




// ŁADOWANIE RÓWNOLEGŁE


async function loadParallel(id){

    const start =
        performance.now();

    await Promise.all([

        loadPalette(1),
        loadPalette(2),
        loadPalette(3)

    ]);

    const end =
        performance.now();

    alert(
        `Równoległe:
${Math.round(end-start)} ms`
    );
}




// ŁADOWANIE SEKWENCYJNE


async function loadSequential(){

    const start =
        performance.now();

    await loadPalette(1);

    await loadPalette(2);

    await loadPalette(3);

    const end =
        performance.now();

    alert(
        `Sekwencyjne:
${Math.round(end-start)} ms`
    );
}




// BUTTONY ŁADOWANIA


document.getElementById(
    "parallel-button"
)

    .addEventListener(
        "click",
        loadParallel
    );



document.getElementById(
    "sequential-button"
)

    .addEventListener(
        "click",
        loadSequential
    );