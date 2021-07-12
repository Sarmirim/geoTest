import axios from 'axios'
import fs from 'fs'

const array = fs.readFileSync('cities.txt').toString().split("\n");
for(const i in array) {
    console.log(array[i])
}

fs.mkdirSync('./cities', { recursive: true })

let osm_id = []

const reqOptions = {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
}

const getRequest = (link) => {
    return new Promise((resolve, reject) => {
        axios.get(link, reqOptions)
        .then(response =>{
            resolve(response.data)
        }).catch(error=> reject(error))
    })
}

let promiseArray = []

array.forEach((value, index) => {
    let prom = getRequest(`https://nominatim.openstreetmap.org/search/${encodeURIComponent(value)}?format=json&addressdetails=1&limit=1`)
    .then(answer => {
        osm_id[index] = {city: value, id: answer[0].osm_id}
        console.log(osm_id[index])
    }).catch(error => console.log(error))

    promiseArray.push(prom)
})

Promise.all(promiseArray).then(() => {
    console.log("Osm_id step is complete")
    console.log(osm_id)
    osm_id.forEach((value) => {
        const {city, id} = value
        getRequest(`http://polygons.openstreetmap.fr/get_geojson.py?id=${id}`)
        .then(answer => {
            fs.promises.writeFile(`./cities/${city}.json`, JSON.stringify(answer), 'utf8', function(err) {
                if (err) {
                    console.log(err)
                }
            })
        }).catch(error => console.log(error))
    })
})