const categorias = {
  CU: 'Cultura',
  SU: 'Supervivencia',
  OV: 'Ocio-vicio',
  EX: 'Extra'
}

let losMovimientos

function recibeRespuesta() {
  if (this.readyState === 4 && this.status === 200 ) {
      const respuesta = JSON.parse(this.responseText)

      if (respuesta.status !== 'success') {
          alert("Se ha producido un error en acceso a servidor "+ respuesta.mensaje)
          return
      }

      llamaApiMovimientos()  // si ha ido bien refresca movimientos
  }
}

function detallaMovimiento(id) {   // might need to look at this again
  
  let movimiento = []
  for (let i=0; i<losMovimientos.length; i++) {
    const item = losMovimientos[i]
    if (item.id == id) {
      movimiento = item
      break
    }
  }
  
  if (!movimiento) return
  
  document.querySelector("#idMovimiento").value = id
  document.querySelector("#fecha").value = movimiento.fecha
  document.querySelector("#concepto").value = movimiento.concepto
  document.querySelector("#categoria").value = movimiento.categoria
  document.querySelector("#cantidad").value = movimiento.cantidad.toFixed(2)
  movimiento.esGasto ? document.querySelector("#gasto").checked = true :
    document.querySelector("#ingreso").checked = true

}

function muestraMovimientos() {
  if (this.readyState === 4 && this.status === 200) {
    const respuesta = JSON.parse(this.responseText);
    if (respuesta.status !== "success") {
      alert("Se ha producido un error en la consulta de movimientos");
      return;
    }

    losMovimientos = respuesta.movimientos
    const tbody = document.querySelector(".tabla-movimientos tbody");
    tbody.innerHTML = ""   // limpia lista de movimientos

    for (let i = 0; i < respuesta.movimientos.length; i++) {
      const movimiento = respuesta.movimientos[i];
      const fila = document.createElement("tr");
      fila.addEventListener("click", () => {
        detallaMovimiento(movimiento.id)

      })
      const dentro = `
              <td>${movimiento.fecha}</td>
              <td>${movimiento.concepto}</td>
              <td>${movimiento.esGasto ? "Gasto" : "Ingreso"}</td>
              <td>${
                movimiento.categoria ? categorias[movimiento.categoria] : ""
              }</td>
              <td>${movimiento.cantidad} €</td>
          `;
      fila.innerHTML = dentro;

      tbody.appendChild(fila);
    }
  }
}

xhr = new XMLHttpRequest();


function llamaApiMovimientos() {
  xhr.open("GET", `http://localhost:5000/api/v1/movimientos`, true);
  xhr.onload = muestraMovimientos;
  xhr.send();
}

window.onload = function () {
  llamaApiMovimientos();

  document.querySelector("#modificar")
  .addEventListener("click", (ev) => {
    ev.preventDefault()
    const movimiento = {}  // aqui creamos el diccionario que va a viajar
    movimiento.fecha = document.querySelector("#fecha").value
    movimiento.concepto = document.querySelector("#concepto").value
    movimiento.categoria = document.querySelector("#categoria").value
    movimiento.cantidad = document.querySelector("#cantidad").value
    document.querySelector("#gasto").checked ? movimiento.esGasto = 1:  movimiento.esGasto = 0

    id = document.querySelector("#idMovimiento").value  //tambien se puede crear campo oculto en html
            
    xhr.open("PUT", `http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = recibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8") // dice al servidor el tipo de contenido que lleva en el body
    // cabecera siempre lleva instrucciones o suele

    xhr.send(JSON.stringify(movimiento))

  })
};