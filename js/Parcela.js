class Parcela {

    constructor() {
        this.cultivo = null;
    }

    plantar(semilla) {

        if (!this.cultivo) {
            this.cultivo = new Cultivo(semilla);
        }

    }

    recolectar() {

        if (this.cultivo && this.cultivo.estaMaduro()) {

            const cultivoRecolectado = this.cultivo;
            this.cultivo = null;

            return cultivoRecolectado;
        }

        return null;
    }

}