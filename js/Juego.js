// ============================================================
// Juego.js
// Clase principal que orquesta toda la lógica del juego.
// Se instancia desde Main.js una vez que el DOM está listo.
// ============================================================
class Juego {

    /**
     * Inicializa el juego con los parámetros de configuración elegidos
     * en la pantalla de configuración de partida.
     *
     * @param {Object} config - Objeto con la configuración inicial del juego
     * @param {string} config.nombre         - Nombre del granjero
     * @param {string} config.granja         - Nombre de la granja
     * @param {string} config.dificultad     - "facil" | "normal" | "dificil"
     * @param {number} config.tamanoTerreno  - Número de parcelas (4, 8 o 12)
     * @param {string} config.cultivoFav     - Cultivo favorito (Tomate, Zanahoria, Maiz)
     * @param {number} config.nivelHerram    - Nivel inicial de herramientas (1-3)
     */
    constructor(config) {
        // ---- Parámetros que dependen de la dificultad ----
        const statsInicio = Juego.calcularStatsPorDificultad(config.dificultad);

        // Crea al granjero con los parámetros iniciales
        this.granjero = new Granjero(
            config.nombre,
            statsInicio.dinero,
            statsInicio.energia,
            config.nivelHerram
        );

        // Guarda el nombre de la granja y el cultivo favorito
        this.nombreGranja = config.granja;
        this.cultivoFav   = config.cultivoFav;
        this.dificultad   = config.dificultad;

        // Crea el terreno con el número de parcelas elegido
        this.terreno = new Terreno(config.tamanoTerreno);

        // Catálogo de semillas disponibles para plantar
        this.semillasDisponibles = [
            new Semilla(
                "Tomate",
                3,          // tarda 3 ciclos en madurar
                20,         // se vende por 20 de dinero
                "semilla.png",
                "tomate_creciendo.png",
                "tomate_maduro.png"
            ),
            new Semilla(
                "Zanahoria",
                2,          // tarda 2 ciclos en madurar
                15,         // se vende por 15 de dinero
                "semilla.png",
                "zanahoria_creciendo.png",
                "zanahoria_maduro.png"
            ),
            new Semilla(
                "Maiz",
                4,          // tarda 4 ciclos en madurar
                30,         // se vende por 30 de dinero
                "semilla.png",
                "maiz_creciendo.png",
                "maiz_maduro.png"
            ),
            new Semilla (
                "Caracol",
                5,
                40,
                "semilla.png",
                "caracol.png",
                "caracol maduro.png"
            )
        ];

        // Referencia al intervalo de crecimiento para poder detenerlo si hace falta
        this.intervaloId = null;

        this.iniciarEventos();
        this.render();
        this.iniciarCrecimiento();
    }

    // ============================================================
    // MÉTODOS ESTÁTICOS
    // ============================================================

    /**
     * Devuelve los valores de dinero y energía según la dificultad elegida.
     * @param {string} dificultad
     * @returns {{dinero: number,energia: number }}
     */
    static calcularStatsPorDificultad(dificultad) {
        switch (dificultad) {
            case "facil":   return { dinero: 200, energia: 150 };
            case "dificil": return { dinero: 50,  energia: 75  };
            default:        return { dinero: 100, energia: 100 }; // normal
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    /**
     * Registra los eventos de los botones de la interfaz del juego.
     * CORRECCIÓN: se obtiene el botón en el momento del clic para evitar
     * referencias a elementos del DOM antes de que existan.
     */
    iniciarEventos() {
        // Botón "Recargar Semillas": añade 2 semillas aleatorias al inventario
        document.getElementById("btnRecargar").addEventListener("click", () => {
            for (let i = 0; i < 2; i++) {
                const random  = Math.floor(Math.random() * this.semillasDisponibles.length);
                const semilla = this.semillasDisponibles[random];
                this.granjero.agregarSemilla(semilla);
            }
            this.render();
        });

        // Botón "Guardar Partida"
        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.guardar();
        });

        // Botón "Menú Principal": vuelve al menú sin perder la partida en curso
        document.getElementById("btnMenuPrincipal").addEventListener("click", () => {
            // Detiene el bucle de crecimiento para no consumir recursos innecesariamente
            if (this.intervaloId) {
                clearInterval(this.intervaloId);
                this.intervaloId = null;
            }
            // Navega de vuelta al menú principal
            Menu.mostrarPantalla("pantalla-menu");
        });
    }

