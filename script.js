/* ==========================================
   SCRIPT.JS - ORGANIZADOR ESTUDIANTIL
   Calendario, actividades, pendientes,
   productividad y recomendaciones musicales
   ========================================== */

"use strict";

/* ==========================================
   CONFIGURACION Y ALMACENAMIENTO
   ========================================== */

const STORAGE_KEY = "organizadorEstudiantil";

const actividadesIniciales = [
    {
        id: 1,
        titulo: "Clase de Matemáticas",
        tipo: "escolar",
        fecha: obtenerFechaLocal(),
        hora: "08:00",
        duracion: 90,
        prioridad: "alta",
        completada: false
    },
    {
        id: 2,
        titulo: "Estudiar para el examen",
        tipo: "escolar",
        fecha: obtenerFechaLocal(),
        hora: "12:00",
        duracion: 60,
        prioridad: "alta",
        completada: false
    },
    {
        id: 3,
        titulo: "Entrenamiento en el gimnasio",
        tipo: "personal",
        fecha: obtenerFechaLocal(),
        hora: "17:00",
        duracion: 90,
        prioridad: "media",
        completada: false
    },
    {
        id: 4,
        titulo: "Realizar tarea pendiente",
        tipo: "escolar",
        fecha: obtenerFechaLocal(),
        hora: "19:00",
        duracion: 60,
        prioridad: "alta",
        completada: false
    }
];

let actividades = cargarActividades();
let fechaSeleccionada = obtenerFechaLocal();
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

let notificacionesEnviadas = new Set();

/* ==========================================
   FUNCIONES DE FECHA Y HORA
   ========================================== */

function obtenerFechaLocal(fecha = new Date()) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function convertirFecha(fechaTexto) {
    const [anio, mes, dia] = fechaTexto.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
}

function convertirMinutos(hora) {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
}

function formatearHora(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function obtenerHoraActual() {
    return new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function obtenerSaludo() {
    const hora = new Date().getHours();

    if (hora < 12) return "¡Buenos días!";
    if (hora < 19) return "¡Buenas tardes!";

    return "¡Buenas noches!";
}

/* ==========================================
   LOCAL STORAGE
   ========================================== */

function cargarActividades() {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);

        if (datos !== null) {
            const resultado = JSON.parse(datos);

            if (Array.isArray(resultado)) {
                return resultado;
            }
        }
    } catch (error) {
        console.error("Error al cargar actividades:", error);
    }

    return actividadesIniciales.map(actividad => ({
        ...actividad
    }));
}

function guardarActividades() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(actividades)
        );
    } catch (error) {
        console.error("Error al guardar actividades:", error);
    }
}

/* ==========================================
   UTILIDADES DE LA INTERFAZ
   ========================================== */

function buscarElemento(...selectores) {
    for (const selector of selectores) {
        const elemento = document.querySelector(selector);

        if (elemento) return elemento;
    }

    return null;
}

function escaparHTML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function mostrarMensaje(mensaje, tipo = "success") {
    const contenedor = buscarElemento(
        "#notificaciones",
        "#notifications",
        ".notifications-container"
    );

    if (!contenedor) {
        console.log(mensaje);
        return;
    }

    const alerta = document.createElement("div");

    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");

    const contenido = document.createElement("span");
    contenido.textContent = mensaje;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn-close";
    boton.setAttribute("aria-label", "Cerrar");

    boton.addEventListener("click", () => alerta.remove());

    alerta.append(contenido, boton);
    contenedor.prepend(alerta);

    setTimeout(() => alerta.remove(), 5000);
}

/* ==========================================
   BIENVENIDA Y RELOJ
   ========================================== */

