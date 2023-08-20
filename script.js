
window.addEventListener("DOMContentLoaded",_loaded);

function _loaded( ) {

    let selected;
    let players = 2;
    let chart;
    let labels = [ ];
    let datasets = [ ];

    let name = document.getElementById("name");
    let score = document.getElementById("score");
    let input = document.getElementById("input");
    let scores = document.getElementById("scores");
                                            
    window.onclick = function _losefocus(evt, cancel = true) {
        if ((selected !== undefined) && (evt.target != selected)) {
            selected.close(false);
        }
    }

    function _setup(cell) {
        cell.onkeydown = function _keydown(evt) {
            if ((evt.key=="Enter") || (evt.key=="Tab")) {
                return this.close(true);
            } else if (evt.key=="Escape") {
                return this.close(false);
            }
        };
        cell.close = function _close(ok) {
            if (this.oldValue != undefined) {
                if (! ok) {
                    this.innerHTML = this.oldValue;
                }
                this.contentEditable = false;
                this.oldValue = undefined;
                
                if((selected.parentNode == input) && ok && Number.isInteger(parseInt(this.innerHTML))) {
                    if (selected.nextElementSibling) {
                        selected.nextElementSibling.click();
                    } else {
                        let row = input.outerHTML;
                        row = row.replaceAll("</th>", "</td>");
                        row = row.replaceAll("<th", "<td");
                        scores.innerHTML = row + scores.innerHTML;
                        input.children[0].innerHTML = scores.childElementCount;
                        for (let p = 1; p <= players; p ++) {
                            let num = parseInt(input.children[p].innerHTML);
                            if (!Number.isInteger(num)) num = 0; 
                            score.children[p].innerHTML = num + parseInt(score.children[p].innerHTML);
                            input.children[p].innerHTML = "";
                        }
                        input.children[1].click();
                    }
                    this.blur();
                }
                updateChart();
                return false;
            }
        }
        cell.onclick = function _click(evt) { 
            if (this.oldValue == undefined) {
                this.oldValue = this.innerHTML;
                this.contentEditable = true;
                this.focus();
                selected = this;
            }
        }
    }

    function initChart() {
        let ctx = document.getElementById('scoreChart').getContext('2d');
        for (let p = 0; p < players; p ++) {
            datasets[p] = { label: name.children[p+1].innerHTML, fill: false, tension: 0.1, data: [ 0 ] };
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: { scales: {  x: { beginAtZero: true }, y: { beginAtZero: true } } }
        } );
    };
    
    function updateChart() {
        let num = scores.childElementCount;
        let sum = [ ];
        for (let p = 0; p < players; p ++) {
            sum[p] = 0;
            datasets[p].label = name.children[p+1].innerHTML;
        }
        for (let s = 0; s <= num; s++) {
            labels[s] = s;
            for (let p = 0; p < players; p ++) {
                let val = parseInt( ((s < num) ? scores.children[num-s-1] : input).children[p+1].innerHTML)
                if (Number.isInteger(val)) {
                    sum[p] += val;
                    datasets[p].data[s] = sum[p];
                } else { 
                    datasets[p].data[s] = undefined;
                }
            }
        }
        chart.update();
    };
    
    for (let cell of document.querySelectorAll(".editable")) {
        _setup(cell);
    }
    initChart();
    input.children[1].click();
};

