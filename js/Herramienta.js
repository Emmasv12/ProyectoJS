// ============================================================
// Herramienta.js
// Clase que representa una herramienta del granjero.
// Almacena nombre, nivel e imagen de la herramienta.
// ============================================================
class Herramienta {

    /**
     * @param {string} nombre  - Nombre de la herramienta (Azada, Regadera, Hoz)
     * @param {number} nivel   - Nivel de la herramienta (1 = básico, por defecto)
     * @param {string} imagen  - Nombre del archivo de imagen (ej: "azada.png")
     */
    constructor(nombre, nivel = 1, imagen = "") {
        this.nombre = nombre;
        this.nivel  = nivel;
        this.imagen = imagen;
        this.rota   = false; // false = funciona, true = rota (no se puede usar)
    }

    /**
     * Devuelve una descripción textual del nivel.
     * @returns {string}
     */
    obtenerDescripcionNivel() {
        switch (this.nivel) {
            case 1: return "Básico";
            case 2: return "Mejorado";
            case 3: return "Maestro";
            default: return "Desconocido";
        }
    }

    /**
     * Intenta romper la herramienta con una probabilidad pequeña (10%).
     * Solo puede romperse si no está ya rota.
     * @returns {boolean} true si se rompió ahora mismo
     */
    intentarRomper() {
        if (this.rota) return false;
        // 10% de probabilidad de romperse al usarla
        if (Math.random() < 0.10) {
            this.rota = true;
            return true;
        }
        return false;
    }

    /**
     * Repara la herramienta (vuelve a estar operativa).
     */
    reparar() {
        this.rota = false;
    }
}