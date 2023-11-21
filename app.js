const express = require("express")
const app = express()
var bodyParser = require("body-parser")
const e = require("express")

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
db.serialize( () => {
    db.run("CREATE TABLE IF NOT EXISTS namelist (id INT, name TEXT)")

    db.run("INSERT INTO namelist VALUES (1, 'tim')")
    db.run("INSERT INTO namelist VALUES (2, 'bob')")
    db.run("INSERT INTO namelist VALUES (3, 'bob')")

    // var insert = `INSERT INTO namelist VALUES (${i}, '${name}')`
    
    // for (let i = 0; i < 10; i++) {
    //     db.run(`INSERT INTO namelist VALUES (${i}, 'tim')`)
    // }

})


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


function updateArray(newData) {

    var stored_array = ["tim", "toby", "peter"]
    console.log(stored_array)
    //all names that aren't in the duplicates get put in here
   
    

    //this doesn't work, next time just make all in stored_array lowercase & 
    //do same for all newData -> then just concat()

    for (let i = 0; i < newData.length; i++) {
        let newString = newData[i]

        for (let o = 0; o < stored_array.length; o++) {
            let oldString = stored_array[o]

            if (newString.toLowerCase() === oldString.toLowerCase()) {
                //if name already displayed, return error message
                console.log(oldString, newString)
                break
            }   
            
            console.log(newString + " to add")
        }

    }
    console.log(stored_array)

    // console.log(tempArray)
    // stored_array = stored_array.concat(newData)

    // console.log(stored_array)

}



router.get("/", (req, res) => {

})

router.post("/", (req, res) => {
    console.log(req.body)


    if (!req.body.names) {
        res.json({
            valid: false,
            message: "names array missing"
        })
        return;
    };

    if (!req.body.names.length > 0){
        res.json({
            valid: false,
            message: "array is empty"
        })
        return;
    }

    
    res.json({
        valid: true,
        message: `${req.body.names}`
    })
    
    //update database
    // updateDB(db, req.body.names)
    //add function here to load new data into webpage
    updateArray(req.body.names)
})

app.use("/api", router)

app.get("/", (req, res) => [
    res.send("wazaap")
])
//by  adding ip adress eg 192.168.178.40 for rpi makes it public on local network -- app.listen(Port Number, "Your IP Address");

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})