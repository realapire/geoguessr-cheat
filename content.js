let lat = 999;
let long = 999;
let coordInfo = '';
let strCoord = null;

async function fetchAndInjectScript(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const scriptContent = await response.text();

            const scriptElement = document.createElement('script');
            scriptElement.textContent = scriptContent;

            (document.head || document.documentElement).appendChild(scriptElement);

            scriptElement.onload = function () {
                this.remove();
            };
        }
    } catch (e) {
        // useless to output
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
        return data.address;
    } catch {
        return;
    }
}

function stringToBool(str) {
    if (str === 'true') return true;
    if (str === 'false') return false;
    return null;
}


window.addEventListener('load', async function () {

    let safeMode = this.localStorage.getItem('safeMode')
    if (safeMode == null) {
        localStorage.setItem('safeMode', true)
        safeMode = true
    }

    const pinImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/assets/view.png';
    const viewImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-fix/assets/pin.png';
    const safeImg = 'https://raw.githubusercontent.com/realapire/geoguessr-cheat/ui-safemode-noalert/assets/safe.png';

    setInterval(() => {
        let element = document.querySelector('[class^="styles_columnTwo__"]');

        if (element) {
            const childElems = element.querySelectorAll('[class^="styles_control__"]');

            if (childElems.length != 5 && childElems.length != 2) {

                element.innerHTML += `<a href="#" class="styles_control__a" id="tellLocation" style="margin-bottom: 1rem; position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${pinImg}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;
                element.innerHTML += `<a href="#" class="styles_control__b" id="autoPlace" style="margin-bottom: 1rem; position: relative; touch-action: pan-x pan-y; background: rgba(0, 0, 0, .6);border: 0;border-bottom: .0625rem solid rgba(0, 0, 0, .4);cursor: pointer;height:40px;display: flex; align-items: center; justify-content: center;width: 40px;border-radius: 50%"><img alt='Return to start' loading='lazy' width='22' height='24' decoding='async' data-nimg='1' style="filter: invert(1); position: absolute;" class='styles_iconReturnToStart__PT25v' src='${viewImg}' style='color: transparent;'></button><div class='tooltip_tooltip__CHe2s tooltip_right__07M2V tooltip_roundnessXS__khTx4 tooltip_hideOnXs__hsJpx' style='top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;'>Return to start (R)<div class='tooltip_arrow__Rz_22'></div></div>`;

                document.getElementById('tellLocation').addEventListener('click', async function () {
                    await tellLocation();
                });


                document.getElementById('autoPlace').addEventListener('click', async function () {
                    autoPlace(safeMode);
                });
            }
        }

        let settingsMenu = document.querySelector('[class^="game-menu_optionsContainer__"]');
        if (settingsMenu) {
            const childElems = settingsMenu.querySelectorAll('[class^="game-options_option__"]');

            if (childElems.length != 4) {
                settingsMenu.innerHTML += `<label class="game-options_option__xQZVa game-options_editableOption__0hL4c"><img alt="Emoji icon" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" class="game-menu_emoteIcon__t4FxY" src="${safeImg}" style="color: transparent; filter: invert(1);"><div class="game-options_optionLabel__Vk5xN">safe mode</div><div class="game-options_optionInput__paPBZ"><input type="checkbox" class="toggle_toggle__qfXpL a" checked="${stringToBool(safeMode)}"></div></label>`
            }

            if (safeMode == "false" || safeMode == false) {
                this.document.querySelector('.toggle_toggle__qfXpL.a').checked = false;
            }

            this.document.querySelector('.toggle_toggle__qfXpL.a').addEventListener('change', async function () {
                if (this.checked) {
                    localStorage.setItem('safeMode', true)
                    safeMode = true;
                } else {
                    localStorage.setItem('safeMode', false)
                    safeMode = false;
                }
            });
        }
    }, 50);
});


document.addEventListener('keydown', async function (event) {
    if (lat == 999 && long == 999) return;
    if (event.ctrlKey && event.code === 'Space' && localStorage.getItem('safeMode') == 'false') {
        autoPlace();
    }
    if (event.ctrlKey && event.shiftKey && localStorage.getItem('safeMode') == 'false') {
        await tellLocation();
    }
});

