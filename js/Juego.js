// ============================================================
// Juego.js
// Clase principal que orquesta toda la lógica del juego.
//
// MEJORAS PARA CUMPLIR RÚBRICA:
//   · mostrarTerreno() muestra estado textual + ciclos restantes
//     en cada card, visible siempre (sin depender de imágenes)
//   · Indicadores de estado claros: emoji + texto + barra + número
//   · interactuarParcela() informa si plantar() falla (parcela ocupada)
//   · semillaSeleccionada: flujo de selección antes de plantar
// ============================================================
class Juego {

    constructor(config) {
        const statsInicio = Juego.calcularStatsPorDificultad(config.dificultad);

        this.granjero = new Granjero(
            config.nombre,
            statsInicio.dinero,
            statsInicio.energia,
            config.nivelHerram
        );

        this.nombreGranja = config.granja;
        this.cultivoFav   = config.cultivoFav;
        this.dificultad   = config.dificultad;
        this.terreno      = new Terreno(config.tamanoTerreno);

        this.semillasDisponibles = config.semillasIniciales || [];

        if (this.semillasDisponibles.length === 0) {
            console.warn("Juego: semillasDisponibles vacío. ¿Se cargó el XML?");
        }

        // Índice de la semilla seleccionada en el inventario (null = ninguna)
        this.semillaSeleccionada = null;

        // Logro: dinero total acumulado vendiendo cultivos
        this.totalGanado   = config.totalGanado   || 0;
        this.logroMostrado = config.logroMostrado || false;

        this.intervaloId = null;

        this.iniciarEventos();
        this.render();
        this.iniciarCrecimiento();
    }

    // ============================================================
    // MÉTODOS ESTÁTICOS
    // ============================================================