    // ============================================================
    // BUCLE DE JUEGO
    // ============================================================

    /**
     * Bucle de juego: cada 5 segundos avanza el crecimiento de todos los cultivos.
     */
    iniciarCrecimiento() {
        this.intervaloId = setInterval(() => {
            // Recorre todas las parcelas y hace crecer los cultivos que no están maduros
            this.terreno.parcelas.forEach(parcela => {
                if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
                    parcela.cultivo.crecer();
                }
            });
            // Actualiza la interfaz para reflejar el nuevo estado
            this.render();
        }, 5000); // 5000ms = 5 segundos por ciclo
    }

    // ============================================================
    // RENDER (ACTUALIZACIÓN DE LA INTERFAZ)
    // ============================================================

    /**
     * Redibuja toda la interfaz: info del granjero, inventario,
     * herramientas y terreno.
     */
    render() {
        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarHerramientas();
        this.mostrarTerreno();
    }

    /**
     * Actualiza el bloque de información del granjero en el HTML.
     */
    mostrarInfo() {
        const info = document.getElementById("info-granjero");
        info.innerHTML = `
            <h5>Granjero — ${this.nombreGranja}</h5>
            <p>Nombre: <strong>${this.granjero.nombre}</strong></p>
            <p>Dinero: <strong>${this.granjero.dinero}</strong></p>
            <p>Energía: <strong>${this.granjero.energia}</strong></p>
            <p>Dificultad: <strong>${this.dificultad}</strong></p>
        `;
    }

    /**
     * Actualiza el bloque de inventario mostrando las semillas agrupadas por tipo.
     */
    mostrarInventario() {
        const inventario = document.getElementById("inventario");

        // Agrupa las semillas del inventario por nombre para mostrar cantidades
        const conteo = {};
        this.granjero.inventario.forEach(semilla => {
            conteo[semilla.nombre] = (conteo[semilla.nombre] || 0) + 1;
        });

        // Construye el HTML de los ítems de semilla
        let itemsHTML = "";

        if (Object.keys(conteo).length === 0) {
            // Inventario vacío
            itemsHTML = `<span style="color:#888; font-family: var(--font-retro); font-size:1.1rem;">Sin semillas. Pulsa "Recargar Semillas".</span>`;
        } else {
            // Una tarjeta por tipo de semilla con su cantidad
            Object.entries(conteo).forEach(([nombre, cantidad]) => {
                itemsHTML += `
                    <div class="semilla-item">
                        <span class="semilla-item-nombre" ${nombre}</span>
                        <span class="semilla-item-cantidad">x${cantidad}</span>
                    </div>
                `;
            });
        }

        inventario.innerHTML = `
            <h5>Inventario</h5>
            <div class="inventario-lista">${itemsHTML}</div>
        `;
    }

    /**
     * Actualiza el bloque de herramientas mostrando imagen, nombre y nivel.
     */
    mostrarHerramientas() {
        const herramientasDiv = document.getElementById("herramientas");

        // Genera un ítem visual por cada herramienta del granjero
        let itemsHTML = "";
        Object.values(this.granjero.herramientas).forEach(h => {
            itemsHTML += `
                <div class="herramienta-item">
                    <img
                        class="herramienta-img"
                        src="${h.imagen}"
                        alt="${h.nombre}"
                        onerror="this.style.display='none'"
                    />
                    <span class="herramienta-nombre">${h.nombre}</span>
                    <span class="herramienta-nivel">Nv. ${h.nivel} — ${h.obtenerDescripcionNivel()}</span>
                </div>
            `;
        });

        herramientasDiv.innerHTML = `
            <h5>Herramientas</h5>
            <div class="herramientas-lista">${itemsHTML}</div>
        `;
    }

    /**
     * Reconstruye visualmente todas las parcelas del terreno en el HTML.
     */
    mostrarTerreno() {
        const terrenoDiv = document.getElementById("terreno");
        terrenoDiv.innerHTML = ""; // Limpia el contenido anterior antes de redibujar

        this.terreno.parcelas.forEach((parcela, index) => {
            // Columna Bootstrap para distribuir las parcelas en el grid
            const col = document.createElement("div");
            col.classList.add("col-6", "col-sm-4", "col-md-3");

            // Tarjeta de la parcela
            const card = document.createElement("div");
            card.classList.add("parcela-card");

            // ---- Imagen del estado actual de la parcela ----
            const img = document.createElement("img");
            img.classList.add("parcela-img");

            // Etiqueta con el nombre del cultivo (o vacío si no hay)
            const nombre = document.createElement("div");
            nombre.classList.add("parcela-nombre");

            // Barra de progreso de crecimiento
            const progresoWrap = document.createElement("div");
            progresoWrap.classList.add("parcela-progreso");
            const progresoBar = document.createElement("div");
            progresoBar.classList.add("parcela-progreso-bar");

            if (parcela.cultivo) {
                // Determina la imagen según la fase del cultivo
                const fase = parcela.cultivo.obtenerFase();

                if (fase === "semilla") {
                    img.src = parcela.cultivo.imgSemilla;
                    card.classList.add("parcela-creciendo");
                } else if (fase === "creciendo") {
                    img.src = parcela.cultivo.imgCreciendo;
                    card.classList.add("parcela-creciendo");
                } else {
                    // Fase madura: indica que se puede cosechar
                    img.src = parcela.cultivo.imgMaduro;
                    card.classList.add("parcela-madura");
                }

                nombre.textContent = parcela.cultivo.nombre;

                // Porcentaje de crecimiento completado (0-100)
                const pct = parcela.cultivo.obtenerPorcentaje();
                progresoBar.style.width = `${pct}%`;
                // La barra se vuelve dorada cuando el cultivo está maduro
                if (fase === "maduro") {
                    progresoBar.style.background = "#f5c518";
                }

            } else {
                // Parcela vacía: muestra la imagen de maceta
                img.src = "maceta.png";
                card.classList.add("parcela-vacia");
                nombre.textContent = "Vacía";
                progresoBar.style.width = "0%";
            }

            // Ensambla los elementos de la tarjeta
            progresoWrap.appendChild(progresoBar);
            card.appendChild(img);
            card.appendChild(nombre);
            card.appendChild(progresoWrap);

            // Al hacer clic en una parcela se gestiona la interacción
            card.addEventListener("click", () => {
                this.interactuarParcela(index);
            });

            col.appendChild(card);
            terrenoDiv.appendChild(col);
        });
    }

    // ============================================================
    // INTERACCIÓN CON PARCELAS
    // ============================================================

    /**
     * Gestiona el clic del jugador sobre una parcela:
     * - Si está vacía y hay semillas en el inventario → planta
     * - Si tiene un cultivo maduro → cosecha y vende
     * - Si tiene un cultivo sin madurar → muestra info (sin acción)
     * @param {number} index - Índice de la parcela en el array del terreno
     */
    interactuarParcela(index) {
        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo && this.granjero.inventario.length > 0) {
            // Saca la última semilla del inventario y la planta en la parcela
            const semilla = this.granjero.inventario.pop();
            parcela.plantar(semilla);

        } else if (!parcela.cultivo && this.granjero.inventario.length === 0) {
            // No hay semillas disponibles: avisa al jugador con SweetAlert2
            Swal.fire({
                title: "Sin semillas",
                text: "No tienes semillas en el inventario. Recarga para obtener más.",
                icon: "warning",
                confirmButtonText: "Ok",
                background: "#1a2a10",
                color: "#f5c518"
            });
            return; // Evita render innecesario

        } else if (parcela.cultivo && parcela.cultivo.estaMaduro()) {
            // Recoge el cultivo maduro y suma su valor al dinero del granjero
            const cultivo = parcela.recolectar();
            this.granjero.vender(cultivo);

            // Notificación de cosecha
            Swal.fire({
                title: `¡${cultivo.nombre} cosechado!`,
                text: `+${cultivo.precioVenta} monedas`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                background: "#1a2a10",
                color: "#f5c518"
            });

        } else if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
            // El cultivo todavía está creciendo: muestra el tiempo restante
            Swal.fire({
                title: `${parcela.cultivo.nombre}`,
                text: `Ciclos restantes: ${parcela.cultivo.tiempoRestante}`,
                icon: "info",
                timer: 1500,
                showConfirmButton: false,
                background: "#1a2a10",
                color: "#f5c518"
            });
            return; // Evita render innecesario
        }

        this.render();
    }

    // ============================================================
    // GUARDADO Y CARGA
    // ============================================================

    /**
     * Guarda el estado completo de la partida en localStorage como JSON.
     * Incluye granjero, terreno (cultivos en curso) y configuración general.
     */
    guardar() {
        // Serializa el estado de cada parcela para poder reconstruirlo al cargar
        const parcelasSerializadas = this.terreno.parcelas.map(parcela => {
            if (!parcela.cultivo) return null;

            return {
                nombre:         parcela.cultivo.nombre,
                tiempoTotal:    parcela.cultivo.tiempoTotal,
                tiempoRestante: parcela.cultivo.tiempoRestante,
                precioVenta:    parcela.cultivo.precioVenta,
                imgSemilla:     parcela.cultivo.imgSemilla,
                imgCreciendo:   parcela.cultivo.imgCreciendo,
                imgMaduro:      parcela.cultivo.imgMaduro
            };
        });

        const datos = {
            nombre:        this.granjero.nombre,
            granja:        this.nombreGranja,
            dificultad:    this.dificultad,
            cultivoFav:    this.cultivoFav,
            dinero:        this.granjero.dinero,
            energia:       this.granjero.energia,
            tamanoTerreno: this.terreno.parcelas.length,
            nivelHerram:   this.granjero.herramientas.azada.nivel,

            // Serializa solo los datos necesarios de cada semilla del inventario
            inventario: this.granjero.inventario.map(s => ({
                nombre:          s.nombre,
                tiempoMaduracion: s.tiempoMaduracion,
                precioVenta:     s.precioVenta,
                imgSemilla:      s.imgSemilla,
                imgCreciendo:    s.imgCreciendo,
                imgMaduro:       s.imgMaduro
            })),

            // Estado actual del terreno
            parcelas: parcelasSerializadas
        };

        localStorage.setItem("partidaGranja", JSON.stringify(datos));

        // Confirmación visual al jugador
        Swal.fire({
            title: "¡Partida guardada!",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
            background: "#1a2a10",
            color: "#f5c518"
        });
    }

    /**
     * Carga una partida guardada desde localStorage.
     * Reconstruye el estado completo del juego.
     * @returns {Juego|null} Nueva instancia del juego cargada, o null si no hay partida
     */
    static cargar() {
        const raw = localStorage.getItem("partidaGranja");
        if (!raw) return null;

        const datos = JSON.parse(raw);

        // Reconstruye la instancia de Juego con la configuración guardada
        const juego = new Juego({
            nombre:        datos.nombre,
            granja:        datos.granja        || "Mi Granja",
            dificultad:    datos.dificultad    || "normal",
            cultivoFav:    datos.cultivoFav    || "Tomate",
            tamanoTerreno: datos.tamanoTerreno || 8,
            nivelHerram:   datos.nivelHerram   || 1
        });

        // Restaura el dinero y energía reales (no los del inicio)
        juego.granjero.dinero   = datos.dinero;
        juego.granjero.energia  = datos.energia;

        // Restaura el inventario de semillas
        juego.granjero.inventario = (datos.inventario || []).map(s =>
            new Semilla(s.nombre, s.tiempoMaduracion, s.precioVenta,
                        s.imgSemilla, s.imgCreciendo, s.imgMaduro)
        );

        // Restaura el estado de cada parcela
        (datos.parcelas || []).forEach((parcelaDatos, i) => {
            if (parcelaDatos && juego.terreno.parcelas[i]) {
                // Crea una semilla temporal solo para reconstruir el cultivo
                const semillaTmp = new Semilla(
                    parcelaDatos.nombre,
                    parcelaDatos.tiempoTotal,
                    parcelaDatos.precioVenta,
                    parcelaDatos.imgSemilla,
                    parcelaDatos.imgCreciendo,
                    parcelaDatos.imgMaduro
                );
                const cultivo = new Cultivo(semillaTmp);
                // Restaura el tiempo restante real (no el inicial)
                cultivo.tiempoRestante = parcelaDatos.tiempoRestante;
                juego.terreno.parcelas[i].cultivo = cultivo;
            }
        });

        juego.render();
        return juego;
    }
}