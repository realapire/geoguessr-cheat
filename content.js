let lat = 999;
let long = 999;
let coordInfo = '';
let strCoord = null;

var s = document.createElement('script');
s.src = chrome.runtime.getURL('xhr_inject.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

function convertToMinutes(decimal) {
    return Math.floor(decimal * 60);
}

function convertToSeconds(decimal) {
    return (decimal * 3600 % 60).toFixed(1);
}

function getLatDirection(lat) {
    return lat >= 0 ? "N" : "S";
}

function getLongDirection(long) {
    return long >= 0 ? "E" : "W";
}

window.addEventListener('message', async function (e) {
    const msg = e.data.data;
    if (msg) {
        try {
            const arr = JSON.parse(msg);
            lat = arr[1][0][5][0][1][0][2];
            long = arr[1][0][5][0][1][0][3];
            strCoord = null;
        } catch {
            return;
        }
    }
});
function convertCoords(lat, long) {
    var latResult, longResult, dmsResult;
    latResult = Math.abs(lat);
    longResult = Math.abs(long);
    dmsResult = Math.floor(latResult) + "°" + convertToMinutes(latResult % 1) + "'" + convertToSeconds(latResult % 1) + '"' + getLatDirection(lat);
    dmsResult += "+" + Math.floor(longResult) + "°" + convertToMinutes(longResult % 1) + "'" + convertToSeconds(longResult % 1) + '"' + getLongDirection(long);
    return dmsResult;
}

async function getCoordInfo() {
    if (strCoord !== null) {
        return strCoord;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        strCoord = data.display_name;
        return strCoord;
    } catch {
        return;
    }
}

document.addEventListener('keydown', async function (event) {
    if (lat == 999 && long == 999) return;
    if (event.ctrlKey && event.code === 'Space') {
        window.open(`https://www.google.be/maps/search/${convertCoords(lat, long)}`);
    }
    if (event.ctrlKey && event.shiftKey) {
        alert(await getCoordInfo());
    }
});
