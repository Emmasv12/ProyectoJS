// ============================================================
// Parcela.js
// Clase que representa una casilla individual del campo de cultivo.
// Puede estar vacía o contener un cultivo en progreso.
// ============================================================
class Parcela {

    constructor() {
        this.cultivo = null; // null = parcela libre
    }

    /**
     * Planta una semilla en la parcela creando un nuevo Cultivo.
     * @param {Semilla} semilla - La semilla que se va a plantar
     * @returns {boolean} true si se plantó, false si la parcela estaba ocupada
     */
    plantar(semilla) {
        if (this.cultivo) return false; // parcela ocupada, no hace nada
        this.cultivo = new Cultivo(semilla);
        return true;
    }

    /**
     * Recoge el cultivo si está maduro y deja la parcela vacía de nuevo.
     * @returns {Cultivo|null} El cultivo recolectado, o null si no estaba listo
     */
    recolectar() {
        if (this.cultivo && this.cultivo.estaMaduro()) {
            const cultivoRecolectado = this.cultivo;
            this.cultivo = null;
            return cultivoRecolectado;
        }
        return null;
    }
}