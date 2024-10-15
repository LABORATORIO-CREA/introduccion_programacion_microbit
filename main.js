columnas = []; 
valores = {};

document.getElementById('datos').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    columnas = [];
    valores = {};
    reader.onload = function(e) {
        const text = e.target.result;
        const data = parseCSV(text);
        console.log(data);
        displayTable(data);
        createBarChart(data);
    };
    
    reader.readAsText(file);
});


function parseCSV(text) {
    const rows = text.split('\n')
    for (let i = 0; i < rows.length-1; i++) {
        valores[i] = rows[i].split(',').slice(1);
    }
    // console.log(valores);
    return valores;
}

function displayTable(data) {
    const tableHeader = document.getElementById('header');
    const tableBody = document.getElementById('body');

    // Limpiar la tabla antes de añadir nuevos datos
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    const headers = data[0];
    // console.log(headers)

    for (let i = 0; i < headers.length; i++) {
        const th = document.createElement('th');
        th.textContent = headers[i];
        tableHeader.appendChild(th);
    }

    for (let i = 1; i < Object.keys(data).length; i++) {  // Recorre cada fila (objeto en "data")
        const tr = document.createElement('tr');
        for (let j = 0; j < data[i].length; j++) {  // Recorre cada valor en la fila (columna en "data")
            const td = document.createElement('td');
            td.textContent = data[i][j];  // Accede al valor de la fila y columna actual
            tr.appendChild(td);
        }
        tableBody.appendChild(tr);
    }
    

}

function createBarChart() {
    const ctx = document.getElementById('grafico').getContext('2d');

    const horas = [];
    const distancias = [];

    // Recorremos el objeto "valores" para llenar los arrays
    for (let i = 0; i < Object.keys(valores).length; i++) {
        horas.push(valores[i][1]);
        distancias.push(parseFloat(valores[i][0]));
    }

    // Crear el gráfico de barras
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: horas,  // Etiquetas para el eje X (horas)
            datasets: [{
                label: 'Distancia',
                data: distancias,  // Valores para el eje Y (distancia)
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Hora'  // Etiqueta para el eje X
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distancia (m)'  // Etiqueta para el eje Y
                    }
                }
            }
        }
    });
}


