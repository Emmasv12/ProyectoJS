// clase que representa una casilla individual del campo de cultivo
class Parcela {

    // empieza vacia, sin ningun cultivo plantado
    constructor() {
        this.cultivo = null;
    }

    // planta una semilla en la parcela creando un nuevo cultivo
    // solo actua si la parcela esta vacia
    plantar(semilla) {

        if (!this.cultivo) {
            this.cultivo = new Cultivo(semilla);
        }

    }

    // recoge el cultivo si esta maduro y deja la parcela vacia de nuevo
    // devuelve el cultivo recolectado, o null si no estaba listo
    recolectar() {

        if (this.cultivo && this.cultivo.estaMaduro()) {

            const cultivoRecolectado = this.cultivo;
            this.cultivo = null; // la parcela queda libre para volver a plantar

            return cultivoRecolectado;
        }

        return null;
    }

}