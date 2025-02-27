document.addEventListener('DOMContentLoaded', () => {
    let participantes = [];
    const ITEMS_PER_PAGE = 50;
    let currentPage = 1, resultCurrentPage = 1;
    let sorteoResultados = [];

    // elementos DOM
    const nameInput = document.getElementById('name-input');
    const addBtn = document.getElementById('add-btn');
    const namesContainer = document.getElementById('names-container');
    const participantCount = document.getElementById('participant-count');
    const paginationContainer = document.getElementById('pagination-container');
    const sortearBtn = document.getElementById('sortear-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const jsonInput = document.getElementById('json-input');
    const loadJsonBtn = document.getElementById('load-json-btn');
    const loadingIndicator = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');
    const resultList = document.getElementById('result-list');
    const resultPagination = document.getElementById('result-pagination');

    // Actualiza participantes
    function actualizarContadorParticipantes() {
        participantCount.textContent = `${participantes.length} participante${participantes.length !== 1 ? 's' : ''}`;
    }

    // Paginación
    function crearPaginacion(container, totalItems, itemsPerPage, currentPageVar, callback) {
        container.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        
        // Botón anterior
        if (currentPageVar > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '«';
            prevBtn.onclick = () => {
                if (container === paginationContainer) {
                    currentPage--;
                } else {
                    resultCurrentPage--;
                }
                callback();
            };
            container.appendChild(prevBtn);
        }
        
        // Rango de páginas a mostrar
        let startPage = Math.max(1, currentPageVar - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Botones
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === currentPageVar ? 'active' : '';
            pageBtn.onclick = () => {
                if (container === paginationContainer) {
                    currentPage = i;
                } else {
                    resultCurrentPage = i;
                }
                callback();
            };
            container.appendChild(pageBtn);
        }
        
        // Botón siguiente
        if (currentPageVar < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = '»';
            nextBtn.onclick = () => {
                if (container === paginationContainer) {
                    currentPage++;
                } else {
                    resultCurrentPage++;
                }
                callback();
            };
            container.appendChild(nextBtn);
        }
    }

    // Actualiza la lista de participantes
    function actualizarListaParticipantes() {
        namesContainer.innerHTML = '';
        actualizarContadorParticipantes();
        sortearBtn.disabled = participantes.length < 2;
        
        if (participantes.length === 0) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, participantes.length);
        
        for (let i = startIdx; i < endIdx; i++) {
            const participant = participantes[i];
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            
            // Crear el contenido del nombre
            const nameText = document.createElement('span');
            nameText.className = 'name-text';
            nameText.textContent = participant;
            nameItem.appendChild(nameText);
            
            // Btn eliminar
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.onclick = () => eliminarParticipante(i);
            nameItem.appendChild(deleteBtn);
            
            namesContainer.appendChild(nameItem);
        }
        
        crearPaginacion(paginationContainer, participantes.length, ITEMS_PER_PAGE, currentPage, actualizarListaParticipantes);
    }

    // Mostrar resultados del sorteo
    function mostrarResultados() {
        resultList.innerHTML = '';
        
        const startIdx = (resultCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, sorteoResultados.length);
        
        for (let i = startIdx; i < 6; i++) {
            const li = document.createElement('li');
            li.textContent = sorteoResultados[i] + " ---> SUPLENTE";
            if(i<3){
                li.textContent = sorteoResultados[i] + " ---> TITULAR";
            }
            
            resultList.appendChild(li);
        }
        
        //crearPaginacion(resultPagination, sorteoResultados.length, ITEMS_PER_PAGE, resultCurrentPage, mostrarResultados);
    }

    // Agregar participante
    function agregarParticipante() {
        const nombre = nameInput.value.trim();
        if (nombre !== '') {
            participantes.push(nombre);
            nameInput.value = '';
            // Si hay muchos participantes, vamos a la última página
            if (participantes.length > ITEMS_PER_PAGE) {
                currentPage = Math.ceil(participantes.length / ITEMS_PER_PAGE);
            }
            actualizarListaParticipantes();
        }
    }

    // Eliminar participante
    function eliminarParticipante(index) {
        const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
        participantes.splice(actualIndex, 1);
        
        // Ajustar página actual si es necesario
        const maxPage = Math.max(1, Math.ceil(participantes.length / ITEMS_PER_PAGE));
        if (currentPage > maxPage) {
            currentPage = maxPage;
        }
        
        actualizarListaParticipantes();
        resultSection.style.display = 'none';
    }

    // Limpiar todos los participantes
    function limpiarTodos() {
        // Confirmar antes de borrar todos
        if (participantes.length > 0) {
            if (confirm('¿Estás seguro de querer eliminar todos los participantes?')) {
                participantes = [];
                currentPage = 1;
                actualizarListaParticipantes();
                resultSection.style.display = 'none';
            }
        }
    }

    // manejo de objetos-se extrae el contenido del json
    function cargarDesdeJson() {
        const jsonText = jsonInput.value.trim(); //si esta vacio detenemos y mostramos alerta
        if (!jsonText) {
            alert('Por favor, introduce datos JSON válidos.');
            return;
        }

        loadingIndicator.style.display = 'block';
        loadJsonBtn.disabled = true;

        setTimeout(() => {
            try {
                let datosJSON;
                
                try {
                    // Intentar analizar como array JSON
                    datosJSON = JSON.parse(jsonText);
                } catch (e) {
                    // Si falla limpia el string y analizar de nuevo
                    const cleanedText = jsonText
                        .replace(/\n/g, '')
                        .replace(/\r/g, '')
                        .replace(/\t/g, '')
                        .replace(/\\/g, '\\\\')
                        .replace(/(")?([a-zA-Z0-9_]+)(")?:/g, '"$2":'); 
                    datosJSON = JSON.parse(cleanedText);
                }
                
                if (Array.isArray(datosJSON)) {
                   
                    if (datosJSON.length > 0) {
                        if (typeof datosJSON[0] === 'string') {
                            // Es un array de strings, lo usamos directamente
                            participantes = datosJSON;
                        } else if (typeof datosJSON[0] === 'object') {
                            // Es un array de objetos, extraemos nombre, apellido y dni para cada participante
                            participantes = datosJSON.map(item => {
                                // Formato específico para nombre, apellido y DNI
                                let nombreCompleto = '';
                                
                                // Agregar nombre si existe
                                if (item.nombre) {
                                    nombreCompleto += item.nombre;
                                }
                                
                                // Agregar apellido si existe
                                if (item.apellido) {
                                    if (nombreCompleto) nombreCompleto += ' ';
                                    nombreCompleto += item.apellido;
                                }
                                
                                // Agregar DNI si existe
                                if (item.dni) {
                                    // Añadir espacio solo si hay texto previo
                                    if (nombreCompleto) nombreCompleto += ' ';
                                    nombreCompleto += ` -- DNI: ${item.dni}`;
                                }
                                
                                if (!nombreCompleto) {
                                    const parts = [];
                                    for (const key in item) {
                                        if (typeof item[key] === 'string' || typeof item[key] === 'number') {
                                            parts.push(`${key}: ${item[key]}`);
                                        }
                                    }
                                    nombreCompleto = parts.join(' ');
                                }
                                
                                return nombreCompleto;
                            });
                        }
                    }
                } else if (typeof datosJSON === 'object' && datosJSON !== null) {
                    // Si es un objeto extraemos valores
                    participantes = Object.values(datosJSON)
                        .filter(val => typeof val === 'string' || typeof val === 'number')
                        .map(val => String(val));
                }
                
                // Actualizar UI
                currentPage = 1;
                actualizarListaParticipantes();
                jsonInput.value = '';
                alert(`Se han cargado correctamente ${participantes.length} participantes.`);
            } catch (error) {
                console.error('Error al procesar JSON:', error);
                alert(`Error al procesar JSON: ${error.message}. Por favor, verifica el formato.`);
            } finally {
                loadingIndicator.style.display = 'none';
                loadJsonBtn.disabled = false;
            }
        }, 100);
    }

    // Realizar sorteo
    function realizarSorteo() {
        const participantesAleatorios = [...participantes];
        let currentIndex = participantesAleatorios.length;


        while (currentIndex !== 0) {

            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [participantesAleatorios[currentIndex], participantesAleatorios[randomIndex]] = 
            [participantesAleatorios[randomIndex], participantesAleatorios[currentIndex]];
        }
        
        sorteoResultados = participantesAleatorios;
        resultCurrentPage = 1;
        mostrarResultados();
        resultSection.style.display = 'block';
        
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    addBtn.addEventListener('click', agregarParticipante);
    nameInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            agregarParticipante();
        }
    });
    sortearBtn.addEventListener('click', realizarSorteo);
    clearAllBtn.addEventListener('click', limpiarTodos);
    loadJsonBtn.addEventListener('click', cargarDesdeJson);
    
    // Inicializar UI
    actualizarListaParticipantes();
});