function actualizarBienvenida() {
    const saludo = buscarElemento(
        "#saludo",
        "#welcome-message",
        "#mensajeBienvenida"
    );

    const fecha = buscarElemento(
        "#fechaActual",
        "#current-date"
    );

    const reloj = buscarElemento(
        "#reloj",
        "#horaActual",
        "#current-time"
    );

    if (saludo) {
        saludo.textContent = obtenerSaludo();
    }

    if (fecha) {
        fecha.textContent = new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    if (reloj) {
        reloj.textContent = obtenerHoraActual();
    }
}

/* ==========================================
   GESTION DE ACTIVIDADES
   ========================================== */

function agregarActividad(datos) {
    const titulo = String(datos.titulo || "").trim();
    const fecha = datos.fecha;
    const hora = datos.hora;

    if (!titulo || !fecha || !hora) {
        mostrarMensaje(
            "Completa el nombre, la fecha y la hora.",
            "warning"
        );
        return false;
    }

    const duracion = Number(datos.duracion) || 60;

    if (duracion <= 0 || duracion > 1440) {
        mostrarMensaje("La duración no es válida.", "warning");
        return false;
    }

    const nuevaActividad = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        titulo,
        tipo: datos.tipo || "personal",
        fecha,
        hora,
        duracion,
        prioridad: datos.prioridad || "media",
        completada: false
    };

    actividades.push(nuevaActividad);

    guardarActividades();
    actualizarInterfaz();

    mostrarMensaje("Actividad agregada correctamente.");

    return true;
}

function eliminarActividad(id) {
    actividades = actividades.filter(
        actividad => actividad.id !== Number(id)
    );

    guardarActividades();
    actualizarInterfaz();

    mostrarMensaje("Actividad eliminada.");
}

function completarActividad(id) {
    const actividad = actividades.find(
        item => item.id === Number(id)
    );

    if (!actividad) return;

    actividad.completada = !actividad.completada;

    guardarActividades();
    actualizarInterfaz();
}

function obtenerActividadesPorFecha(fecha) {
    return actividades
        .filter(actividad => actividad.fecha === fecha)
        .sort((a, b) =>
            convertirMinutos(a.hora) - convertirMinutos(b.hora)
        );
}

/* ==========================================
   DETECCION DE CONFLICTOS DE HORARIO
   ========================================== */

function detectarConflictos() {
    const conflictos = [];

    const fechas = [...new Set(
        actividades
            .filter(actividad => !actividad.completada)
            .map(actividad => actividad.fecha)
    )];

    fechas.forEach(fecha => {
        const actividadesDia = obtenerActividadesPorFecha(fecha)
            .filter(actividad => !actividad.completada);

        for (let i = 0; i < actividadesDia.length; i++) {
            for (let j = i + 1; j < actividadesDia.length; j++) {
                const primera = actividadesDia[i];
                const segunda = actividadesDia[j];

                const inicioPrimera = convertirMinutos(primera.hora);
                const finPrimera = inicioPrimera + primera.duracion;

                const inicioSegunda = convertirMinutos(segunda.hora);
                const finSegunda = inicioSegunda + segunda.duracion;

                if (
                    inicioPrimera < finSegunda &&
                    inicioSegunda < finPrimera
                ) {
                    conflictos.push({
                        fecha,
                        primera,
                        segunda
                    });
                }
            }
        }
    });

    return conflictos;
}

/* ==========================================
   CALENDARIO MENSUAL
   ========================================== */

