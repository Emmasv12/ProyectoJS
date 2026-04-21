// ============================================================
// Menu.js
// Clase que gestiona la navegación entre pantallas y la
// pantalla de configuración de nueva partida.
//
// CAMBIO FASE 2 — INTEGRACIÓN XML:
//   · Recibe una instancia de DatosXML en el constructor
//   · Al iniciar una nueva partida o cargar una existente,
//     obtiene el catálogo de semillas del XML y se lo pasa a Juego
//   · Al abrir la tienda, usa DatosXML para filtrar semillas con XPath
// ============================================================
class Menu {

    /**
     * @param {DatosXML} datosXML - Instancia con el XML ya cargado (de Main.js)
     */
    constructor(datosXML) {
        this.juegoActual = null;

        // Guarda la referencia al gestor de XML para usarla en toda la clase
        this.datosXML = datosXML;

        // Estado interno de la pantalla de configuración
        this.config = {
            dificultad:   "normal",
            terreno:      8,
            cultivo:      "Zanahoria",
            herramientas: 1
        };

        this.iniciarEventosMenu();
        this.iniciarEventosConfig();
    }

    // ============================================================
    // EVENTOS DEL MENÚ PRINCIPAL
    // ============================================================

    iniciarEventosMenu() {

        document.getElementById("btnNuevaPartida").addEventListener("click", () => {
            Menu.mostrarPantalla("pantalla-config");
        });

        document.getElementById("btnContinuar").addEventListener("click", () => {
            const existe = localStorage.getItem("partidaGranja");

            if (!existe) {
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

            Menu.mostrarPantalla("pantalla-juego");

            // CAMBIO FASE 2: pasa el catálogo del XML al método cargar()
            // para que el juego restaurado tenga las semillas disponibles
            const semillasXML     = this.datosXML.obtenerTodasLasSemillas();
            this.juegoActual      = Juego.cargar(semillasXML);
        });

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

    iniciarEventosConfig() {

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

        const slider     = document.getElementById("cfgHerramientas");
        const valorLabel = document.getElementById("valorHerramientas");

        slider.addEventListener("input", () => {
            const nivel            = parseInt(slider.value);
            this.config.herramientas = nivel;
            const etiquetas        = { 1: "Básico", 2: "Mejorado", 3: "Maestro" };
            valorLabel.textContent = `Nivel ${nivel} — ${etiquetas[nivel]}`;
        });

        document.getElementById("btnVolver").addEventListener("click", () => {
            this.limpiarErrores();
            Menu.mostrarPantalla("pantalla-menu");
        });

        document.getElementById("btnIniciar").addEventListener("click", () => {
            if (this.validarConfig()) {
                this.iniciarNuevaPartida();
            }
        });

        this.actualizarResumen();
    }

    registrarGrupoOpciones(contenedorId, callback) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        const botones = contenedor.querySelectorAll(".opcion-btn");

        botones.forEach(btn => {
            btn.addEventListener("click", () => {
                botones.forEach(b => b.classList.remove("opcion-activa"));
                btn.classList.add("opcion-activa");
                callback(btn.dataset.valor);
            });
        });
    }

    actualizarResumen() {
        const stats = Juego.calcularStatsPorDificultad(this.config.dificultad);
        document.getElementById("resumenDinero").textContent  = `💰 Dinero inicial: ${stats.dinero}`;
        document.getElementById("resumenEnergia").textContent = `⚡ Energía inicial: ${stats.energia}`;
    }

    // ============================================================
    // VALIDACIÓN
    // ============================================================

    validarConfig() {
        this.limpiarErrores();
        let valido = true;

        const nombre = document.getElementById("cfgNombre").value.trim();
        if (!nombre) {
            this.mostrarError("errNombre", "El nombre no puede estar vacío.");
            valido = false;
        } else if (nombre.length < 2) {
            this.mostrarError("errNombre", "Mínimo 2 caracteres.");
            valido = false;
        }

        const granja = document.getElementById("cfgGranja").value.trim();
        if (!granja) {
            this.mostrarError("errGranja", "El nombre de la granja es obligatorio.");
            valido = false;
        }

        if (!this.config.dificultad) {
            this.mostrarError("errDificultad", "Selecciona una dificultad.");
            valido = false;
        }

        if (this.config.dificultad === "dificil" && this.config.terreno === 12) {
            this.mostrarError("errTerreno", "En difícil el terreno máximo es de 8 parcelas.");
            valido = false;
        }

        return valido;
    }

    mostrarError(idError, mensaje) {
        const el = document.getElementById(idError);
        if (el) el.textContent = mensaje;
    }

    limpiarErrores() {
        ["errNombre","errGranja","errDificultad","errTerreno","errCultivo","errHerramientas"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = "";
            });
    }

    // ============================================================
    // ARRANCAR NUEVA PARTIDA
    // ============================================================

    /**
     * Recoge los valores del formulario y arranca una nueva instancia de Juego.
     *
     * CAMBIO FASE 2: obtiene el catálogo de semillas del XML y se lo pasa
     * al constructor de Juego como semillasIniciales.
     */
    iniciarNuevaPartida() {
        // Obtiene todas las semillas del catálogo XML
        const semillasXML = this.datosXML.obtenerTodasLasSemillas();

        const configPartida = {
            nombre:            document.getElementById("cfgNombre").value.trim(),
            granja:            document.getElementById("cfgGranja").value.trim(),
            dificultad:        this.config.dificultad,
            tamanoTerreno:     this.config.terreno,
            cultivoFav:        this.config.cultivo,
            nivelHerram:       this.config.herramientas,
            semillasIniciales: semillasXML   // ← catálogo del XML, no hardcodeado
        };

        Menu.mostrarPantalla("pantalla-juego");
        this.juegoActual = new Juego(configPartida);
    }

    // ============================================================
    // NAVEGACIÓN ENTRE PANTALLAS
    // ============================================================

    static mostrarPantalla(idPantalla) {
        document.querySelectorAll(".pantalla").forEach(p => {
            p.classList.remove("activa");
        });
        const destino = document.getElementById(idPantalla);
        if (destino) destino.classList.add("activa");
    }
}