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
}