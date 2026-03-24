// ============================================================
// Parcela.js
// Clase que representa una casilla individual del campo de cultivo.
// Puede estar vacía o contener un cultivo en progreso.
// ============================================================
class Parcela {

    /**
     * Empieza vacía, sin ningún cultivo plantado.
     */
    constructor() {
        this.cultivo = null; // null = parcela libre
    }

    /**
     * Planta una semilla en la parcela creando un nuevo Cultivo.
     * Solo actúa si la parcela está vacía.
     * @param {Semilla} semilla - La semilla que se va a plantar
     */
    plantar(semilla) {
        if (!this.cultivo) {
            this.cultivo = new Cultivo(semilla);
        }
    }

    /**
     * Recoge el cultivo si está maduro y deja la parcela vacía de nuevo.
     * @returns {Cultivo|null} El cultivo recolectado, o null si no estaba listo
     */
    recolectar() {
        if (this.cultivo && this.cultivo.estaMaduro()) {
            const cultivoRecolectado = this.cultivo;
            this.cultivo = null; // La parcela queda libre para volver a plantar
            return cultivoRecolectado;
        }
        return null;
    }
}