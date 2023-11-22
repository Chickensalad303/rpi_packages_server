const express = require("express")
const app = express()
var bodyParser = require("body-parser")

const sqlite3 = require("sqlite3").verbose()


const port = 3000

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const router = express.Router()



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
        db.all("SELECT rowid, * FROM namelist", (err, row) => {
            console.log(row)
        })


        //ignore duplicates users fault    
    })

}

function deleteValuesDB(insertArray) {
    db.serialize( () => {
        //might need to change this to delete using rowid so that user doesn't delete multiple with same name
        for (let i of insertArray) {

            db.run(`DELETE FROM namelist WHERE name = '${i}'`)
        }

        db.all("SELECT rowid, * FROM namelist", (err, row) => {
            console.log(row)
        })

        //use this in the final implimentation        

    })

}

// const requestValuesDB = db.serialize( () => {
//     var t = []
//     db.all("SELECT * FROM namelist", (err, rows) => {
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

function updateDB(database_instance, nameArray) {
    database_instance.serialize( () => {
        database_instance.get("SELECT MAX(id) as id, name FROM namelist", (err, row) => {
            console.log(row.id + ": " + row.name)
            
            for (let i = 0; i < nameArray.length; i++){
                let currentName = nameArray[i];
                var currentId = row.id + i;
                console.log(currentId, currentName)
                // database_instance.run(`INSERT INTO namelist VALUES (${}`)
                
            }
        })


        //gets name with highest id aka the name that was addet latest 
       
    })
}


function removeDuplicates(newData) {

    var stored_array = ["tim", "toby", "peter"]
    //make every value in stored_array lowercase... as a safeguard for me forgetting to store them as lowercase only
    stored_array.forEach( (element, index) => {
        stored_array[index] = element.toLowerCase()
    })


    console.log(stored_array)

    
    //all new names in lowercase go in here
    var tempArray = []
    tempArray = tempArray.concat(newData)

    
    const mergedArray = stored_array.concat(tempArray)
    const result = mergedArray.filter( (item, idx) => {
        
        let stringToCompare = item.toLowerCase()
        if (mergedArray.indexOf(stringToCompare) === idx) {
            return item
        }
    })


    console.log(result)


}



const logger = function (req, res, next) {
    console.log(req.method.toLowerCase())

    if (req.method.toLowerCase() === "get") {
        
            const options = {
                method: 'POST',
                body: '{"names":["hi","tiM","tom","toby"],"device":"test"}'
              };
              
              fetch('http://192.168.178.20:3000/api', options)
                // .then(response => response.json())
                // .then(response => console.log(response))
                .catch(err => console.error(err));
        
                
            //this gets sent to webpage @localhost:3000/api which teh screen will display after any request sent to /api
            // but we only want to respond in this function if its a get request, in order to display on webpage
            //this gets skipped if its a post request & continues @ router.post
            res.send('hi')


    }


    next()
}
// router.use(logger)



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
        deleteValuesDB(req.body.delete)

    }
    
    if(req.body.action === "add"){
        insertNewValuesDB(req.body.names)

    }
    
    res.json({
        valid: true,
        message: `${req.body.names} : ${req.body.delete} \n ${req.body.action}`
    })




})


//use [ipadress]:[port]/api to access api which can be configured with router
app.use("/api", router)

//use [ipadress]:[port]/web to serve webpage inside /web dir
app.use("/web", express.static(__dirname + "/web"))
//when sending get request from there it gets sent to router.get (see below)

router.get("/", (req, res) => {
    // in here send json with all names to be displayed

    db.serialize( () => {
        db.all("SELECT * FROM namelist", (err, rows) => {
            //returns array, each entry is a single entry of the db as an
            console.log(rows)
            
            res.send(rows)
        })
    })



})




app.get("/", (req, res) => {
    //this to get website inside /web
    res.send("nothing here")
    
})



//by  adding ip adress eg 192.168.178.40 for rpi makes it public on local network -- app.listen(Port Number, "Your IP Address");

app.listen(port, "192.168.178.20", () => {
    console.log(`listening on port ${port}`)
})


