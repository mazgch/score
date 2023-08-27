
"use strict";

window.onload = function _onload() {
    let chart = undefined;
    let labels = [];
    let datasets = [];
    
    const name = document.getElementById("player");
    const score = document.getElementById("score");
    const scores = document.getElementById('scores');
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
    function bgndColor(color) {
        return "rgba(" + 
                parseInt(color.slice(1, 3), 16) + "," + 
                parseInt(color.slice(3, 5), 16) + "," + 
                parseInt(color.slice(5, 7), 16) + ",0.5)";
    }

    feather.replace();

    const cookieTag = "players=";
    let players = [ undefined, undefined ]; // default 2 Players 
    document.cookie.split(';').forEach( function _cookie(cookie) {
        try {
            if (cookie.startsWith(cookieTag)) {
                players = JSON.parse(cookie.substring(cookieTag.length));
            }
        } catch (e) {
        }
    });
    
    setPlayers();
    
    window.onunload = function _onunload() {
        document.cookie = cookieTag + JSON.stringify(players);
    }
    
    window.setPlayers = setPlayers;
    
    function setPlayers(n) {
        n = players.length + ((n === undefined) ? 0 : n);
        players.length = Math.min(COLORS.length, Math.max(1,n));
        initChart();
        let newCell = document.createElement("TH");
        name.replaceChildren(name.firstElementChild);
        score.replaceChildren(score.firstElementChild);
        scores.replaceChildren();
        for (let p = 0; p < players.length; p ++) {
            newCell = document.createElement("TH");
            let inputCell = document.createElement("INPUT");
            inputCell.type = "text";
            inputCell.value = players[p].name;
            inputCell.onkeyup = updateScore;
            inputCell.style.borderColor = players[p].color;
            inputCell.style.backgroundColor = bgndColor(players[p].color);
            inputCell.onchange = function _onchangeName(e) {
                const name = inputCell.value;
                players[p].name = name;
                datasets[p].label = name;
                chart.update();
            }
            newCell.appendChild(inputCell);
            let spanCell = document.createElement("SPAN");
            spanCell.className = "iconleft";
            spanCell.onclick = function _onclickName(e) { 
                inputCell.focus(); 
                inputCell.setSelectionRange(0, inputCell.value.length);
            };
            spanCell.textContent = "✎";
            newCell.appendChild(spanCell);
            spanCell = document.createElement("SPAN");
            spanCell.className = "iconright";
            spanCell.textContent = "🎨";
            let inputColor = document.createElement('INPUT');
            inputColor.type = 'color';
            inputColor.style.opacity = "0";
            inputColor.onchange = function _onchangeColor(e) {
                const color = inputColor.value;
                players[p].color = color;
                datasets[p].borderColor = color;
                inputCell.style.borderColor = color;
                const background = bgndColor(color);
                datasets[p].backgroundColor = background; 
                inputCell.style.backgroundColor = background;
                chart.update();
            };
            spanCell.appendChild(inputColor);
            spanCell.onclick = function _onclickColor(e) {
                inputColor.value = datasets[p].borderColor; 
                inputColor.focus(); 
            };
            newCell.appendChild(spanCell);
            name.appendChild(newCell);
            newCell = document.createElement("TH");
            newCell.textContent = 0;
            score.appendChild(newCell);
        }
        updateScore(0);
    }

    function initChart() {
        if (chart !== undefined) {
            chart.destroy();
        }
        chart = undefined;
        datasets = [];
        labels = [ 1 ];
        let ctx = document.getElementById('scoreChart').getContext('2d');
        for (let p = 0; p < players.length; p++) {
            if ((players[p] === undefined) || (players[p].constructor !== Object))  players[p] = { };
            if (!players[p].name)   players[p].name = "Player " + (p+1);
            if (!players[p].color)  players[p].color = COLORS[p]; 
            datasets[p] = {
                label: players[p].name,
                fill: false,
                tension: 0.1,
                data: [ 0 ],
                borderColor: players[p].color,
                backgroundColor: bgndColor(players[p].color),
            };
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: { 
                scales: { 
                    x: { beginAtZero: true, title: { text: "Round", display: true } }, 
                    y: { beginAtZero: true, title: { text: "Score", display: true } } 
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                }
            }
        });
        chart.update();
    }
    
    function updateScore(insertRow = undefined) {
        let sum = [];
        for (let p = 0; p < players.length; p++) {
            sum[p] = 0;
            if ((insertRow !== undefined) && (scores.firstElementChild)) {
                let val = scores.firstElementChild.children[p+1].firstElementChild.value;
                val = parseInt(val);
                if (!Number.isInteger(val)) insertRow = undefined;
            }
        }
        if (insertRow !== undefined) {
            const numRows = scores.rows.length;
            const focusedCell = document.activeElement;
            const focusedCol = ((focusedCell && focusedCell.parentNode.tagName === "TD") && (focusedCell.cellIndex < players.length)) ? focusedCell.cellIndex + 1 : 1;
            const newRow = scores.insertRow(0);
            const newCell = newRow.insertCell();
            newCell.textContent = "Round " + (numRows+1);
            for (let p = 0; p < players.length; p++) {
                const newCell = newRow.insertCell();
                let inputCell = document.createElement("INPUT");
                inputCell.type = "number";
                inputCell.inputmode = "numeric";
                inputCell.pattern = "[0-9]*";
                inputCell.nextRowIx = (p + 1) % players.length;
                inputCell.onfocus = function _onfocus(e) {
                    inputCell.oldValue = inputCell.value;
                }
                inputCell.onblur = function _onblur(e) {
                    if (!inputCell.checkValidity()) {
                        inputCell.value = inputCell.oldValue;
                    } else {
                        updateScore(inputCell.nextRowIx);
                    }
                }
                inputCell.onkeyup = function _onkeyup(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        newRow.children[inputCell.nextRowIx+1].firstElementChild.focus();
                        inputCell.blur();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        inputCell.value = inputCell.oldValue;
                        inputCell.blur();
                    } else {
                        updateScore();
                    }
                };
                newCell.appendChild(inputCell);
                let spanCell = document.createElement("SPAN");
                spanCell.className = "iconleft";
                spanCell.onclick = function _click() { 
                    inputCell.focus();
                };
                spanCell.textContent = "✎";
                newCell.appendChild(spanCell);
            }
            newRow.children[insertRow + 1].firstElementChild.focus();
            
        }
        let numRows = scores.rows.length;
        for (let r = 0; r < numRows; r++) {
            labels[r] = r+1;
            for (let p = 0; p < players.length; p++) {
                let val = scores.rows[(numRows - 1) - r].children[p+1].firstElementChild.value;
                val = parseInt(val);
                if (Number.isInteger(val)) {
                    sum[p] += val;
                    datasets[p].data[r] = sum[p];
                } else if (r + 1 < numRows){
                    datasets[p].data[r] = sum[p];
                }
            }
        }
        for (let p = 0; p < players.length; p++) {
            score.children[p+1].textContent = sum[p];
        }
        chart.update();
    }
};