function renderizarCalendario() {
    const contenedor = buscarElemento(
        "#calendar-grid",
        "#calendarGrid",
        "#calendarioDias"
    );

    if (!contenedor) return;

    const tituloMes = buscarElemento(
        "#calendar-month",
        "#calendarMonth",
        "#mesActual"
    );

    const primerDia = new Date(anioActual, mesActual, 1);
    const diasMes = new Date(
        anioActual,
        mesActual + 1,
        0
    ).getDate();

    const desplazamiento = (primerDia.getDay() + 6) % 7;

    if (tituloMes) {
        tituloMes.textContent = primerDia.toLocaleDateString("es-MX", {
            month: "long",
            year: "numeric"
        });
    }

    contenedor.innerHTML = "";

    for (let i = 0; i < desplazamiento; i++) {
        const espacio = document.createElement("div");
        espacio.className = "calendar-empty";
        contenedor.appendChild(espacio);
    }

    for (let dia = 1; dia <= diasMes; dia++) {
        const fecha = obtenerFechaLocal(
            new Date(anioActual, mesActual, dia)
        );

        const eventos = obtenerActividadesPorFecha(fecha);

        const celda = document.createElement("div");
        celda.className = "calendar-day";

        if (fecha === obtenerFechaLocal()) {
            celda.classList.add("today");
        }

        if (fecha === fechaSeleccionada) {
            celda.classList.add("selected");
        }

        celda.setAttribute("role", "button");
        celda.setAttribute("tabindex", "0");
        celda.setAttribute("aria-label", `Seleccionar ${fecha}`);

        const numero = document.createElement("strong");
        numero.textContent = dia;

        celda.appendChild(numero);

        eventos.slice(0, 2).forEach(evento => {
            const etiqueta = document.createElement("div");

            etiqueta.className =
                `calendar-event evento-${evento.tipo}`;

            etiqueta.textContent = evento.titulo;

            celda.appendChild(etiqueta);
        });

        if (eventos.length > 2) {
            const extra = document.createElement("small");
            extra.textContent = `+${eventos.length - 2} más`;
            celda.appendChild(extra);
        }

        const seleccionar = () => {
            fechaSeleccionada = fecha;
            renderizarCalendario();
            renderizarItinerario();
        };

        celda.addEventListener("click", seleccionar);

        celda.addEventListener("keydown", evento => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                seleccionar();
            }
        });

        contenedor.appendChild(celda);
    }
}

function cambiarMes(direccion) {
    const nuevaFecha = new Date(
        anioActual,
        mesActual + direccion,
        1
    );

    mesActual = nuevaFecha.getMonth();
    anioActual = nuevaFecha.getFullYear();

    renderizarCalendario();
}

/* ==========================================
   ITINERARIO DIARIO
   ========================================== */

function renderizarItinerario() {
    const contenedor = buscarElemento(
        "#itinerario",
        "#schedule-list",
        "#listaItinerario"
    );

    if (!contenedor) return;

    const actividadesDia = obtenerActividadesPorFecha(
        fechaSeleccionada
    );

    if (actividadesDia.length === 0) {
        contenedor.innerHTML = `
            <p class="text-muted text-center">
                No tienes actividades programadas para este día.
            </p>
        `;
        return;
    }

    contenedor.innerHTML = actividadesDia.map(actividad => {
        const horaFin = formatearHora(
            convertirMinutos(actividad.hora) +
            actividad.duracion
        );

        return `
            <div class="schedule-item actividad-${escaparHTML(actividad.tipo)}">
                <div class="schedule-time">
                    ${escaparHTML(actividad.hora)}
                    <br>
                    <small>${horaFin}</small>
                </div>

                <div class="schedule-content">
                    <h4>${escaparHTML(actividad.titulo)}</h4>
                    <p>
                        ${actividad.tipo === "escolar"
                            ? "Actividad escolar"
                            : "Actividad personal"}
                        · ${actividad.duracion} minutos
                    </p>
                </div>

                <span class="badge ${
                    actividad.completada
                        ? "bg-success"
                        : "bg-primary"
                }">
                    ${actividad.completada
                        ? "Completada"
                        : "Pendiente"}
                </span>
            </div>
        `;
    }).join("");
}

/* ==========================================
   LISTA DE PENDIENTES
   ========================================== */

