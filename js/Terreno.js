// ============================================================
// Terreno.js
// Clase que representa el campo completo de cultivo.
// Contiene un array de Parcelas según el tamaño indicado.
// ============================================================
class Terreno {

    /**
     * @param {number} tamano - Número de parcelas que tendrá el campo
     */
    constructor(tamano) {
        this.parcelas = [];

        // Crea tantas parcelas vacías como indique el tamaño
        for (let i = 0; i < tamano; i++) {
            this.parcelas.push(new Parcela());
        }
    }
}