
"use strict";

window.onload = function _onload() {
    let chart    = undefined;
    let players = new Array(2); // default 2 Players 
    const labels   = [];
    const datasets = [];
    
    const COOKIETAG = 'players=';
    const COLORS = [
        '#0000ff', // blue
        '#ff0000', // red
        '#00ff00', // green
        '#ffff00', // yellow
        '#ff00ff', // cyan
        '#00ffff', // magenta
        '#ff9300', // orange
        '#942192', // purple
        '#aa7942', // brown
        '#919191', // gray
/*      // chart.js default palette
        '#36a2eb', //'rgb(54, 162, 235)',  // blue
        '#ff6384', //'rgb(255, 99, 132)',  // red
        '#ffcd56', //'rgb(255, 205, 86)',  // yellow
        '#4bc0c0', //'rgb(75, 192, 192)',  // green
        '#ff9f40', //'rgb(255, 159, 64)',  // orange
        '#9966ff', //'rgb(153, 102, 255)', // purple
        '#c9cbcf', //'rgb(201, 203, 207)'  // grey  */
    ];
    
    feather.replace();
    const trName      = document.getElementById('player');
    const trScore     = document.getElementById('score');
    const tbodyScores = document.getElementById('scores');
    window.setPlayers = setPlayers; // will be called by html
    window.onunload = function _onunload(e) {
        document.cookie = storeCookie();
    }
    document.cookie.split(';').forEach( cookie => parseCookie(cookie) );
    setPlayers();
    
    function setPlayers(addPlayers) {
        const newLen = players.length + ((addPlayers === undefined) ? 0 : addPlayers);
        players.length = Math.min(COLORS.length, Math.max(1, newLen));
        // destroy the chart and reset the player struture and the datasets 
        if (chart !== undefined) {
            chart.destroy();
            chart = undefined;
        }
        datasets.length = 0;
        labels.length = 1;
        for (let player = 0; player < players.length; player++) {
            if ((players[player] === undefined) || 
                (players[player].constructor !== Object)) {
                 players[player] = { };
            }
            if (!players[player].name) {
                players[player].name = 'Player ' + (player+1);
            }
            if (!players[player].color) {
                players[player].color = COLORS[player]; 
            }
            if ((addPlayers !== undefined) || 
                (players[player].score === undefined) || 
                (players[player].score.constructor !== Array)) {
                players[player].score = [];
            }
            datasets[player] = {
                label: players[player].name,
                data: [],
                tension: 0.1,
                borderColor: players[player].color,
                backgroundColor: bgndColor(players[player].color),
                spanGaps: true
            };
        }
        // reset the table clear players data and score rows 
        trName.replaceChildren(trName.firstElementChild);
        trScore.replaceChildren(trScore.firstElementChild);
        tbodyScores.replaceChildren(); 
        for (let player = 0; player < players.length; player ++) {
            const input = document.createElement('INPUT');
            input.type = 'text';
            input.value = players[player].name;
            input.player = player;
            input.style.borderColor = players[player].color;
            input.style.backgroundColor = bgndColor(players[player].color);
            input.onkeyup = function _onKeyUp(e) {
                updateScore();
            }
            input.onchange = function _onChangeName(e) {
                const name = this.value;
                players[this.player].name = name;
                datasets[this.player].label = name;
                chart.update();
            }
            // the color input selector (not visible)
            const inputColor = document.createElement('INPUT');
            inputColor.type = 'color';
            inputColor.style.opacity = 0;
            inputColor.player = player;
            inputColor.onchange = function _onChangeColor(e) {
                const input = this.closest('TH').querySelector('INPUT[type="text"]');
                const color = this.value;
                players[input.player].color = color;
                datasets[input.player].borderColor = color;
                input.style.borderColor = color;
                const background = bgndColor(color);
                datasets[input.player].backgroundColor = background; 
                input.style.backgroundColor = background;
                chart.update();
            };
            // color right icon
            const iconColor = document.createElement('SPAN');
            iconColor.className = 'iconright';
            iconColor.textContent = '🎨'; // palette emoji
            iconColor.onclick = function _onClickColor(e) {
                const input = this.closest('TH').querySelector('INPUT[type="color"]');
                input.value = players[input.player].color;
                input.focus();
            };
            // <th><input ...>name</input><span ...>icon</span><span ...>icon<input>color</input></span><th>
            const thName = document.createElement('TH');
            thName.appendChild(input);
            thName.appendChild(createEditIcon());
            iconColor.appendChild(inputColor);
            thName.appendChild(iconColor);
            trName.appendChild(thName);
            // the score <th>score<span ...>icon></span></th>
            const thScore = document.createElement('TH');
            thScore.textContent = '0'; // zero score
            const iconRank = document.createElement('SPAN');
            iconRank.className = 'iconrank';
            iconRank.textContent = '';
            thScore.appendChild(iconRank);
            // add to row
            trScore.appendChild(thScore);
        }
        updateScore();
    };

    function updateScore() {
        let numRows = 1; // at least space for one complete row 
        for (let player = 0; player < players.length; player++) {
            const len = players[player].score.length;
            if (len > 0) {
                const val = parseInt(players[player].score[len - 1]);
                numRows = Math.max(numRows, len + (isNaN(val) ? 0 : 1));
            }
        }
        // calc the cumulative sums and update the chart (datasets + label)
        const sum = [];
        const numRounds = numRows - 1;
        for (let player = 0; player < players.length; player++) {
            sum[player] = 0;
            for (let round = 0; round < numRounds; round++) {
                labels[round] = 1 + round;
                const val = parseInt(players[player].score[round]);
                if (!isNaN(val)) {
                    sum[player] += val;
                    datasets[player].data[round] = sum[player];
                } else {
                    datasets[player].data[round] = NaN;
                }
            }
        }
        // update the score 
        const sortedSum = [...sum].sort((a, b) => b - a);
        const rank = sum.map(s => sortedSum.indexOf(s));
        const medals = [ '🥇', '🥈', '🥉' ]; // medal emojis
        for (let player = 0; player < players.length; player++) {
            const medal = (medals[rank[player]] !== undefined) ? medals[rank[player]] : '';
            trScore.cells[1 + player].firstChild.textContent = sum[player];
            trScore.cells[1 + player].querySelector('SPAN').textContent = medal;
        }
        // create the chart if not yet done
        if (chart === undefined) {
            const ctx = document.getElementById('chart').getContext('2d');
            const config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets,
                },
                options: { 
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    scales: { 
                        x: { title: { text: 'Round', display: true } }, 
                        y: { beginAtZero: true, title: { text: 'Score', display: true } } 
                    },
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    return 'Round ' + context[0].label;
                                },
                            },
                            itemSort: function(item0, item1) {
                                var y0 = item0.raw;
                                var y1 = item1.raw;
                                return (y0 < y1) ? +1 : (y0 > y1) ? -1 : 0;
                            }
                        }
                    }
                }
            };
            chart = new Chart(ctx, config);
        }
        chart.update();
        // add as many rows as needed
        for (let row = tbodyScores.rows.length; row < numRows; row++) {
            const tr = tbodyScores.insertRow(0);
            const td = tr.insertCell();
            td.textContent = 'Round ' + (row+1);
            for (let player = 0; player < players.length; player++) {
                // we build <td><input ... >score</input><span ... >icon</span></td>
                const input = document.createElement('INPUT');
                input.type = 'text';
                input.inputmode = 'numeric';
                input.pattern = '[0-9]*';
                input.player = player;
                input.round = row;
                input.value  = parseValue(players[player].score[row]);
                input.discardValue = function _discardValue() {
                    const val = parseValue(this.oldValue);
                    this.value = val;
                    players[this.player].score[this.round] = val;
                }
                input.acceptValue = function _acceptValue() {
                    players[this.player].score[this.round] = parseValue(this.value);
                }
                input.onfocus = function _onfocus(e) {
                    this.oldValue = parseValue(this.value);
                }
                input.onblur = function _onblur(e) {
                    if (!this.checkValidity()) {
                        this.discardValue()
                        updateScore();
                    } else {
                        this.acceptValue();
                        updateScore();
                    }
                }
                input.onkeyup = function _onkeyup(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        // advance the cell or row
                        const nextPlayer = (this.player + 1) % players.length;
                        const tr = this.closest('TR');
                        let nextInput = tr.cells[1 + nextPlayer].querySelector(this.tagName);
                        if ((nextInput.value != '') && (tr === tbodyScores.rows[1])) {
                            nextInput = tbodyScores.rows[0].cells[1 + nextPlayer].querySelector(this.tagName);
                        }
                        if(nextInput.value == '') {
                            nextInput.focus();
                        }
                        this.blur();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        this.discardValue();
                        this.blur();
                    } else {
                        this.acceptValue();
                        updateScore();
                    }
                }
                const td = tr.insertCell();
                td.appendChild(input);
                td.appendChild(createEditIcon());
            }
        }
    }
    
    function createEditIcon() {
        const icon = document.createElement('SPAN');
        icon.className = 'iconleft';
        icon.textContent = '✏️'; // pen emoji
        icon.onclick = function _onClick(e) {
            const input = this.closest('TD, TH').querySelector('INPUT[type="text"]');
            input.focus();
            input.setSelectionRange(0, input.value.length);
        };
        return icon;
    }

    function parseValue(val) {
        val = parseInt(val);
        return isNaN(val) ? '' : val;
    }

    function parseCookie(cookie) {
        try {
            if (cookie.startsWith(COOKIETAG)) {
                players = JSON.parse(cookie.substring(COOKIETAG.length));
            }
        } catch (e) {
        }
    }

    function storeCookie(days = 365) {
        let expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = '; expires=' + date.toGMTString();
        }
        const value = JSON.stringify(players);
        return COOKIETAG + value + expires + '; path=/';
    }

    function bgndColor(color) {
        const r = parseInt(color.slice(1, 3), 16); 
        const g = parseInt(color.slice(3, 5), 16); 
        const b = parseInt(color.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',0.5)';
    }

    function textColor(color) {
        const r = parseInt(color.slice(1, 3), 16); 
        const g = parseInt(color.slice(3, 5), 16); 
        const b = parseInt(color.slice(5, 7), 16);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lightness = (min + max) / 2;
        return (lightness >= 127) ? '#000000' : '#ffffff';
    }
    
};