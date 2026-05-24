const http =
    require("http");

const fs =
    require("fs");

const path =
    require("path");

const PORT = 1080;




// FUNKCJE POMOCNICZE




function sendJSON(res, status, data){

    res.writeHead(status, {

        "Content-Type":
            "application/json",

        "Access-Control-Allow-Origin":
            "*",

        "Access-Control-Allow-Methods":
            "GET, POST, DELETE, OPTIONS",

        "Access-Control-Allow-Headers":
            "Content-Type"
    });

    res.end(
        JSON.stringify(data)
    );
}



function logRequest(
    method,
    url,
    status,
    start
){

    const time =
        Date.now() - start;

    console.log(
        `${method} ${url} ${status} ${time}ms`
    );
}



function readObrazki(){

    const filePath =
        path.join(
            __dirname,
            "obrazki",
            "obrazki.json"
        );

    const data =
        fs.readFileSync(
            filePath,
            "utf-8"
        );

    return JSON.parse(data);
}



function saveObrazki(obrazki){

    const filePath =
        path.join(
            __dirname,
            "obrazki",
            "obrazki.json"
        );

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            obrazki,
            null,
            2
        )
    );
}




// SERVER




const server =
    http.createServer((req, res) => {

        const start =
            Date.now();

        const url =
            new URL(
                req.url,
                `http://${req.headers.host}`
            );

        const pathname =
            url.pathname;




        // CORS


        if(req.method === "OPTIONS"){

            sendJSON(res, 200, {});
            return;
        }




        // GET /palety


        if(
            req.method === "GET" &&
            pathname === "/palety"
        ){

            const palety = [];

            for(let i = 1; i <= 3; i++){

                const filePath =
                    path.join(
                        __dirname,
                        "palety",
                        `paleta${i}.json`
                    );

                const data =
                    fs.readFileSync(
                        filePath,
                        "utf-8"
                    );

                palety.push(
                    JSON.parse(data)
                );
            }

            logRequest(
                req.method,
                pathname,
                200,
                start
            );

            sendJSON(
                res,
                200,
                palety
            );

            return;
        }


        // GET /palety/:id

        if(
            req.method === "GET" &&
            pathname.startsWith("/palety/")
        ){

            const id =
                pathname.split("/")[2];

            const filePath =
                path.join(
                    __dirname,
                    "palety",
                    `paleta${id}.json`
                );

            if(!fs.existsSync(filePath)){

                logRequest(
                    req.method,
                    pathname,
                    404,
                    start
                );

                sendJSON(
                    res,
                    404,
                    {
                        error:
                            "Nie znaleziono palety"
                    }
                );

                return;
            }

            const data =
                fs.readFileSync(
                    filePath,
                    "utf-8"
                );

            logRequest(
                req.method,
                pathname,
                200,
                start
            );

            sendJSON(
                res,
                200,
                JSON.parse(data)
            );

            return;
        }



        // GET /obrazki

        if(
            req.method === "GET" &&
            pathname === "/obrazki"
        ){

            const obrazki =
                readObrazki();

            logRequest(
                req.method,
                pathname,
                200,
                start
            );

            sendJSON(
                res,
                200,
                obrazki
            );

            return;
        }



        // GET /obrazki/:id

        if(
            req.method === "GET" &&
            pathname.startsWith("/obrazki/")
        ){

            const id =
                Number(
                    pathname.split("/")[2]
                );

            const obrazki =
                readObrazki();

            const obrazek =
                obrazki.find(
                    o => o.id === id
                );

            if(!obrazek){

                logRequest(
                    req.method,
                    pathname,
                    404,
                    start
                );

                sendJSON(
                    res,
                    404,
                    {
                        error:
                            "Nie znaleziono obrazka"
                    }
                );

                return;
            }

            logRequest(
                req.method,
                pathname,
                200,
                start
            );

            sendJSON(
                res,
                200,
                obrazek
            );

            return;
        }




        // POST /obrazki


        if(
            req.method === "POST" &&
            pathname === "/obrazki"
        ){

            let body = "";

            req.on(
                "data",
                chunk => {

                    body += chunk;
                }
            );

            req.on(
                "end",
                () => {

                    try{

                        const parsed =
                            JSON.parse(body);

                        const obrazki =
                            readObrazki();

                        const nowyObrazek = {

                            id: Date.now(),

                            grid:
                            parsed.grid
                        };

                        obrazki.push(
                            nowyObrazek
                        );

                        saveObrazki(
                            obrazki
                        );

                        logRequest(
                            req.method,
                            pathname,
                            201,
                            start
                        );

                        sendJSON(
                            res,
                            201,
                            nowyObrazek
                        );
                    }

                    catch(error){

                        logRequest(
                            req.method,
                            pathname,
                            400,
                            start
                        );

                        sendJSON(
                            res,
                            400,
                            {
                                error:
                                    "Niepoprawny JSON"
                            }
                        );
                    }
                }
            );

            return;
        }




        // DELETE /obrazki/:id


        if(
            req.method === "DELETE" &&
            pathname.startsWith("/obrazki/")
        ){

            const id =
                Number(
                    pathname.split("/")[2]
                );

            const obrazki =
                readObrazki();

            const noweObrazki =
                obrazki.filter(
                    o => o.id !== id
                );

            saveObrazki(
                noweObrazki
            );

            logRequest(
                req.method,
                pathname,
                200,
                start
            );

            sendJSON(
                res,
                200,
                {
                    message:
                        "Usunięto"
                }
            );

            return;
        }




        // 404


        logRequest(
            req.method,
            pathname,
            404,
            start
        );

        sendJSON(
            res,
            404,
            {
                error:
                    "Nie znaleziono"
            }
        );

    });



server.listen(
    PORT,
    "localhost",
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );
    }
);