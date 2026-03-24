// ============================================================
// Menu.js
// Clase que gestiona la navegación entre pantallas y la
// pantalla de configuración de nueva partida.
// Se inicializa desde Main.js antes de arrancar el juego.
// ============================================================
class Menu {

    constructor() {
        this.juegoActual = null; // referencia a la instancia activa del Juego

        // Estado interno de la pantalla de configuración
        this.config = {
            dificultad:  "normal",
            terreno:     8,
            cultivo:     "Zanahoria",
            herramientas: 1
        };

        this.iniciarEventosMenu();
        this.iniciarEventosConfig();
    }

    // ============================================================
    // EVENTOS DEL MENÚ PRINCIPAL
    // ============================================================

    /**
     * Registra los eventos de los botones del menú de inicio.
     */
    iniciarEventosMenu() {

        // --- Nueva Partida: muestra la pantalla de configuración ---
        document.getElementById("btnNuevaPartida").addEventListener("click", () => {
            Menu.mostrarPantalla("pantalla-config");
        });

        // --- Continuar Partida: carga desde localStorage si existe ---
        document.getElementById("btnContinuar").addEventListener("click", () => {
            const existe = localStorage.getItem("partidaGranja");

            if (!existe) {
                // No hay partida guardada
                Swal.fire({
                    title: "Sin partida guardada",
                    text: "No se encontró ninguna partida. Comienza una nueva.",
                    icon: "warning",
                    confirmButtonText: "Ok",
                    background: "#1a2a10",
                    color: "#f5c518"
                });
                return;
            }

            // Carga la partida y muestra la pantalla de juego
            Menu.mostrarPantalla("pantalla-juego");
            this.juegoActual = Juego.cargar();
        });

        // --- Eliminar Partida: borra el guardado de localStorage ---
        document.getElementById("btnEliminar").addEventListener("click", () => {
            const existe = localStorage.getItem("partidaGranja");

            if (!existe) {
                Swal.fire({
                    title: "Sin partida guardada",
                    text: "No hay ninguna partida que eliminar.",
                    icon: "info",
                    confirmButtonText: "Ok",
                    background: "#1a2a10",
                    color: "#f5c518"
                });
                return;
            }

            // Pide confirmación antes de eliminar
            Swal.fire({
                title: "¿Eliminar partida?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                background: "#1a2a10",
                color: "#f5c518"
            }).then(result => {
                if (result.isConfirmed) {
                    localStorage.removeItem("partidaGranja");
                    Swal.fire({
                        title: "Partida eliminada",
                        icon: "success",
                        timer: 1200,
                        showConfirmButton: false,
                        background: "#1a2a10",
                        color: "#f5c518"
                    });
                }
            });
        });
    }

    // ============================================================
    // EVENTOS DE LA PANTALLA DE CONFIGURACIÓN
    // ============================================================

    /**
     * Registra todos los eventos interactivos de la pantalla de config:
     * grupos de botones, slider, inputs de texto y botones de acción.
     */
    iniciarEventosConfig() {

        // ---- Grupos de botones de opción (dificultad, terreno, cultivo) ----
        this.registrarGrupoOpciones("cfgDificultad", valor => {
            this.config.dificultad = valor;
            this.actualizarResumen();
        });

        this.registrarGrupoOpciones("cfgTerreno", valor => {
            this.config.terreno = parseInt(valor);
        });

        this.registrarGrupoOpciones("cfgCultivo", valor => {
            this.config.cultivo = valor;
        });

        // ---- Slider de nivel de herramientas ----
        const slider = document.getElementById("cfgHerramientas");
        const valorLabel = document.getElementById("valorHerramientas");

        slider.addEventListener("input", () => {
            const nivel = parseInt(slider.value);
            this.config.herramientas = nivel;

            // Etiquetas descriptivas según nivel
            const etiquetas = { 1: "Básico", 2: "Mejorado", 3: "Maestro" };
            valorLabel.textContent = `Nivel ${nivel} — ${etiquetas[nivel]}`;
        });

        // ---- Botón Volver: regresa al menú principal ----
        document.getElementById("btnVolver").addEventListener("click", () => {
            this.limpiarErrores();
            Menu.mostrarPantalla("pantalla-menu");
        });

        // ---- Botón Iniciar: valida y arranca la partida ----
        document.getElementById("btnIniciar").addEventListener("click", () => {
            if (this.validarConfig()) {
                this.iniciarNuevaPartida();
            }
        });

        // Actualiza el resumen al cargar la pantalla
        this.actualizarResumen();
    }

