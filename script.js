
"use strict";

window.onload = function _onload() {
    let chart = undefined;
    let labels = [];
    let datasets = [];
    let input;
    
    const table = document.getElementById('table');
    const scores = document.getElementById('scores');
    const time = document.getElementById("time");
    const name = document.getElementById("name");
    const score = document.getElementById("score");
    feather.replace();

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
    
    resetPlayers();
    
    window.onunload = function _onunload() {
        document.cookie = cookieTag + JSON.stringify(names);
    }
    
    window.setPlayers = resetPlayers;
    
    function resetPlayers(n) {
        if (n !== undefined) {
            names.length = Math.max(1, names.length + n);
        }
        let newCell = document.createElement("TH");
        name.replaceChildren(name.firstElementChild);
        // time.replaceChildren((time.firstElementChild);
        score.replaceChildren(score.firstElementChild);
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
        let newCell = e.target;
        if (!newCell.hasAttribute("edittype")) {
            newCell = undefined;
        }
        if (input !== undefined) {
            input.blur()
            let oldCell = input.parentNode;
            oldCell.textContent = input.value;
            input = undefined;
            nextCell(oldCell); // mekes sure there is new round 
            updateScore();
        }
        if (newCell) {
            makeCellEditable(newCell);
        } else { 
            e.preventDefault();
        }
    });
     
    function nextEmptyCell(cell) {
        if (cell === undefined) return;
        let nextCell = cell;
        while (nextCell) {
            const value = parseInt(nextCell.textContent);
            const isEmpty = !Number.isInteger(value)
            if (nextCell.hasAttribute("edittype") && isEmpty)
                return nextCell;
            nextCell = nextCell.nextElementSibling;
        } 
        nextCell = cell;
        while (nextCell) {
            const value = parseInt(nextCell.textContent);
            const isEmpty = !Number.isInteger(value)
            if (nextCell.hasAttribute("edittype") && isEmpty)
                return nextCell;
            nextCell = nextCell.previousElementSibling;
        }
        return nextCell;
    }

    function nextTableCell(cell) {
        if (cell === undefined) return;
        let nextCell = cell.nextElementSibling;
        do {
            while (nextCell) {
                if (nextCell.hasAttribute("edittype"));
                    return nextCell;
                nextCell = nextCell.nextElementSibling;
            } 
            if (cell.parentNode.nextElementSibling) {
                nextCell = nextCell.firstElementChild;
            }
        } while (nextCell);
        return nextCell;
    }
    
    function nextCell(cell) {
        let nextCell;
        if (cell.parentNode === scores.firstElementChild) {
            nextCell = nextEmptyCell(cell);
            if (!nextCell) {   
                const numRows = scores.rows.length;
                const newRow = scores.insertRow(0);
                const newCell = newRow.insertCell();
                newCell.textContent = "Round " + (numRows+1);
                for (let p = 0; p < names.length; p++) {
                    const newCell = newRow.insertCell();
                    newCell.setAttribute("edittype", "number");
                }
                nextCell = newRow.children[1];
            }
        } else {
            nextCell = nextTableCell()
        }
        return nextCell;
    }
    
    function makeCellEditable(cell) {
        if ((cell === undefined) || !cell.hasAttribute("edittype")) return;
        input = document.createElement('input');
        input.oldValue = cell.textContent;
        input.value = input.oldValue;
        input.type = cell.getAttribute("edittype");
        if(input.type === "number") {
            input.pattern = "[0-9]*";
        }
        cell.replaceChildren(input);
        input.focus();
        input.addEventListener('keydown', function _keydown(e) {
            if ((e.key === 'Enter') || (e.key === 'Tab')) {
                e.preventDefault();
                input.blur()
                cell.textContent = input.value;
                input = undefined;
                makeCellEditable(nextCell(cell));
                updateScore();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                input.value = input.oldValue;
                
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
                } else if (s + 1 < num) {
                    datasets[p].data[s] = sum[p];
                }
            }
        }
        for (let p = 0; p < names.length; p++) {
            score.children[p+1].innerHTML = sum[p];
        }
        chart.update();
    }

};