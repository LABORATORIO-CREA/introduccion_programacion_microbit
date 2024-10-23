// Variables globales
let columnas = []; 
let valores = {};
let myChart = null; // Variable para almacenar la instancia de la gráfica

// Evento que se dispara al cambiar el archivo en el input
document.getElementById('datos').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return; // Verifica si se ha seleccionado un archivo

    const reader = new FileReader();
    columnas = [];
    valores = {};

    reader.onload = function(e) {
        const text = e.target.result;
        const data = parseCSV(text);
        console.log(data);
        displayTable(data);
        createBarChart(); // Crea o actualiza la gráfica
    };
    
    reader.readAsText(file);
});

// Función para parsear el CSV
function parseCSV(text) {
    const rows = text.trim().split('\n');
    const headers = rows[0].split(','); // Asume que la primera fila son los encabezados
    columnas = headers.slice(1); // Guarda las columnas excepto la primera

    for (let i = 1; i < rows.length; i++) { // Comienza en 1 para saltar los encabezados
        const fila = rows[i].split(',').map(item => item.trim());
        if (fila.length < 2) continue; // Salta filas que no tengan suficientes columnas
        valores[i - 1] = fila.slice(1); // Guarda los valores excepto el primero
    }
    return valores;
}

// Función para mostrar los datos en una tabla HTML
function displayTable(data) {
    const tableHeader = document.getElementById('header');
    const tableBody = document.getElementById('body');

    // Limpiar la tabla antes de añadir nuevos datos
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    // Crear los encabezados de la tabla
    columnas.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tableHeader.appendChild(th);
    });

    // Crear las filas de la tabla, limitadas a las primeras 35 filas
    Object.keys(data).forEach((key, index) => {
        if (index >= 35) return; // Limita a 35 filas
        const tr = document.createElement('tr');
        data[key].forEach(valor => {
            const td = document.createElement('td');
            td.textContent = valor;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Función para crear o actualizar la gráfica de barras
function createBarChart() {
    const ctx = document.getElementById('grafico').getContext('2d');

    const horas = [];
    const distancias = [];

    // Recorremos el objeto "valores" para llenar los arrays
    for (let i = 0; i < Object.keys(valores).length; i++) {
        // Asegúrate de que los índices existan para evitar errores
        if (valores[i] && valores[i].length >= 2) {
            horas.push(valores[i][1]); // Asume que la segunda columna es 'hora'
            distancias.push(parseFloat(valores[i][0])); // Asume que la primera columna es 'distancia'
        }
    }

    // Si ya existe una gráfica, destrúyela antes de crear una nueva
    if (myChart) {
        myChart.destroy();
    }

    // Crear la nueva gráfica y asignarla a 'myChart'
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: horas,  // Etiquetas para el eje X (horas)
            datasets: [{
                label: 'Cantidad',
                data: distancias,  // Valores para el eje Y (distancia)
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, // Hace que la gráfica sea responsive
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
                        text: 'Cantidad'  // Etiqueta para el eje Y
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Gráfica de Barras'
                }
            }
        }
    });

    // Agregar el evento de clic al canvas para abrir la gráfica en una nueva pestaña
    const canvas = document.getElementById('grafico');
    canvas.style.cursor = 'pointer'; // Cambia el cursor para indicar que es clickeable

    canvas.addEventListener('click', function() {
        // Extraer los datos y opciones de la gráfica actual
        const chartData = myChart.data;
        const chartOptions = myChart.options;

        // Serializar los datos y opciones a formato JSON
        const chartDataStr = JSON.stringify(chartData);
        const chartOptionsStr = JSON.stringify(chartOptions);

        // Abrir una nueva ventana
        const newWindow = window.open('', '_blank');

        // Verificar si la ventana se abrió correctamente
        if (newWindow) {
            // Escribir el contenido HTML en la nueva ventana
            newWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Gráfica en Nueva Pestaña</title>
                    <!-- Incluir Chart.js desde CDN -->
                    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f5f5f5;
                        }
                        canvas {
                            max-width: 90%;
                            max-height: 90%;
                        }
                    </style>
                </head>
                <body>
                    <canvas id="graficoNuevo"></canvas>
                    <script>
                        // Parsear los datos y opciones recibidos
                        const data = ${chartDataStr};
                        const options = ${chartOptionsStr};

                        // Obtener el contexto del canvas
                        const ctx = document.getElementById('graficoNuevo').getContext('2d');

                        // Crear la nueva gráfica
                        new Chart(ctx, {
                            type: data.datasets[0].type || 'bar', // Asegurarse del tipo de gráfica
                            data: data,
                            options: options
                        });
                    </script>
                </body>
                </html>
            `);

            // Cerrar el documento para asegurar que se renderice
            newWindow.document.close();
        } else {
            alert('No se pudo abrir la nueva pestaña. Por favor, verifica que el bloqueador de ventanas emergentes esté desactivado.');
        }
    }, { once: true }); // Opcional: Usa { once: true } si deseas que el evento se ejecute solo una vez
    
}
