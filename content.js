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
    let elementsAdded = false;

    setInterval(() => {
        let element = document.querySelector('[class^="styles_columnTwo__"]');

        if (element) {
            const hasControlA = element.querySelector('.styles_control__a');
            const hasControlB = element.querySelector('.styles_control__b');

            if (!hasControlA || !hasControlB) {
                elementsAdded = false;
            }

            if (!elementsAdded) {
                element.innerHTML += `<a href="#" class="styles_control__a" id="tellLocation" style="position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${chrome.runtime.getURL('assets/view.png')}' style='color: transparent;'></a><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;
                element.innerHTML += `<a href="#" class="styles_control__b" id="showLocation" style="position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${chrome.runtime.getURL('assets/pin.png')}' style='color: transparent;'></a><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;

                document.getElementById('tellLocation').addEventListener('click', async function () {
                    tellLocation();
                });

                document.getElementById('showLocation').addEventListener('click', async function () {
                    showLocation();
                });

                elementsAdded = true;
            }
        }
    }, 50);
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
    const zoomParameters = "@47.1840301,6.658821,5.5z"
    window.open(`https://www.google.be/maps/search/${convertCoords(lat, long)}?entry=ttu`);
}
