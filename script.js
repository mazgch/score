
"use strict";

window.onload = function _onload() {
    let chart = undefined;
    let labels = [];
    let datasets = [];
    
    const table = document.getElementById('table');
    const scores = document.getElementById('scores');
    const time = document.getElementById("time");
    const name = document.getElementById("name");
    const score = document.getElementById("score");
    
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
    
    resetPlayers(names.length);
    
    window.onunload = function _onunload() {
        document.cookie = cookieTag + JSON.stringify(names);
    }
    
    window.setPlayers = resetPlayers;
    
    function resetPlayers(n) {
        names.length = n;
        let newCell = document.createElement("TH");
        newCell.textContent = "Player";
        name.replaceChildren(newCell);
        // newCell = document.createElement("TH");
        // newCell.textContent = "Time";
        // time.replaceChildren(newCell);
        newCell = document.createElement("TH");
        newCell.textContent = "Score";
        score.replaceChildren(newCell);
        newCell = document.createElement("TR");
        scores.replaceChildren(newCell);
        newCell = newCell.insertCell();    
        newCell.textContent = "Round 1";
        for (let i = 0; i < names.length; i ++) {
            if (!names[i]) names[i] = "Player " + (i+1);
            newCell = document.createElement("TH");
            newCell.textContent = names[i];
            newCell.setAttribute("edittype", "text");
            name.appendChild(newCell);
            // newCell = document.createElement("TH");
            // time.appendChild(newCell);
            newCell = document.createElement("TH");
            newCell.textContent = 0;
            score.appendChild(newCell);
            newCell = scores.firstElementChild.insertCell();
            newCell.setAttribute("edittype", "number");
        }
        initChart();
        makeCellEditable(scores.rows[0].children[1]);
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
            for (let p = 0; isNum && (p < names.length); p++) {
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
        if (chart !== undefined) {
            chart.destroy();
        }
        chart = undefined;
        datasets = [];
        labels = [];
        let ctx = document.getElementById('scoreChart').getContext('2d');
        for (let p = 0; p < names.length; p++) {
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
        for (let p = 0; p < names.length; p++) {
            name.children[p+1].style.backgroundColor = datasets[p].backgroundColor;
        }
        updateScore();
    }

    function updateScore() {
        let num = scores.childElementCount;
        let sum = [];
        for (let p = 0; p < names.length; p++) {
            sum[p] = 0;
            datasets[p].label = names[p] = name.children[p+1].textContent;
        }
        for (let s = 0; s < num; s++) {
            labels[s] = s+1;
            for (let p = 0; p < names.length; p++) {
                let val = parseInt(((s < num) ? scores.children[num - s - 1] : input).children[p+1].textContent)
                if (Number.isInteger(val)) {
                    sum[p] += val;
                    datasets[p].data[s] = sum[p];
                } else {
                    datasets[p].data[s] = undefined;
                }
            }
        }
        for (let p = 0; p < names.length; p++) {
            score.children[p+1].innerHTML = sum[p];
        }
        chart.update();
    }

};