
"use strict";

window.onload = function _onload() {

    const table = document.getElementById('table');
    const scores = document.getElementById('scores');
    const name = document.getElementById("name");
    const score = document.getElementById("score");
    let chart;
    let labels = [];
    let datasets = [];
    table.addEventListener('click', function (event) {
        const cell = event.target;
        if (cell.hasAttribute("edittype") &&
            !cell.querySelector('input')) {
            makeCellEditable(cell);
        }
    });
    initChart();
    makeCellEditable(scores.rows[0].children[1]);

    function makeCellEditable(cell) {
        const initialValue = cell.textContent;
        cell.textContent = '';
        const input = document.createElement('input');
        input.type = cell.getAttribute("edittype");
        input.value = initialValue;
        cell.appendChild(input);
        input.focus();
        input.addEventListener('blur', function () {
            cell.textContent = input.value || initialValue;
        });
        input.addEventListener('keydown', function (e) {
            if ((e.key === 'Enter') || (e.key === 'Tab')) {
                e.preventDefault();
                input.blur();
                if(input.value != "" && input.type == "number") {
                    let nextCell = cell.nextElementSibling;
                    if (!nextCell) {
                        const numRows = scores.rows.length;
                        const newRow = scores.insertRow(0);
                        for (let i = 0; i < table.rows[0].cells.length; i++) {
                            const newCell = newRow.insertCell();
                            newCell.textContent = '';
                            if (i > 0) {
                                newCell.setAttribute("edittype", "number");
                            }
                        }
                        newRow.children[0].innerHTML = numRows;
                        nextCell = newRow.children[1];
                    }
                    if (nextCell) {
                        makeCellEditable(nextCell);
                    }
                }
                updateScore();
            } else if (e.key === 'Escape') {
                cell.textContent = initialValue;
            }
        });
    }

    function initChart() {
        let ctx = document.getElementById('scoreChart').getContext('2d');
        for (let p = 1; p < name.children.length; p++) {
            datasets[p - 1] = {
                label: name.children[p].innerHTML,
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
            options: { scales: { x: { beginAtZero: true }, y: { beginAtZero: true } } }
        });
    }

    function updateScore() {
        let num = scores.childElementCount;
        let sum = [];
        for (let p = 1; p < name.children.length; p++) {
            sum[p - 1] = 0;
            datasets[p - 1].label = name.children[p].innerHTML;
        }
        for (let s = 0; s < num; s++) {
            labels[s] = s;
            for (let p = 1; p < name.children.length; p++) {
                let val = parseInt(((s < num) ? scores.children[num - s - 1] : input).children[p].innerHTML)
                if (Number.isInteger(val)) {
                    sum[p - 1] += val;
                    datasets[p - 1].data[s] = sum[p - 1];
                } else {
                    datasets[p - 1].data[s] = undefined;
                }
            }
        }
        for (let p = 1; p < name.children.length; p++) {
            score.children[p].innerHTML = sum[p - 1];
        }
        chart.update();
    }

};