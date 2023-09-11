<script setup>
import { generatePerlinNoise } from "perlin-noise";
import {createCanvas} from 'canvas';
import { onMounted, ref } from "vue";
import Lancelotl from "../animon.js"
import tracking from 'tracking'
import RegionDetails from "../region.js"

const message = ref("Mouse over map for biome");
const feature = ref("Click on area for a feature");
class NoiseMap
{
    constructor(dimension)
    {
        this.dimension = dimension;
        this.array = generatePerlinNoise(dimension, dimension, {octaveCount: 8});
    }
    get (x,y)
    {
        return this.array[(y*this.dimension) + x];
    }
}

class Region
{
    constructor(biome, details)
    {
        this.biome = biome;
        this.details = details;
    }
}
let regions = {};

//const canvas = createCanvas(dimension,dimension);
//const ctx = canvas.getContext('2d');

const biomes = 
{
    'WATER': 'rgb(0, 0, 255)',
    'BEACH': 'rgb(102, 161, 255)',
    'SCORCHED': 'rgb(255, 158, 102)',
    'BARE': 'rgb(255, 181, 138)',
    'TUNDRA': 'rgb(207, 228, 230)',
    'SNOW': 'rgb(255, 255, 255)',
    'TEMPERATE_DESERT': 'rgb(229, 230, 207)',
    'SHRUBLAND': 'rgb(212, 230, 207)',
    'TAIGA': 'rgb(180, 222, 166)',
    'GRASSLAND': 'rgb(136, 207, 112)',
    'TEMPERATE_DECIDUOUS_FOREST': 'rgb(90, 201, 52)',
    'TEMPERATE_RAIN_FOREST': 'rgb(54, 196, 6)',
    'SUBTROPICAL_DESERT': 'rgb(221, 224, 162)',
    'TROPICAL_SEASONAL_FOREST': 'rgb(90, 201, 52)',
    'TROPICAL_RAIN_FOREST': 'rgb(54, 196, 6)'
};

const colors = new tracking.ColorTracker();

for(let index = 0; index < Object.keys(biomes).length; index++)
{
    tracking.ColorTracker.registerColor(Object.keys(biomes)[index], (r,g,b) => {
        const colorString = biomes[Object.keys(biomes)[index]];
        const rgb = colorString.split('(')[1];
        const rValue = parseInt(rgb.split(',')[0].trim());
        const gValue = parseInt(rgb.split(',')[1].trim());
        const bValue = parseInt(rgb.split(',')[2].slice(0,-1).trim());
        if(r == rValue && g == gValue && b == bValue) return true;
        else return false;
    });
}



function ReverseObject(obj)
{
    let reversedObj = {};
    for(let keyIndex = 0; keyIndex < Object.keys(obj).length; keyIndex++)
    {
        reversedObj[obj[Object.keys(obj)[keyIndex]]] = Object.keys(obj)[keyIndex];
    }
    return reversedObj;
}

const reverseBiomes = ReverseObject(biomes);

let dimension = 1000;
let humidityMap = new NoiseMap(dimension);
let elevationMap = new NoiseMap(dimension);
let tempMap = new NoiseMap(dimension);