async function tellLocation() {
    console.log('tell')

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9998';
    overlay.style.display = 'none';

    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgb(86, 59, 154)';
    popup.style.padding = '20px';
    popup.style.borderRadius = '20px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    popup.style.zIndex = '9999';
    popup.style.display = 'none';
    popup.style.color = 'white';
    popup.style.textAlign = 'center';

    const title = document.createElement('h2');
    title.style.color = '#a19bd9';
    title.style.fontStyle = 'italic';
    title.style.fontWeight = '700';
    title.style.fontFamily = 'neo-sans, sans-serif';
    title.innerText = 'LOCATION';
    popup.appendChild(title);

    const content = document.createElement('p');
    content.style.fontFamily = 'neo-sans, sans-serif';
    content.style.paddingLeft = '20px';
    content.style.paddingRight = '20px';
    content.style.marginTop = '20px';
    content.style.maxWidth = '400px';
    const coordInfo = await getCoordInfo();

    for (const [key, value] of Object.entries(coordInfo)) {
        const infoItem = document.createElement('p');
        infoItem.style.display = 'flex';
        infoItem.style.justifyContent = 'flex-start';
        infoItem.style.flexWrap = 'wrap';
        infoItem.style.gap = '10px';

        const keySpan = document.createElement('span');
        keySpan.style.textAlign = 'left';
        keySpan.style.fontWeight = '700';
        keySpan.style.textTransform = 'uppercase';

        keySpan.innerText = `${key}:`;

        infoItem.appendChild(keySpan);

        const valueSpan = document.createElement('span');
        valueSpan.style.textAlign = 'left';
        valueSpan.innerText = ` ${value}`;

        infoItem.appendChild(valueSpan);
        content.appendChild(infoItem);
    }

    popup.appendChild(content);

    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.marginTop = '20px';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '10px 20px';
    closeButton.style.borderRadius = '15px';
    closeButton.style.backgroundColor = '#6cb928';
    closeButton.style.fontFamily = 'neo-sans, sans-serif';
    closeButton.style.fontStyle = 'italic';
    closeButton.style.fontWeight = '700';
    closeButton.style.fontSize = '16px';
    closeButton.style.width = '100%';

    closeButton.onclick = function () {
        popup.style.display = 'none';
        overlay.style.display = 'none';
    };
    overlay.onclick = function () {
        popup.style.display = 'none';
        overlay.style.display = 'none';
    };

    popup.appendChild(closeButton);

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    function showPopup() {
        popup.style.display = 'block';
        overlay.style.display = 'block';
    }

    showPopup();
}

function getRandomOffset() {
    const offset = 0.5 + Math.random() * 2;
    return Math.random() < 0.5 ? -offset : offset;
}

async function autoPlace(safeMode) {
    const element = document.querySelector('.guess-map_canvasContainer__s7oJp');

    if (element) {
        const keys = Object.keys(element);
        const key = keys.find(key => key.startsWith("__reactFiber$"));

        if (key) {
            const place = element[key].return.memoizedProps.onMarkerLocationChanged;

            if (safeMode) {
                lat += getRandomOffset();
                long += getRandomOffset();
            }

            place({ lat: lat, lng: long });
        }
    }

    function humanClick(element) {
        function triggerMouseEvent(eventType, element) {
            const event = new MouseEvent(eventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            });
            element.dispatchEvent(event);
        }

        const delay = Math.floor(Math.random() * 100) + 50;

        setTimeout(() => {
            triggerMouseEvent('mousedown', element);

            setTimeout(() => {
                triggerMouseEvent('mouseup', element);
                triggerMouseEvent('click', element);
            }, delay);
        }, delay);
    }

    const btn = document.querySelector('button[data-qa="perform-guess"]');

    const delay = Math.floor(Math.random() * 3000) + 500;

    if (btn) {
        setTimeout(() => {
            humanClick(btn);
        }, delay);
    }
}

