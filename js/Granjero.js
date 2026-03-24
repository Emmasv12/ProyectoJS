// ============================================================
// Granjero.js
// Clase que representa al jugador dentro del juego.
// Almacena su nombre, recursos, inventario y herramientas.
// ============================================================
class Granjero {

    /**
     * @param {string} nombre          - Nombre del granjero
     * @param {number} dineroInicial   - Dinero con el que empieza (según dificultad)
     * @param {number} energiaInicial  - Energía con la que empieza (según dificultad)
     * @param {number} nivelHerram     - Nivel inicial de las herramientas (1-3)
     */
    constructor(nombre, dineroInicial = 100, energiaInicial = 100, nivelHerram = 1) {
        this.nombre    = nombre;
        this.dinero    = dineroInicial;
        this.energia   = energiaInicial;
        this.inventario = []; // Lista de semillas en posesión del granjero

        // Herramientas del granjero, cada una con su imagen correspondiente
        this.herramientas = {
            azada:    new Herramienta("Azada",    nivelHerram, "azada.png"),
            regadera: new Herramienta("Regadera", nivelHerram, "regadera.png"),
            hoz:      new Herramienta("Hoz",      nivelHerram, "hoz.png")
        };
    }

    /**
     * Agrega una semilla al inventario del granjero.
     * @param {Semilla} semilla
     */
    agregarSemilla(semilla) {
        this.inventario.push(semilla);
    }

    /**
     * Suma el precio de venta del cultivo al dinero del granjero.
     * @param {Cultivo} cultivo - El cultivo recolectado
     */
    vender(cultivo) {
        this.dinero += cultivo.precioVenta;
    }
}