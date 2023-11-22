
const apiUrl = "192.168.178.20:3000/api"
const options = {
  "headers": {
    "Access-Control-Allow-Origin" : true
  }
}


document.getElementById("butt").addEventListener("click", () => {
  
  
  
    var xhttp = new XMLHttpRequest();
    
    
    xhttp.onreadystatechange = (err) => {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        document.getElementById("demo").innerHTML = xhttp.responseText;
        console.log("here")
      }
    };
  
    //get request to api, returns array with the names with iterable objects inside
    xhttp.open("GET", "http://192.168.178.20:3000/api", true)
    xhttp.send()
  })
  