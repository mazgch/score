
"use strict";

window.onload = function _onload() {

    const table = document.getElementById('table');
    const scores = document.getElementById('scores');
    const name = document.getElementById("name");
    const score = document.getElementById("score");
    let chart;
    let labels = [];
    let datasets = [];

    const names = [ 'Nicole', 'Michael', 'Oliver', 'Rafael' ];
    const players = getParameterByName('n') || 2;
    for (let i = 0; i < players; i ++) {
        let newCell = document.createElement("TH");
        newCell.textContent = names[i];
        newCell.setAttribute("edittype", "text");
        name.appendChild(newCell);
        newCell = document.createElement("TH");
        newCell.textContent = 0;
        newCell.setAttribute("edittype", "text");
        score.appendChild(newCell);
        newCell = scores.firstElementChild.insertCell();
        newCell.setAttribute("edittype", "number");
    }
    table.addEventListener('click', function (event) {
        const cell = event.target;
        if (cell.hasAttribute("edittype") &&
            !cell.querySelector('input')) {
            makeCellEditable(cell);
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
        });
        input.addEventListener('keydown', function _keydown(e) {
            if ((e.key === 'Enter') || (e.key === 'Tab')) {
                e.preventDefault();
                input.blur();
                if((input.value != "") && (input.type == "number")) {
                    let nextCell = cell.nextElementSibling;
                    if (!nextCell) {
                        if (scores.firstElementChild === cell.parentNode) {
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
                            nextCell = newRow.children[1];
                        } else {
                            nextCell = cell.parentNode.nextElementSibling.children[1];
                        }
                    }
                    if (nextCell) {
                        makeCellEditable(nextCell);
                    }
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
            datasets[p].label = name.children[p+1].innerHTML;
        }
        for (let s = 0; s < num; s++) {
            labels[s] = s+1;
            for (let p = 0; p < players; p++) {
                let val = parseInt(((s < num) ? scores.children[num - s - 1] : input).children[p+1].innerHTML)
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