function draw()
{
    dimension = 1000;
    humidityMap = new NoiseMap(dimension);
    elevationMap = new NoiseMap(dimension);
    tempMap = new NoiseMap(dimension);
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    for(let x = 0; x < dimension; x++)
    {
        for(let y = 0; y < dimension; y++)
        {
            const pixelValue = biomes[GetPixelValue(x, y, humidityMap, elevationMap, tempMap)];
            ctx.fillStyle = pixelValue;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    message.value = "Mouse over map for biome";
    feature.value = "Click on area for a feature";
    initializeRegions();
}

function redraw()
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    for(let x = 0; x < dimension; x++)
    {
        for(let y = 0; y < dimension; y++)
        {
            const pixelValue = biomes[GetPixelValue(x, y, humidityMap, elevationMap, tempMap)];
            ctx.fillStyle = pixelValue;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
onMounted(() => draw());


function initializeRegions()
{
    regions = {};
    for(let biomeIndex = 0; biomeIndex < Object.keys(biomes).length; biomeIndex++)
    {
        const biome = Object.keys(biomes)[biomeIndex];
        colors.colors = [];
        colors.colors.push(biome);
        colors.once('track', (event) => regionCallback(event, biome));
        tracking.track(document.getElementById("canvas"), colors);
    }
}

function regionCallback(event, biome)
{
    for(let index = 0; index < event.data.length; index++)
    {
        regions[`${biome}${index}`] = new Region(biome, RegionDetails(biome));
    }
}
/*onMounted(() => {
    document.addEventListener("mousemove", (event) => {
        console.log(`${event.clientX}, ${event.clientY}`)
    });
});*/

function mouseOver(event)
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    const xOffset = canvas.offsetLeft;
    const yOffset = canvas.offsetTop;
    const mouseCoordX = event.pageX - xOffset;
    const mouseCoordY = event.pageY - yOffset;
    const pixel = ctx.getImageData(mouseCoordX, mouseCoordY, 1, 1);
    //console.log(reverseBiomes[`rgb(${pixel.data[0]}, ${pixel.data[1]}, ${pixel.data[2]})`])
    const biome = reverseBiomes[`rgb(${pixel.data[0]}, ${pixel.data[1]}, ${pixel.data[2]})`];
    message.value = biome;
    /*if(biome == Lancelotl.Lancelotl.biome)
    {
        message.value += `\nAnimon:\n${Lancelotl.Lancelotl.toString()}`;
    }*/
    //console.log(pixel.data[0], pixel.data[1], pixel.data[2]);
}

/*tracking.ColorTracker.registerColor('foo', (r,g,b) => {
        if(r == 255 && g == 255 && b == 255) return true;
        else return false;
    });*/
//const colors = new tracking.ColorTracker();

/*colors.on('track', function(event) {
    event.data.forEach(function(rect) {
        drawRect(rect.x, rect.y, rect.width, rect.height, rect.color);
    })
});*/

function rectCallback(event, x, y, biome)
{
    /*event.data.forEach(function(rect) {
        drawRect(rect.x, rect.y, rect.width, rect.height, rect.color);
    })*/
    let savedIndex = 0;
    let savedDistance = 9999999;
    for(let index = 0; index < event.data.length; index++)
    {
        const xCoord = Math.floor(event.data[index].x + event.data[index].width/2);
        const yCoord = Math.floor(event.data[index].y + event.data[index].height/2);
        //const distance = Math.sqrt((event.data[index].x - x)**2 + (event.data[index].y - y)**2);
        const distance = Math.sqrt((xCoord - x)**2 + (yCoord - y)**2);
        if(distance < savedDistance)
        {
            savedDistance = distance;
            savedIndex = index;
        }
    }
    drawRect(event.data[savedIndex].x, event.data[savedIndex].y, event.data[savedIndex].width, event.data[savedIndex].height, event.data[savedIndex].color);
    feature.value = `${regions[`${biome}${savedIndex}`].details}`;
    //console.log(regions[`${biome}${savedIndex}`].details);
}

//onMounted(() => tracking.track(document.getElementById("canvas"), colors));

function drawRect(x, y, w, h, color)
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = 'red';
    ctx.strokeRect(x,y,w,h);
}

function imageClick(myEvent)
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const xOffset = canvas.offsetLeft;
    const yOffset = canvas.offsetTop;
    const mouseCoordX = myEvent.pageX - xOffset;
    const mouseCoordY = myEvent.pageY - yOffset;
    const pixel = ctx.getImageData(mouseCoordX, mouseCoordY, 1, 1);
    const biome = reverseBiomes[`rgb(${pixel.data[0]}, ${pixel.data[1]}, ${pixel.data[2]})`];
    colors.colors = [];
    colors.colors.push(biome);
    redraw();
    colors.once('track', (event) => rectCallback(event, mouseCoordX, mouseCoordY, biome));
    tracking.track(document.getElementById("canvas"), colors);
    
    
}
function GetPixelValue(x, y, humidity, elevation, temp)
{
    const humValue = humidity.get(x,y);
    const eleValue = elevation.get(x,y);
    const tempValue = temp.get(x,y);
    if(eleValue < 0.2) return 'WATER';
    if(eleValue < 0.22) return 'BEACH';
    if(eleValue > 0.8)
    {
        if(humValue < 0.1) return 'SCORCHED';
        if(humValue < 0.2) return 'BARE';
        if(humValue < 0.5) return 'TUNDRA';
        return 'SNOW';
    }
    if(eleValue > 0.6)
    {
        if(humValue < 0.33) return 'TEMPERATE_DESERT';
        if(humValue < 0.66) return 'SHRUBLAND';
        return 'TAIGA';
    }
    if(eleValue > 0.3)
    {
        if(humValue < 0.16) return 'TEMPERATE_DESERT';
        if(humValue < 0.5) return 'GRASSLAND';
        if(humValue < 0.83) return 'TEMPERATE_DECIDUOUS_FOREST';
        return 'TEMPERATE_RAIN_FOREST';
    }
    if(humValue < 0.16) return 'SUBTROPICAL_DESERT';
    if(humValue < 0.33) return 'GRASSLAND';
    if(humValue < 0.66) return 'TROPICAL_SEASONAL_FOREST';
    return 'TROPICAL_RAIN_FOREST';
    

}
/*<span style="white-space: pre;">
    {{ message }}
    {{ feature }}
</span>*/

//const buffer = canvas.toBuffer('image/png');
//fs.writeFileSync('./image.png', buffer);
</script>

<template>
<div>
    <button @click="draw">New map</button>
    <canvas @mousemove="mouseOver($event)" @click="imageClick($event)" id="canvas" ref="el" width="1000" height="1000" origin-top-left />
</div>
<br /><br />
<div>{{ message }}</div>
<br />
<div>{{ feature }}</div>
</template>