const { networkInterfaces } = require("os")
const express = require("express")
const app = express()
var bodyParser = require("body-parser")

const sqlite3 = require("sqlite3").verbose()

// https://peter.sh/experiments/chromium-command-line-switches/#start-fullscreen
// all of these should also apply to firefox
async function dynamicImportOpen(string) {
    const open = await import("open")
    // --kiosk to only enable barebones browser, --start-fullscreen is self explanatory
    // --display=:0.0 to make it play nice with ssh, vncViewer and external screen via hdmi
    // NOTE: --display=:0.0 only works on linux (tested on rpi only tho), remove if on windows
    open.default(string, {app: {name: "firefox", arguments: [
        "--kiosk", "--start-fullscreen", "--display=:0.0"
    ]}})
    //open.default calls the open() function
}


const port = 3000

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const router = express.Router()

function getIPofServer() {
    //if it returns null, it will just run on localhost for now
    var ipv4Adress = null
    
    let nonLocalInterfaces = {}
    for (let inet in networkInterfaces()) {
        let adresses = networkInterfaces()[inet]
        for (let i = 0; i < adresses.length; i++) {
            let adress = adresses[i]
            if (!adress.internal) {
                if (!nonLocalInterfaces[inet]) {
                    nonLocalInterfaces[inet] = []
                }
                nonLocalInterfaces[inet].push(adress)
            }
        }
    }
    
    var ethernet = null
    try {
        if (nonLocalInterfaces.Ethernet != null) {
            ethernet = nonLocalInterfaces.Ethernet
        } else if (nonLocalInterfaces.lo != null) {
            ethernet = nonLocalInterfaces.lo
        }
    } catch {
        ethernet = null
    }
    if (ethernet != null) {
        for (let i = 0; i < ethernet.length; i++) {
            let EthObject = ethernet[i]
            
            if (Object.values(EthObject).includes("IPv4")) {
                ipv4Adress = EthObject.address
                // console.log(ipv4Adress)
                return ipv4Adress
            }
        }
    }
    
    var wifi = null
    try {
        //check windows (WiFi)
        if (nonLocalInterfaces.WiFi != null) {
            wifi = nonLocalInterfaces.WiFi
        } else if (nonLocalInterfaces.wlan0 != null) {
            wifi = nonLocalInterfaces.wlan0
        }
    } catch  {
        wifi = null
    }
    if (wifi != null) {
        for (let i = 0; i < wifi.length; i++) {
            
            let wifiObject = wifi[i]
            if (Object.values(wifiObject).includes("IPv4")) {
                ipv4Adress = wifiObject.address
                // console.log(ipv4Adress)
                return ipv4Adress
            }
        }
    }
    // console.log(nonLocalInterfaces)
    return ipv4Adress
}



//creates if nonexist, else opens for use using db.serialize
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.log(err)

    console.log("connected to database")
})


function insertNewValuesDB(insertArray) {
    db.serialize( () => {
        
        db.run("CREATE TABLE IF NOT EXISTS namelist (name TEXT)")
        
        //insert values from the recieved array
        for (let i of insertArray) {
            db.run(`INSERT INTO namelist VALUES ('${i}')`)
        }
        // db.all("SELECT rowid, * FROM namelist", (err, row) => {
        //     console.log(row)
        // })


        //ignore duplicates users fault    
    })

}

function deleteValuesDB(insertArray) {
    db.serialize( () => {
        //might need to change this to delete using rowid so that user doesn't delete multiple with same name
        //it now deletes by rowid, where an array with all the id's are passed into

        //https://stackoverflow.com/a/10554764

        // this is stupid as fuck but i am stupidier
        db.run(`CREATE TEMPORARY TABLE temp AS SELECT * FROM namelist`)    
        db.run("DELETE FROM namelist")
        db.run("INSERT INTO namelist SELECT * FROM temp")
        db.run("DROP TABLE temp")

        for (let i of insertArray) {
            console.log(i)

            // db.run("UPDATE namelist SET rowid = (SELECT COUNT(*) from namelist) WHERE rowid != 1")
            db.run(`DELETE FROM namelist WHERE rowid = '${i}'`)
            
        }
        db.run(`CREATE TEMPORARY TABLE temp AS SELECT * FROM namelist`)    
        db.run("DELETE FROM namelist")
        db.run("INSERT INTO namelist SELECT * FROM temp")
        db.run("DROP TABLE temp")

        // db.all("SELECT * FROM namelist", (err, row) => {
        //     console.log(row)
        // })

        //use this in the final implimentation        

    })

}

// const requestValuesDB = db.serialize( () => {
//     var t = []
//     db.all("SELECT rowid, * FROM namelist", (err, rows) => {
//         //returns array, each entry is a single entry of the db as an
//         t = rows
//         console.log(rows)
//     })
//     return t
// })

function requestValuesDB() {
    let returnValue;
    db.serialize( () => {
        db.all("SELECT * FROM namelist", (err, rows) => {
            //returns array, each entry is a single entry of the db as an
            console.log("hi",rows)
            returnValue = rows
        })
    })
    return returnValue;
}



router.post("/", (req, res, next) => {
    console.log(req.body)


    //check if recieved content can be used -- do later

    // if (!req.body.names) {
    //     res.json({
    //         valid: false,
    //         message: "names array missing"
    //     })
    //     return;
    // };

    // if (!req.body.names.length > 0){
    //     res.json({
    //         valid: false,
    //         message: "array is empty"
    //     })
    //     return;
    // }

    if (req.body.action === "delete") {
        deleteValuesDB(req.body.names)

    }
    
    if(req.body.action === "add"){
        insertNewValuesDB(req.body.names)

    }
    
    //this has to get the new list from database

    db.serialize( () => {
        db.all("SELECT rowid, * FROM namelist", (err, rows) => {
            //console.log(rows)
            res.send(rows);
        })
    })
    // res.json({
    //     valid: true,
    //     message: req.body.action
    // })




})


//use [ipadress]:[port]/api to access api which can be configured with router
app.use("/api", router)

//use [ipadress]:[port]/web to serve webpage inside /web dir
app.use("/web", express.static(__dirname + "/web"))
//when sending get request from there it gets sent to router.get (see below)

router.get("/", (req, res) => {
    // in here send json with all names to be displayed

    db.serialize( () => {
        db.all("SELECT rowid, * FROM namelist", (err, rows) => {
            //returns array, each entry is a single entry of the db as an
            console.log(rows)
            
            res.send(rows)
        })
    })



})




app.get("/", (req, res) => {
    //this to get website inside /web
    res.json( {
        online: true
    })
    
})



const ip = getIPofServer()
// console.log(ip)
//by  adding ip adress eg 192.168.178.40 for rpi makes it public on local network -- app.listen(Port Number, "Your IP Address");
app.listen(port, ip, () => {
    console.log(`listening on ${ip}:${port}`)
    //require("child_process").exec(`open http://${ip}:${port}/web`)
    dynamicImportOpen(`http://${ip}:${port}/web`)
})