    /**
     * Registra el comportamiento de selección exclusiva para un grupo
     * de botones de opción (.opcion-btn dentro de un contenedor).
     *
     * @param {string}   contenedorId - ID del div que contiene los botones
     * @param {Function} callback     - Función llamada con el valor seleccionado
     */
    registrarGrupoOpciones(contenedorId, callback) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        const botones = contenedor.querySelectorAll(".opcion-btn");

        botones.forEach(btn => {
            btn.addEventListener("click", () => {
                // Quita la clase activa de todos los botones del grupo
                botones.forEach(b => b.classList.remove("opcion-activa"));
                // Activa solo el pulsado
                btn.classList.add("opcion-activa");
                // Llama al callback con el valor data-valor del botón
                callback(btn.dataset.valor);
            });
        });
    }

    /**
     * Actualiza el resumen de dinero y energía según la dificultad seleccionada.
     */
    actualizarResumen() {
        const stats = Juego.calcularStatsPorDificultad(this.config.dificultad);
        document.getElementById("resumenDinero").textContent  = `💰 Dinero inicial: ${stats.dinero}`;
        document.getElementById("resumenEnergia").textContent = `⚡ Energía inicial: ${stats.energia}`;
    }

    // ============================================================
    // VALIDACIÓN
    // ============================================================

    /**
     * Valida todos los campos del formulario de configuración.
     * Muestra mensajes de error inline si hay problemas.
     * @returns {boolean} true si todo es válido, false si hay errores
     */
    validarConfig() {
        this.limpiarErrores();
        let valido = true;

        // --- Nombre del granjero ---
        const nombre = document.getElementById("cfgNombre").value.trim();
        if (!nombre) {
            this.mostrarError("errNombre", "El nombre no puede estar vacío.");
            valido = false;
        } else if (nombre.length < 2) {
            this.mostrarError("errNombre", "Mínimo 2 caracteres.");
            valido = false;
        }

        // --- Nombre de la granja ---
        const granja = document.getElementById("cfgGranja").value.trim();
        if (!granja) {
            this.mostrarError("errGranja", "El nombre de la granja es obligatorio.");
            valido = false;
        }

        // --- Dificultad (debe haberse seleccionado) ---
        if (!this.config.dificultad) {
            this.mostrarError("errDificultad", "Selecciona una dificultad.");
            valido = false;
        }

        // --- Coherencia: en difícil el terreno no puede ser de 12 parcelas ---
        if (this.config.dificultad === "dificil" && this.config.terreno === 12) {
            this.mostrarError("errTerreno", "En difícil el terreno máximo es de 8 parcelas.");
            valido = false;
        }

        return valido;
    }

    /**
     * Muestra un mensaje de error bajo un campo específico.
     * @param {string} idError - ID del elemento <span> de error
     * @param {string} mensaje - Texto del error
     */
    mostrarError(idError, mensaje) {
        const el = document.getElementById(idError);
        if (el) el.textContent = mensaje;
    }

    /**
     * Limpia todos los mensajes de error del formulario.
     */
    limpiarErrores() {
        const errores = ["errNombre", "errGranja", "errDificultad", "errTerreno", "errCultivo", "errHerramientas"];
        errores.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "";
        });
    }

    // ============================================================
    // ARRANCAR NUEVA PARTIDA
    // ============================================================

    /**
     * Recoge los valores del formulario y arranca una nueva instancia de Juego.
     */
    iniciarNuevaPartida() {
        const configPartida = {
            nombre:        document.getElementById("cfgNombre").value.trim(),
            granja:        document.getElementById("cfgGranja").value.trim(),
            dificultad:    this.config.dificultad,
            tamanoTerreno: this.config.terreno,
            cultivoFav:    this.config.cultivo,
            nivelHerram:   this.config.herramientas
        };

        // Muestra la pantalla de juego y arranca la instancia
        Menu.mostrarPantalla("pantalla-juego");
        this.juegoActual = new Juego(configPartida);
    }

    // ============================================================
    // NAVEGACIÓN ENTRE PANTALLAS (método estático reutilizable)
    // ============================================================

    /**
     * Oculta todas las pantallas y muestra únicamente la indicada.
     * @param {string} idPantalla - ID del elemento div de la pantalla a mostrar
     */
    static mostrarPantalla(idPantalla) {
        // Quita la clase "activa" de todas las pantallas
        document.querySelectorAll(".pantalla").forEach(p => {
            p.classList.remove("activa");
        });
        // Añade "activa" solo a la pantalla destino
        const destino = document.getElementById(idPantalla);
        if (destino) destino.classList.add("activa");
    }
}