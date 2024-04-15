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

window.addEventListener('load', async function () {
    let element = document.querySelector('[class^="styles_columnTwo___"]');

    while (!element) {
        await new Promise(resolve => setTimeout(resolve, 500));
        element = document.querySelector('[class^="styles_columnTwo___"]');
    }

    if (element) {
        element.innerHTML += `<div class='styles_control__zEkd0'><span class='tooltip_reference__qDBCi'><button id="tellLocation" class='styles_hudButton__jPUdv styles_sizeSmall__xGh28 styles_roundBoth__VjjSQ' data-qa='return-to-start'><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1)" class='styles_iconReturnToStart__PT25v' src='${chrome.runtime.getURL('assets/view.png')}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div></span></div>`;
        element.innerHTML += `<div class='styles_control__zEkd0'><span class='tooltip_reference__qDBCi'><button id="showLocation" class='styles_hudButton__jPUdv styles_sizeSmall__xGh28 styles_roundBoth__VjjSQ' data-qa='return-to-start'><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1)" class='styles_iconReturnToStart__PT25v' src='${chrome.runtime.getURL('assets/pin.png')}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div></span></div>`;
    }

    document.getElementById('tellLocation').addEventListener('click', async function () {
        tellLocation();
    });

    document.getElementById('showLocation').addEventListener('click', async function () {
        showLocation();
    });
});


document.addEventListener('keydown', async function (event) {
    if (lat == 999 && long == 999) return;
    if (event.ctrlKey && event.code === 'Space') {
        showLocation();
    }
    if (event.ctrlKey && event.shiftKey) {
        alert(await getCoordInfo());
    }
});

async function tellLocation() {
    alert(await getCoordInfo());
}

async function showLocation() {
    window.open(`https://www.google.be/maps/search/${convertCoords(lat, long)}`);
}