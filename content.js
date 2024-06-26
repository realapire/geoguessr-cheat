let lat = 999;
let long = 999;
let coordInfo = '';
let strCoord = null;

async function fetchAndInjectScript(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch script (${response.status} ${response.statusText})`);
        }
        const scriptContent = await response.text();

        const scriptElement = document.createElement('script');
        scriptElement.textContent = scriptContent;

        (document.head || document.documentElement).appendChild(scriptElement);

        scriptElement.onload = function () {
            this.remove();
            console.log('Script loaded and executed');
        };
    } catch (error) {
        console.error('Error fetching or injecting script:', error);
    }
}

const remoteScriptUrl = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/xhr_inject.js';
fetchAndInjectScript(remoteScriptUrl);

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
            let x = false;
            try {
                lat = arr[1][0][5][0][1][0][2];
                long = arr[1][0][5][0][1][0][3];
                x = true;
            } catch (e) {
                // useless to output
            }

            if (!x) {
                try {
                    if (isDecimal(arr[1][5][0][1][0][2]) && isDecimal(arr[1][5][0][1][0][3])) {
                        lat = arr[1][5][0][1][0][2];
                        long = arr[1][5][0][1][0][3];
                    }
                } catch (e) {
                    // useless to output
                }
            }

            strCoord = null;
        } catch {
            return;
        }
    }
});

function isDecimal(str) {
    str = String(str);
    return !isNaN(str) && str.includes('.') && !isNaN(parseFloat(str));
}

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
    setInterval(() => {
        let element = document.querySelector('[class^="styles_columnTwo__"]');

        if (element) {
            const childElems = element.querySelectorAll('[class^="styles_control__"]');
            if (childElems.length != 5 && childElems.length != 2) {
                const pinImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/assets/view.png';
                const viewImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/assets/pin.png';
                element.innerHTML += `<a href="#" class="styles_control__a" id="tellLocation" style="margin-bottom: 1rem; position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${pinImg}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;
                element.innerHTML += `<a href="#" class="styles_control__b" id="autoPlace" style="margin-bottom: 1rem; position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${viewImg}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;

                document.getElementById('tellLocation').addEventListener('click', async function () {
                    tellLocation();
                });

                document.getElementById('autoPlace').addEventListener('click', async function () {
                    autoPlace();
                });
            }
        }
    }, 50);
});


document.addEventListener('keydown', async function (event) {
    if (lat == 999 && long == 999) return;
    if (event.ctrlKey && event.code === 'Space') {
        autoPlace();
    }
    if (event.ctrlKey && event.shiftKey) {
        alert(await getCoordInfo());
    }
});

async function tellLocation() {
    alert(await getCoordInfo());
}

async function autoPlace() {
    const element = document.querySelector('.guess-map_canvasContainer__s7oJp');

    if (element) {
        const keys = Object.keys(element)
        const key = keys.find(key => key.startsWith("__reactFiber$")) 
        const place = element[key].return.memoizedProps.onMarkerLocationChanged
        place({lat: lat, lng: long})
    } 
}
