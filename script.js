
"use strict";

window.onload = function _onload() {

    const table = document.getElementById('table');
    const scores = document.getElementById('scores');
    const name = document.getElementById("name");
    const score = document.getElementById("score");
    let chart;
    let labels = [];
    let datasets = [];

    const cookieTag = "names=";
    let names = [ "Player 1", "Player 2" ];
    document.cookie.split(';').forEach( function _cookie(cookie) {
        try {
            if (cookie.startsWith(cookieTag)) {
                names = JSON.parse(cookie.substring(cookieTag.length));
            }
        } catch (e) {
        }
    });
    let players = getParameterByName('n') || names.length;
    names.length = players;
    
    window.setPlayers = function _reset(n) {
        document.cookie = cookieTag + JSON.stringify(names);
        location.href='?n='+n;
    }
    window.onunload = function _onunload() {
        document.cookie = cookieTag + JSON.stringify(names);
    }
    for (let i = 0; i < players; i ++) {
        if (!names[i]) names[i] = "Player " + i;
        let newCell = document.createElement("TH");
        newCell.textContent = names[i];
        newCell.setAttribute("edittype", "text");
        name.appendChild(newCell);
        newCell = document.createElement("TH");
        newCell.textContent = 0;
        score.appendChild(newCell);
        newCell = scores.firstElementChild.insertCell();
        newCell.setAttribute("edittype", "number");
    }
    table.addEventListener('click', function _click(e) {
        const cell = e.target;
        if (cell.hasAttribute("edittype") && !cell.querySelector('input')) {
            makeCellEditable(cell);
        }
        else {
            e.preventDefault();
        }
    });
    initChart();
    makeCellEditable(scores.rows[0].children[1]);
    
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function makeCellEditable(cell) {
        const input = document.createElement('input');
        input.oldValue = cell.textContent;
        input.value = input.oldValue;
        input.type = cell.getAttribute("edittype");
        if(input.type === "number") {
            input.pattern = "[0-9]*";
        }
        cell.replaceChildren(input);
        input.focus();
        input.addEventListener('blur', function _blur(e) {
            let changed = input.value != input.oldValue;
            cell.textContent = input.value;
            updateScore();
            let isNum = true;
            for (let p = 0; isNum && (p < players); p++) {
                let val = parseInt(scores.firstElementChild.children[p+1].textContent);
                isNum = Number.isInteger(val);
            }
            if (isNum) {
                const numRows = scores.rows.length;
                const newRow = scores.insertRow(0);
                for (let i = 0; i < table.rows[0].cells.length; i++) {
                    const newCell = newRow.insertCell();
                    newCell.textContent = '';
                    if (i > 0) {
                        newCell.setAttribute("edittype", "number");
                    }
                }
                newRow.children[0].innerHTML = "Round " + (numRows+1);
                makeCellEditable(newRow.children[1]);
            }
        });
        input.addEventListener('keydown', function _keydown(e) {
            if ((e.key === 'Enter') || (e.key === 'Tab')) {
                e.preventDefault();
                let nextCell;
                if ((input.value != "") && (input.type == "number")) {
                    nextCell = cell.nextElementSibling;
                    if (!nextCell && (scores.firstElementChild !== cell.parentNode)) {
                        nextCell = cell.parentNode.nextElementSibling.children[1];
                    }
                }
                input.blur();
                if (nextCell) {
                    makeCellEditable(nextCell);
                }
            } else if (e.key === 'Escape') {
                input.value = input.oldValue;
                e.preventDefault();
                input.blur();
            }
        });
    }

    function initChart() {
        let ctx = document.getElementById('scoreChart').getContext('2d');
        for (let p = 0; p < players; p++) {
            datasets[p] = {
                label: name.children[p+1].innerHTML,
                fill: false,
                tension: 0.1,
                data: [0]
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
                    x: { beginAtZero: true, title: { text: "After Round", display: true } }, 
                    y: { beginAtZero: true, title: { text: "Cumulative Score", display: true } } 
                },
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                }
            }
        });
        for (let p = 0; p < players; p++) {
            name.children[p+1].style.backgroundColor = datasets[p].backgroundColor;
        }
        updateScore();
    }

    function updateScore() {
        let num = scores.childElementCount;
        let sum = [];
        for (let p = 0; p < players; p++) {
            sum[p] = 0;
            datasets[p].label = names[p] = name.children[p+1].textContent;
        }
        for (let s = 0; s < num; s++) {
            labels[s] = s+1;
            for (let p = 0; p < players; p++) {
                let val = parseInt(((s < num) ? scores.children[num - s - 1] : input).children[p+1].textContent)
                if (Number.isInteger(val)) {
                    sum[p] += val;
                    datasets[p].data[s] = sum[p];
                } else {
                    datasets[p].data[s] = undefined;
                }
            }
        }
        for (let p = 0; p < players; p++) {
            score.children[p+1].innerHTML = sum[p];
        }
        chart.update();
    }

};