function renderizarPendientes() {
    const contenedor = buscarElemento(
        "#listaPendientes",
        "#task-list",
        "#todo-list"
    );

    if (!contenedor) return;

    const pendientes = [...actividades].sort((a, b) => {
        const fechaA = `${a.fecha}T${a.hora}`;
        const fechaB = `${b.fecha}T${b.hora}`;

        return fechaA.localeCompare(fechaB);
    });

    if (pendientes.length === 0) {
        contenedor.innerHTML = `
            <p class="text-muted">
                Todavía no tienes tareas registradas.
            </p>
        `;
        return;
    }

    contenedor.innerHTML = pendientes.map(actividad => `
        <div class="task-item ${
            actividad.completada ? "completed" : ""
        }">
            <input
                type="checkbox"
                class="form-check-input"
                data-completar="${actividad.id}"
                ${actividad.completada ? "checked" : ""}
                aria-label="Completar ${escaparHTML(actividad.titulo)}"
            >

            <div class="task-info">
                <div class="task-title">
                    ${escaparHTML(actividad.titulo)}
                </div>

                <div class="task-date">
                    ${escaparHTML(actividad.fecha)}
                    · ${escaparHTML(actividad.hora)}
                </div>

                <small class="prioridad-${escaparHTML(actividad.prioridad)}">
                    Prioridad: ${escaparHTML(actividad.prioridad)}
                </small>
            </div>

            <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                data-eliminar="${actividad.id}"
                aria-label="Eliminar actividad"
            >
                Eliminar
            </button>
        </div>
    `).join("");
}

/* ==========================================
   PRODUCTIVIDAD DEL ESTUDIANTE
   ========================================== */

function calcularProductividad() {
    const actividadesHoy = obtenerActividadesPorFecha(
        obtenerFechaLocal()
    );

    const total = actividadesHoy.length;

    const completadas = actividadesHoy.filter(
        actividad => actividad.completada
    ).length;

    const porcentaje = total === 0
        ? 0
        : Math.round((completadas / total) * 100);

    return {
        total,
        completadas,
        pendientes: total - completadas,
        porcentaje
    };
}

function actualizarProductividad() {
    const datos = calcularProductividad();

    const porcentaje = buscarElemento(
        "#productividad",
        "#productivity-score",
        "#porcentajeProductividad"
    );

    const barra = buscarElemento(
        "#barraProgreso",
        "#progress-bar",
        "#productivity-progress"
    );

    const pendientes = buscarElemento(
        "#totalPendientes",
        "#pending-count"
    );

    const completadas = buscarElemento(
        "#totalCompletadas",
        "#completed-count"
    );

    if (porcentaje) {
        porcentaje.textContent = `${datos.porcentaje}%`;
    }

    if (barra) {
        barra.style.width = `${datos.porcentaje}%`;
        barra.setAttribute("aria-valuenow", datos.porcentaje);
    }

    if (pendientes) {
        pendientes.textContent = datos.pendientes;
    }

    if (completadas) {
        completadas.textContent = datos.completadas;
    }
}

/* ==========================================
   ORGANIZACION INTELIGENTE DEL DIA
   ========================================== */

function obtenerEspaciosLibres(fecha = obtenerFechaLocal()) {
    const actividadesDia = obtenerActividadesPorFecha(fecha);

    const inicioJornada = 7 * 60;
    const finJornada = 23 * 60;

    const intervalos = actividadesDia
        .filter(actividad => !actividad.completada)
        .map(actividad => ({
            inicio: convertirMinutos(actividad.hora),
            fin: convertirMinutos(actividad.hora) +
                actividad.duracion
        }))
        .sort((a, b) => a.inicio - b.inicio);

    const espacios = [];
    let cursor = inicioJornada;

    intervalos.forEach(intervalo => {
        const inicio = Math.max(
            inicioJornada,
            intervalo.inicio
        );

        const fin = Math.min(
            finJornada,
            intervalo.fin
        );

        if (inicio > cursor) {
            espacios.push({
                inicio: cursor,
                fin: inicio,
                duracion: inicio - cursor
            });
        }

        cursor = Math.max(cursor, fin);
    });

    if (cursor < finJornada) {
        espacios.push({
            inicio: cursor,
            fin: finJornada,
            duracion: finJornada - cursor
        });
    }

    return espacios;
}