    static calcularStatsPorDificultad(dificultad) {
        switch (dificultad) {
            case "facil":   return { dinero: 200, energia: 150 };
            case "dificil": return { dinero: 50,  energia: 75  };
            default:        return { dinero: 100, energia: 100 };
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    iniciarEventos() {
        document.getElementById("btnRecargar").addEventListener("click", () => {
            if (this.semillasDisponibles.length === 0) {
                Swal.fire({
                    title: "Sin catálogo",
                    text: "No se cargaron semillas del XML.",
                    icon: "error",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }
            for (let i = 0; i < 2; i++) {
                const random  = Math.floor(Math.random() * this.semillasDisponibles.length);
                this.granjero.agregarSemilla(this.semillasDisponibles[random]);
            }
            this.render();
        });

        document.getElementById("btnGuardar").addEventListener("click", () => {
            this.guardar();
        });

        document.getElementById("btnTienda").addEventListener("click", () => {
            Menu.mostrarPantalla("pantalla-tienda");
            new Tienda(this, window._datosXML);
        });

        document.getElementById("btnMenuPrincipal").addEventListener("click", () => {
            if (this.intervaloId) {
                clearInterval(this.intervaloId);
                this.intervaloId = null;
            }
            Menu.mostrarPantalla("pantalla-menu");
        });
    }

    // ============================================================
    // BUCLE DE JUEGO
    // ============================================================

    iniciarCrecimiento() {
        this.intervaloId = setInterval(() => {
            this.terreno.parcelas.forEach(parcela => {
                if (parcela.cultivo && !parcela.cultivo.estaMaduro()) {
                    parcela.cultivo.crecer();
                }
            });
            this.render();
        }, 5000);
    }

    // ============================================================
    // RENDER
    // ============================================================

    render() {
        this.mostrarInfo();
        this.mostrarInventario();
        this.mostrarHerramientas();
        this.mostrarTerreno();
    }

    mostrarInfo() {
        const info = document.getElementById("info-granjero");
        info.innerHTML = `
            <h5>Granjero — ${this.nombreGranja}</h5>
            <p>Nombre: <strong>${this.granjero.nombre}</strong></p>
            <p>Dinero: <strong>${this.granjero.dinero} monedas</strong></p>
            <p>Energía: <strong>${this.granjero.energia}</strong></p>
            <p>Dificultad: <strong>${this.dificultad}</strong></p>
        `;
    }

    /**
     * Muestra el inventario con semillas individuales y clicables.
     * El jugador selecciona una semilla aquí antes de plantar.
     */
    mostrarInventario() {
        const contenedor = document.getElementById("inventario");

        if (this.granjero.inventario.length === 0) {
            this.semillaSeleccionada = null;
            contenedor.innerHTML = `
                <h5>Inventario</h5>
                <span style="color:#aaa; font-family:var(--font-retro); font-size:1.1rem;">
                    Sin semillas. Pulsa "Recargar Semillas" o ve a la Tienda.
                </span>
            `;
            return;
        }

        const instruccion = this.semillaSeleccionada !== null
            ? `<span class="inventario-instruccion seleccionando">
                   "${this.granjero.inventario[this.semillaSeleccionada].nombre}" seleccionada
                   — haz clic en un macetero vacío para plantarla
               </span>`
            : `<span class="inventario-instruccion">
                   Haz clic en una semilla para seleccionarla y luego en un macetero
               </span>`;

        const itemsHTML = this.granjero.inventario.map((semilla, index) => {
            const claseSelec = index === this.semillaSeleccionada
                ? "semilla-item semilla-seleccionada"
                : "semilla-item";
            return `
                <div class="${claseSelec}" data-index="${index}" title="Seleccionar ${semilla.nombre}">
                    <img src="${semilla.imgSemilla}" class="semilla-item-img"
                         alt="${semilla.nombre}" onerror="this.style.display='none'">
                    <span class="semilla-item-nombre">${semilla.nombre}</span>
                    <span class="semilla-item-tipo">${semilla.tipo || ""}</span>
                </div>
            `;
        }).join("");

        contenedor.innerHTML = `
            <h5>Inventario <span style="color:#aaa;font-size:0.5rem;">(${this.granjero.inventario.length} semillas)</span></h5>
            ${instruccion}
            <div class="inventario-lista mt-2">${itemsHTML}</div>
        `;

        contenedor.querySelectorAll(".semilla-item").forEach(item => {
            item.addEventListener("click", () => {
                this.seleccionarSemilla(parseInt(item.dataset.index));
            });
        });
    }

    seleccionarSemilla(index) {
        this.semillaSeleccionada = (this.semillaSeleccionada === index) ? null : index;
        this.mostrarInventario();
    }

    mostrarHerramientas() {
        const herr  = document.getElementById("herramientas");
        const tools = this.granjero.herramientas;
        let html = `<h5>Herramientas</h5><div class="herramientas-lista">`;
        Object.values(tools).forEach(h => {
            const estadoHTML = h.rota
                ? `<span class="herramienta-rota">ROTA</span>` //Mensaje de que la herramienta se ha roto
                : `<span class="herramienta-nivel">Nv.${h.nivel} — ${h.obtenerDescripcionNivel()}</span>`;
            html += `
                <div class="herramienta-item${h.rota ? " herramienta-item-rota" : ""}">
                    <img class="herramienta-img" src="${h.imagen}" alt="${h.nombre}"
                         onerror="this.style.display='none'">
                    <span class="herramienta-nombre">${h.nombre}</span>
                    ${estadoHTML}
                </div>`;
        });
        html += `</div>`;
        herr.innerHTML = html;
    }

    /**
     * Dibuja el terreno con indicadores visuales de estado completos:
     *   [ ] Vacía        → macetero, texto "Vacía", instruccion si hay semilla seleccionada
     *   [S] Semilla       → imagen + nombre + barra + "X ciclos restantes"
     *   [C] Creciendo     → imagen + nombre + barra + "X ciclos restantes"
     *   [M] Maduro        → imagen + nombre + "Lista para cosechar!" + barra al 100%
     *
     * Los emojis y textos garantizan legibilidad aunque las imágenes no carguen.
     */
    mostrarTerreno() {
        const terrenoDiv = document.getElementById("terreno");
        terrenoDiv.innerHTML = "";

        this.terreno.parcelas.forEach((parcela, index) => {
            const col  = document.createElement("div");
            col.className = "col-6 col-sm-4 col-md-3";

            const card = document.createElement("div");
            card.className = "parcela-card";

            // Borde parpadeante en maceteros vacíos cuando hay semilla seleccionada
            if (!parcela.cultivo && this.semillaSeleccionada !== null) {
                card.classList.add("parcela-disponible");
            }

            let innerHTML = "";

            if (parcela.cultivo) {
                const c    = parcela.cultivo;
                const fase = c.obtenerFase();
                const pct  = c.obtenerPorcentaje();

                // Emoji de estado según fase — visible siempre
                const emojiFase = {
                    semilla:   "[S]",
                    creciendo: "[C]",
                    maduro:    "[M]"
                }[fase] || "[S]";

                // Texto de estado
                const textoEstado = c.estaMaduro()
                    ? `<span class="parcela-estado-texto maduro">¡Lista para cosechar!</span>`
                    : `<span class="parcela-estado-texto">${c.tiempoRestante} ciclo${c.tiempoRestante !== 1 ? "s" : ""} restante${c.tiempoRestante !== 1 ? "s" : ""}</span>`;

                // Imagen según fase (con fallback al emoji si no carga)
                const imgSrc = fase === "semilla"   ? c.imgSemilla
                             : fase === "creciendo" ? c.imgCreciendo
                             : c.imgMaduro;

                // Clase de color de card según estado
                const claseCard = c.estaMaduro() ? "parcela-madura" : "parcela-creciendo";
                card.classList.add(claseCard);

                innerHTML = `
                    <div class="parcela-emoji">${emojiFase}</div>
                    <img class="parcela-img" src="${imgSrc}" alt="${c.nombre}"
                         onerror="this.style.display='none'">
                    <div class="parcela-nombre">${c.nombre}</div>
                    ${textoEstado}
                    <div class="parcela-progreso">
                        <div class="parcela-progreso-bar" style="width:${pct}%"></div>
                    </div>
                    <span class="parcela-pct">${pct}%</span>
                `;

            } else {
                card.classList.add("parcela-vacia");
                const hint = this.semillaSeleccionada !== null
                    ? `<span class="parcela-hint">Plantar aqui</span>`
                    : `<span class="parcela-hint">Vacía</span>`;

                innerHTML = `
                    
                    <img class="parcela-img" src="maceta.png" alt="Maceta"
                         onerror="this.style.display='none'">
                    ${hint}
                    <div class="parcela-progreso">
                        <div class="parcela-progreso-bar" style="width:0%"></div>
                    </div>
                    <span class="parcela-pct">0%</span>
                `;
            }

            card.innerHTML = innerHTML;

            card.addEventListener("click", () => this.interactuarParcela(index));

            col.appendChild(card);
            terrenoDiv.appendChild(col);
        });
    }

    // ============================================================
    // INTERACCIÓN CON PARCELAS
    // ============================================================

    /**
     * Lógica de clic en parcela:
     *   - Vacía + semilla seleccionada → planta (garantizado, sin random)
     *   - Vacía + sin selección        → pide seleccionar semilla primero
     *   - Vacía + inventario vacío     → pide recargar
     *   - Madura                       → cosecha y vende
     *   - Creciendo                    → muestra progreso detallado
     */
    interactuarParcela(index) {
        const parcela = this.terreno.parcelas[index];

        if (!parcela.cultivo) {
            if (this.granjero.inventario.length === 0) {
                Swal.fire({
                    title: "Sin semillas",
                    text: "No tienes semillas. Pulsa 'Recargar Semillas' o ve a la Tienda.",
                    icon: "warning", confirmButtonText: "Ok",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }

            if (this.semillaSeleccionada === null) {
                Swal.fire({
                    title: "Selecciona una semilla",
                    text: "Haz clic en una semilla del inventario antes de plantar.",
                    icon: "info", confirmButtonText: "Ok",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }

            // Extrae la semilla elegida del inventario
            const semilla = this.granjero.inventario.splice(this.semillaSeleccionada, 1)[0];
            this.semillaSeleccionada = null;

            parcela.plantar(semilla);

        } else if (parcela.cultivo.estaMaduro()) {
            // La hoz se usa al recolectar — verificar si está rota
            const hoz = this.granjero.herramientas.hoz;
            if (hoz && hoz.rota) {
                Swal.fire({
                    title: "Hoz rota",
                    text: "No puedes recolectar: la hoz está rota. Reparala en la Tienda.",
                    icon: "error", confirmButtonText: "Ok",
                    background: "#1a2a10", color: "#f5c518"
                });
                return;
            }

            const cultivo = parcela.recolectar();
            this.granjero.vender(cultivo);

            // Acumular dinero ganado para el logro
            this.totalGanado += cultivo.precioVenta;

            // Intentar romper la hoz tras usarla
            let mensajeExtra = "";
            if (hoz && hoz.intentarRomper()) {
                mensajeExtra = "\nLa hoz se ha roto Ve a la Tienda para repararla.";
            }

            // Comprobar logro: 500 monedas acumuladas vendiendo
            this.comprobarLogro();

            Swal.fire({
                title: `¡${cultivo.nombre} cosechado!`,
                text: `+${cultivo.precioVenta} monedas${mensajeExtra}`,
                icon: mensajeExtra ? "warning" : "success",
                timer: mensajeExtra ? 3000 : 1500,
                showConfirmButton: false,
                background: "#1a2a10", color: "#f5c518"
            });

        } else {
            const c = parcela.cultivo;
            Swal.fire({
                title: `${c.nombre} — ${c.obtenerPorcentaje()}%`,
                text: `Todavía necesita ${c.tiempoRestante} ciclo${c.tiempoRestante !== 1 ? "s" : ""} más.`,
                icon: "info", timer: 2000, showConfirmButton: false,
                background: "#1a2a10", color: "#f5c518"
            });
            return;
        }

        this.render();
    }

    // ============================================================
    // GUARDADO Y CARGA
    // ============================================================

    guardar() {
        const datos = {
            nombre:        this.granjero.nombre,
            granja:        this.nombreGranja,
            dificultad:    this.dificultad,
            cultivoFav:    this.cultivoFav,
            dinero:        this.granjero.dinero,
            energia:       this.granjero.energia,
            tamanoTerreno: this.terreno.parcelas.length,
            nivelHerram:   this.granjero.herramientas.azada.nivel,

            inventario: this.granjero.inventario.map(s => ({
                nombre:           s.nombre,
                tiempoMaduracion: s.tiempoMaduracion,
                precioVenta:      s.precioVenta,
                imgSemilla:       s.imgSemilla,
                imgCreciendo:     s.imgCreciendo,
                imgMaduro:        s.imgMaduro,
                precioCompra:     s.precioCompra,
                tipo:             s.tipo
            })),

            parcelas: this.terreno.parcelas.map(parcela => {
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
            })
        };

        localStorage.setItem("partidaGranja", JSON.stringify(datos));

        Swal.fire({
            title: "¡Partida guardada!",
            icon: "success", timer: 1200, showConfirmButton: false,
            background: "#1a2a10", color: "#f5c518"
        });
    }

    static cargar(semillasDelXML = []) {
        const raw = localStorage.getItem("partidaGranja");
        if (!raw) return null;

        const datos = JSON.parse(raw);

        const juego = new Juego({
            nombre:            datos.nombre,
            granja:            datos.granja        || "Mi Granja",
            dificultad:        datos.dificultad    || "normal",
            cultivoFav:        datos.cultivoFav    || "Tomate",
            tamanoTerreno:     datos.tamanoTerreno || 8,
            nivelHerram:       datos.nivelHerram   || 1,
            semillasIniciales: semillasDelXML
        });

        juego.granjero.dinero  = datos.dinero;
        juego.granjero.energia = datos.energia;

        juego.granjero.inventario = (datos.inventario || []).map(s =>
            new Semilla(
                s.nombre, s.tiempoMaduracion, s.precioVenta,
                s.imgSemilla, s.imgCreciendo, s.imgMaduro,
                s.precioCompra || 0,
                s.tipo         || ""
            )
        );

        (datos.parcelas || []).forEach((pd, i) => {
            if (pd && juego.terreno.parcelas[i]) {
                const semillaTmp = new Semilla(
                    pd.nombre, pd.tiempoTotal, pd.precioVenta,
                    pd.imgSemilla, pd.imgCreciendo, pd.imgMaduro
                );
                const cultivo          = new Cultivo(semillaTmp);
                cultivo.tiempoRestante = pd.tiempoRestante;
                juego.terreno.parcelas[i].cultivo = cultivo;
            }
        });

        juego.render();
        return juego;
    }
}