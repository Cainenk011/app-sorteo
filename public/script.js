document.addEventListener('DOMContentLoaded', () => {
    let participantes = [];
    const ITEMS_PER_PAGE = 50;
    let currentPage = 1, resultCurrentPage = 1;
    let sorteoResultados = [];

    // elementos DOM - Verificar que todos los elementos estén correctamente seleccionados
    const nameInput = document.getElementById('name-input'); // Puede que esto no exista en tu HTML actual
    const addBtn = document.getElementById('add-btn'); // Puede que esto no exista en tu HTML actual
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
    const resultPagination = document.getElementById('result-pagination'); // Puede que esto no exista en tu HTML

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
            
            // Botón de eliminar
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
        
        // Verificar si hay resultados
        console.log("Mostrando resultados. Total:", sorteoResultados.length);
        
        // Modificado para mostrar solo 8 elementos
        for (let i = 0; i < 8 && i < sorteoResultados.length; i++) {
            const li = document.createElement('li');
            
            // Clasificar como TITULAR o SUPLENTE
            let estado = i < 3 ? "TITULAR" : "SUPLENTE";
            
            li.textContent = `${estado}: ${sorteoResultados[i]}`;
            console.log(`Agregando ${estado}: ${sorteoResultados[i]}`);
            
            // Agregar clase CSS para estilizar diferente según tipo
            li.className = i < 3 ? 'titular' : 'suplente';
            
            resultList.appendChild(li);
        }
        
        // Revisar si resultPagination existe antes de intentar ocultarlo
        if (resultPagination) {
            console.log("Ocultando paginación de resultados");
            resultPagination.style.display = 'none';
        } else {
            console.log("El elemento resultPagination no existe");
        }
        
        // Asegurar que la sección de resultados sea visible
        resultSection.style.display = 'block';
    }

    // Agregar participante (si existe el campo en el HTML)
    function agregarParticipante() {
        if (!nameInput) return; // Salir si no existe el elemento
        
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

    // Cargar participantes desde JSON
    function cargarDesdeJson() {
        const jsonText = jsonInput.value.trim();
        if (!jsonText) {
            alert('Por favor, introduce datos JSON válidos.');
            return;
        }

        loadingIndicator.style.display = 'block';
        loadJsonBtn.disabled = true;

        // Usar setTimeout para permitir que la UI se actualice antes de procesar
        setTimeout(() => {
            try {
                let datosJSON;
                
                try {
                    // Intentar analizar como array JSON
                    datosJSON = JSON.parse(jsonText);
                } catch (e) {
                    // Si falla, intentar limpiar el string y analizar de nuevo
                    const cleanedText = jsonText
                        .replace(/\n/g, '')
                        .replace(/\r/g, '')
                        .replace(/\t/g, '')
                        .replace(/\\/g, '\\\\')
                        .replace(/(")?([a-zA-Z0-9_]+)(")?:/g, '"$2":'); // Asegurarse que las claves tengan comillas
                    datosJSON = JSON.parse(cleanedText);
                }
                
                // Verificar estructura y transformar datos si es necesario
                if (Array.isArray(datosJSON)) {
                    // Si es un array, comprobar si son strings o objetos
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
                                    // Añadir espacio solo si ya hay un nombre
                                    if (nombreCompleto) nombreCompleto += ' ';
                                    nombreCompleto += item.apellido;
                                }
                                
                                // Agregar DNI si existe con el nuevo formato
                                if (item.dni) {
                                    // Añadir espacio solo si hay texto previo
                                    if (nombreCompleto) nombreCompleto += ' ';
                                    nombreCompleto += `-- DNI: ${item.dni}`;
                                }
                                
                                // Si no se encontró ningún campo específico, usar propiedades genéricas
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
                    // Si es un objeto, intentamos extraer valores
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
        // Algoritmo Fisher-Yates para mezclar eficientemente
        const participantesAleatorios = [...participantes];
        let currentIndex = participantesAleatorios.length;
    
        // Mientras queden elementos a mezclar
        while (currentIndex !== 0) {
            // Elegir un elemento restante
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
    
            // Intercambiar con el elemento actual
            [participantesAleatorios[currentIndex], participantesAleatorios[randomIndex]] = 
            [participantesAleatorios[randomIndex], participantesAleatorios[currentIndex]];
        }
        
        sorteoResultados = participantesAleatorios;
        console.log("Sorteo completado. Resultados:", sorteoResultados);
        resultCurrentPage = 1;
        mostrarResultados();
        resultSection.style.display = 'block';
        
        // Desplazar hacia abajo para ver resultados
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Event listeners - Asegurarse de que los botones tengan sus listeners correctamente añadidos
    if (addBtn) { // Solo si existe el botón
        addBtn.addEventListener('click', agregarParticipante);
    }
    
    if (nameInput) { // Solo si existe el campo de entrada
        nameInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                agregarParticipante();
            }
        });
    }
    
    // Asegurarse de que los botones tengan sus listeners
    sortearBtn.addEventListener('click', realizarSorteo);
    
    // Verificar que estos botones existan antes de añadir event listeners
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', limpiarTodos);
        console.log("Botón 'Borrar todos' inicializado correctamente");
    } else {
        console.error("El botón 'Borrar todos' no se encuentra en el DOM");
    }
    
    if (loadJsonBtn) {
        loadJsonBtn.addEventListener('click', cargarDesdeJson);
        console.log("Botón 'Cargar docentes' inicializado correctamente");
    } else {
        console.error("El botón 'Cargar docentes' no se encuentra en el DOM");
    }
    
    // Añadir console.log para depuración
    console.log("Script inicializado. Estado de los botones:");
    console.log("- Sortear:", sortearBtn ? "Encontrado" : "No encontrado");
    console.log("- Cargar docentes:", loadJsonBtn ? "Encontrado" : "No encontrado");
    console.log("- Borrar todos:", clearAllBtn ? "Encontrado" : "No encontrado");
    
    // Inicializar UI
    actualizarListaParticipantes();
});