function generarRecomendaciones() {
    const recomendaciones = [];

    const hoy = obtenerFechaLocal();
    const ahora = new Date();

    const minutosActuales =
        ahora.getHours() * 60 + ahora.getMinutes();

    const pendientes = obtenerActividadesPorFecha(hoy)
        .filter(actividad => !actividad.completada);

    const conflictos = detectarConflictos()
        .filter(conflicto => conflicto.fecha === hoy);

    if (conflictos.length > 0) {
        recomendaciones.push(
            `Tienes ${conflictos.length} conflicto(s) de horario. ` +
            "Reorganiza tus actividades para evitar que se empalmen."
        );
    }

    const tareasUrgentes = pendientes.filter(
        actividad => actividad.prioridad === "alta"
    );

    if (tareasUrgentes.length > 0) {
        recomendaciones.push(
            `Tienes ${tareasUrgentes.length} actividad(es) ` +
            "de alta prioridad. Atiéndelas primero."
        );
    }

    const espaciosLibres = obtenerEspaciosLibres(hoy)
        .filter(espacio =>
            espacio.fin > minutosActuales &&
            espacio.duracion >= 30
        );

    if (espaciosLibres.length > 0) {
        const espacio = espaciosLibres[0];

        const inicio = Math.max(
            espacio.inicio,
            minutosActuales
        );

        recomendaciones.push(
            `Tienes tiempo libre de ${formatearHora(inicio)} ` +
            `a ${formatearHora(espacio.fin)}. ` +
            "Puedes aprovecharlo para estudiar, descansar o adelantar tareas."
        );
    }

    if (pendientes.length >= 5) {
        recomendaciones.push(
            "Tu día tiene varias actividades. " +
            "Considera descansos de 10 a 15 minutos entre tareas."
        );
    }

    if (pendientes.length === 0) {
        recomendaciones.push(
            "No tienes pendientes para hoy. " +
            "Puedes aprovechar el tiempo para descansar o planear mañana."
        );
    }

    return recomendaciones;
}

function renderizarRecomendaciones() {
    const contenedor = buscarElemento(
        "#recomendaciones",
        "#recommendations",
        "#sugerencias"
    );

    if (!contenedor) return;

    const recomendaciones = generarRecomendaciones();

    contenedor.innerHTML = recomendaciones.map(mensaje => `
        <div class="recommendation">
            <h4>💡 Recomendación inteligente</h4>
            <p>${escaparHTML(mensaje)}</p>
        </div>
    `).join("");
}

/* ==========================================
   RECOMENDACIONES DE MUSICA
   ========================================== */

const playlists = {
    estudiar: {
        nombre: "Música para estudiar",
        descripcion: "Concentración y enfoque",
        url: "https://open.spotify.com/search/lofi%20study"
    },

    gimnasio: {
        nombre: "Música para entrenar",
        descripcion: "Energía y motivación",
        url: "https://open.spotify.com/search/workout"
    },

    descansar: {
        nombre: "Música para relajarte",
        descripcion: "Descanso y tranquilidad",
        url: "https://open.spotify.com/search/relaxing%20music"
    },

    camino: {
        nombre: "Música para tu camino",
        descripcion: "Disfruta tus traslados",
        url: "https://open.spotify.com/search/daily%20mix"
    },

    motivacion: {
        nombre: "Música motivacional",
        descripcion: "Empieza tu día con energía",
        url: "https://open.spotify.com/search/motivation"
    }
};

