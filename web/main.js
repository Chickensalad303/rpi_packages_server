
// const options = {
  //   "headers": {
    //     "Access-Control-Allow-Origin" : true
    //   }
    // }



const apiUrl = `${window.location.origin}/api`
console.log(apiUrl)



function removeOld() {
  var elements = document.getElementsByClassName("dynamicList")
  Array.from(elements).forEach((element) => {
    element.remove()
  })

}


function createList(array) {
  removeOld()
  for (let i = 0; i < array.length; i++) {
    var current = array[i]
    
    const para = document.createElement("p")
    const node = document.createTextNode(current)
    para.className = "dynamicList"
    para.appendChild(node)
    
    const element = document.getElementById("list")
    element.appendChild(para)
  }
}

function getData() {
  var xhttp = new XMLHttpRequest();
  //get request to api, returns array with the names with iterable objects inside
  xhttp.open("GET", apiUrl, true)
  xhttp.send()
  
  
  xhttp.onreadystatechange = (err) => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var response = JSON.parse(xhttp.responseText)

  
      var nameList = []
      for (let i = 0; i < response.length; i++) {
        var currentName = response[i].name
        nameList.push(currentName)
      }
      createList(nameList)
  
    } else {
      console.log(err)
    }
  };
  

}

// document.getElementById("butt").addEventListener("click", () => {
  
//   getData()
// })

setInterval(() => {
  getData()
  console.log("hiii")
}, 2000)
  