function recomendarMusica() {
    const hora = new Date().getHours();

    const actividadesHoy = obtenerActividadesPorFecha(
        obtenerFechaLocal()
    );

    const actividadActual = actividadesHoy.find(actividad => {
        const inicio = convertirMinutos(actividad.hora);
        const fin = inicio + actividad.duracion;

        const ahora = new Date();

        const minutos =
            ahora.getHours() * 60 + ahora.getMinutes();

        return minutos >= inicio &&
               minutos < fin &&
               !actividad.completada;
    });

    if (actividadActual) {
        const titulo = actividadActual.titulo.toLowerCase();

        if (
            titulo.includes("gym") ||
            titulo.includes("gimnasio") ||
            titulo.includes("entrenamiento") ||
            titulo.includes("ejercicio")
        ) {
            return playlists.gimnasio;
        }

        if (
            titulo.includes("estudiar") ||
            titulo.includes("tarea") ||
            titulo.includes("examen") ||
            titulo.includes("clase")
        ) {
            return playlists.estudiar;
        }

        if (
            titulo.includes("transporte") ||
            titulo.includes("camino") ||
            titulo.includes("traslado")
        ) {
            return playlists.camino;
        }
    }

    if (hora < 10) return playlists.motivacion;
    if (hora < 17) return playlists.estudiar;
    if (hora < 21) return playlists.gimnasio;

    return playlists.descansar;
}

function renderizarMusica() {
    const contenedor = buscarElemento(
        "#recomendacionMusical",
        "#music-recommendation",
        "#playlistRecomendada"
    );

    if (!contenedor) return;

    const playlist = recomendarMusica();

    contenedor.innerHTML = `
        <div class="music-card">
            <h3>🎵 Tu música recomendada</h3>

            <div class="playlist-item">
                <div class="playlist-info">
                    <h5>${escaparHTML(playlist.nombre)}</h5>
                    <p>${escaparHTML(playlist.descripcion)}</p>
                </div>
            </div>

            <a
                href="${playlist.url}"
                target="_blank"
                rel="noopener noreferrer"
                class="music-btn d-inline-block text-decoration-none"
            >
                Escuchar en Spotify
            </a>
        </div>
    `;
}

/* ==========================================
   RECORDATORIOS Y NOTIFICACIONES
   ========================================== */

function solicitarPermisoNotificaciones() {
    if (!("Notification" in window)) {
        mostrarMensaje(
            "Tu navegador no admite notificaciones.",
            "warning"
        );
        return;
    }

    if (!window.isSecureContext) {
        mostrarMensaje(
            "Las notificaciones requieren HTTPS o localhost.",
            "warning"
        );
        return;
    }

    Notification.requestPermission().then(permiso => {
        if (permiso === "granted") {
            mostrarMensaje("Notificaciones activadas.");
        } else {
            mostrarMensaje(
                "No se activaron las notificaciones.",
                "warning"
            );
        }
    });
}

function revisarRecordatorios() {
    const hoy = obtenerFechaLocal();

    const ahora = new Date();

    const minutosActuales =
        ahora.getHours() * 60 + ahora.getMinutes();

    const actividadesHoy = obtenerActividadesPorFecha(hoy)
        .filter(actividad => !actividad.completada);

    actividadesHoy.forEach(actividad => {
        const inicio = convertirMinutos(actividad.hora);
        const diferencia = inicio - minutosActuales;

        const clave = `${hoy}-${actividad.id}`;

        if (
            diferencia >= 0 &&
            diferencia <= 10 &&
            !notificacionesEnviadas.has(clave)
        ) {
            notificacionesEnviadas.add(clave);

            const mensaje =
                `${actividad.titulo} comienza a las ${actividad.hora}.`;

            mostrarMensaje(mensaje, "info");

            if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                new Notification("Recordatorio estudiantil", {
                    body: mensaje
                });
            }
        }
    });
}

/* ==========================================
   FORMULARIO DE NUEVAS ACTIVIDADES
   ========================================== */

function configurarFormulario() {
    const formulario = buscarElemento(
        "#formActividad",
        "#activity-form",
        "#formNuevaActividad"
    );

    if (!formulario) return;

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        const obtenerValor = (...selectores) => {
            const elemento = buscarElemento(...selectores);
            return elemento ? elemento.value : "";
        };

        const datos = {
            titulo: obtenerValor(
                "#tituloActividad",
                "#activity-title",
                '[name="titulo"]'
            ),

            tipo: obtenerValor(
                "#tipoActividad",
                "#activity-type",
                '[name="tipo"]'
            ) || "personal",

            fecha: obtenerValor(
                "#fechaActividad",
                "#activity-date",
                '[name="fecha"]'
            ),

            hora: obtenerValor(
                "#horaActividad",
                "#activity-time",
                '[name="hora"]'
            ),

            duracion: obtenerValor(
                "#duracionActividad",
                "#activity-duration",
                '[name="duracion"]'
            ) || 60,

            prioridad: obtenerValor(
                "#prioridadActividad",
                "#activity-priority",
                '[name="prioridad"]'
            ) || "media"
        };

        const agregado = agregarActividad(datos);

        if (agregado) {
            formulario.reset();

            const fechaInput = buscarElemento(
                "#fechaActividad",
                "#activity-date",
                '[name="fecha"]'
            );

            if (fechaInput) {
                fechaInput.value = obtenerFechaLocal();
            }
        }
    });
}

/* ==========================================
   EVENTOS DE BOTONES
   ========================================== */

function configurarBotones() {
    const botonAnterior = buscarElemento(
        "#mesAnterior",
        "#prevMonth",
        "#previous-month"
    );

    const botonSiguiente = buscarElemento(
        "#mesSiguiente",
        "#nextMonth",
        "#next-month"
    );

    const botonNotificaciones = buscarElemento(
        "#activarNotificaciones",
        "#enableNotifications"
    );

    if (botonAnterior) {
        botonAnterior.addEventListener("click", () => {
            cambiarMes(-1);
        });
    }

    if (botonSiguiente) {
        botonSiguiente.addEventListener("click", () => {
            cambiarMes(1);
        });
    }

    if (botonNotificaciones) {
        botonNotificaciones.addEventListener(
            "click",
            solicitarPermisoNotificaciones
        );
    }

    document.addEventListener("click", evento => {
        const botonEliminar = evento.target.closest(
            "[data-eliminar]"
        );

        if (botonEliminar) {
            const id = Number(
                botonEliminar.dataset.eliminar
            );

            eliminarActividad(id);
        }
    });

    document.addEventListener("change", evento => {
        const checkbox = evento.target.closest(
            "[data-completar]"
        );

        if (checkbox) {
            const id = Number(
                checkbox.dataset.completar
            );

            completarActividad(id);
        }
    });
}

/* ==========================================
   ACTUALIZACION GENERAL
   ========================================== */

function actualizarInterfaz() {
    actualizarBienvenida();
    renderizarCalendario();
    renderizarItinerario();
    renderizarPendientes();
    actualizarProductividad();
    renderizarRecomendaciones();
    renderizarMusica();
}

/* ==========================================
   INICIALIZACION DE LA APLICACION
   ========================================== */

function iniciarAplicacion() {
    guardarActividades();

    configurarFormulario();
    configurarBotones();

    const fechaInput = buscarElemento(
        "#fechaActividad",
        "#activity-date",
        '[name="fecha"]'
    );

    if (fechaInput && !fechaInput.value) {
        fechaInput.value = obtenerFechaLocal();
    }

    actualizarInterfaz();
    revisarRecordatorios();

    // Actualizar reloj, música y recordatorios cada minuto.
    setInterval(() => {
        actualizarBienvenida();
        renderizarMusica();
        renderizarRecomendaciones();
        revisarRecordatorios();
    }, 60000);

    console.log(
        "Organizador Estudiantil iniciado correctamente."
    );
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);

/* ==========================================
   FIN DEL SCRIPT
   ========================================== */