document.addEventListener("DOMContentLoaded", () => {
  initializeData();

  // Eventos de botón en pedidos
  document.querySelectorAll(".container-pedidos .card").forEach(card => {
      card.addEventListener("click", handleProductOrder);
  });

  // Evento de botón para añadir sopa
  document.querySelector("#add-sopa").addEventListener("click", () => {
      const cantidad = parseFloat(document.getElementById("cantidad-sopa").value) || 0; // Use float to allow decimal values
      if (cantidad > 0) { // Verificar que la cantidad sea mayor que 0
          addSale("Sopa", cantidad, cantidad); // La cantidad en dinero se usa como precio
          document.getElementById("cantidad-sopa").value = ""; // Limpiar campo
      } else {
          alert("Por favor, introduce una cantidad válida de sopa."); // Mensaje de error
      }
  });

  // Evento de botón para borrar datos
  document.querySelector("#borrar-datos").addEventListener("click", clearData);

  renderOrders(); // Inicializar la renderización de pedidos
});

// Inicializar los datos en localStorage
function initializeData() {
  const initialData = {
      sales: [],
      almuerzos: 0,
      sopa: 0,
      totalMoney: 0
  };

  for (const [key, value] of Object.entries(initialData)) {
      if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(value));
      }
  }
  updateDisplay(); // Asegurarse de mostrar los valores iniciales
}

// Manejar pedidos de productos
function handleProductOrder(event) {
  const productName = event.currentTarget.getAttribute('data-product');
  addSale(productName, 1, 9000); // Almuerzos siempre tienen un precio fijo de 9000
}

// Agregar una venta al almacenamiento y actualizar la vista
function addSale(product, amount, pricePerUnit) {
  const sales = JSON.parse(localStorage.getItem("sales"));
  const newSale = {
      id: sales.length ? sales[sales.length - 1].id + 1 : 1,
      product: product,
      amount: amount,
      pricePerUnit: pricePerUnit,
      time: new Date().toLocaleTimeString("es-ES"),
      delivered: false
  };

  sales.push(newSale);
  localStorage.setItem("sales", JSON.stringify(sales));
  updateCounts(product, amount, pricePerUnit); // Actualiza los conteos
  renderOrders(); // Asegurarse de renderizar después de añadir una venta
}

// Actualizar conteos de almuerzos y sopa
function updateCounts(product, amount, pricePerUnit) {
  let almuerzos = parseInt(localStorage.getItem("almuerzos"), 10);
  let sopa = parseFloat(localStorage.getItem("sopa"), 10);
  let totalMoney = parseFloat(localStorage.getItem("totalMoney"), 10);

  if (product === "Sopa") {
      sopa += amount; // La cantidad de sopa se incrementa con el total en dinero
      totalMoney += pricePerUnit; // Agregar al total el valor de la sopa
      localStorage.setItem("sopa", sopa);
  } else {
      almuerzos += amount; // Incrementar el conteo de almuerzos
      totalMoney += (amount * pricePerUnit); // Agregar al total el valor de los almuerzos
      localStorage.setItem("almuerzos", almuerzos);
  }

  localStorage.setItem("totalMoney", totalMoney); // Guardar total en localStorage
  updateDisplay(); // Actualizar la visualización
}

// Actualizar la visualización de contadores
function updateDisplay() {
  const almuerzos = localStorage.getItem("almuerzos");
  const sopa = localStorage.getItem("sopa");
  const totalMoney = parseFloat(localStorage.getItem("totalMoney"), 10) || 0;

  document.getElementById("almuerzos").textContent = almuerzos;
  document.getElementById("sopa").textContent = sopa;

  const totalDineroElement = document.getElementById("total-dinero");
  if (totalDineroElement) {
      totalDineroElement.textContent = `$${totalMoney.toLocaleString()}`; // Formato de moneda
  }
}

// Renderizar los pedidos en la tabla
function renderOrders() {
  const sales = JSON.parse(localStorage.getItem("sales")) || [];
  const tbody = document.querySelector(".Ultimos-pedidos tbody");
  tbody.innerHTML = ""; // Limpiar contenido previo

  sales.forEach(sale => {
      // Solo muestra pedidos que no están entregados
      if (!sale.delivered) {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${sale.id}</td>
              <td>${sale.product}</td>
              <td>${sale.time}</td>
              <td>
                  <button class="btn-deliver green" data-id="${sale.id}">Entregar</button>
                  <button class="btn-delete red" data-id="${sale.id}">Eliminar</button>
              </td>
          `;
          tbody.appendChild(row);

          // Event listeners for buttons
          row.querySelector(".btn-deliver").addEventListener("click", () => deliverOrder(sale.id));
          row.querySelector(".btn-delete").addEventListener("click", () => deleteOrder(sale.id));
      }
  });
}


// Eliminar un pedido por ID
function deleteOrder(id) {
  let sales = JSON.parse(localStorage.getItem("sales")) || [];
  // Asegurarse de que 'id' sea un número
  id = parseInt(id, 10);
  
  // Encontrar la venta que se va a eliminar
  const saleToDelete = sales.find(sale => sale.id === id);

  if (saleToDelete) {
      // Actualizar conteos de almuerzos o sopa
      if (saleToDelete.product === "Sopa") {
          let sopa = parseFloat(localStorage.getItem("sopa")) || 0;
          sopa -= saleToDelete.amount; // Restar la cantidad de sopa
          localStorage.setItem("sopa", sopa);
      } else {
          let almuerzos = parseInt(localStorage.getItem("almuerzos")) || 0;
          almuerzos -= saleToDelete.amount; // Restar la cantidad de almuerzos
          localStorage.setItem("almuerzos", almuerzos);
      }

      // Actualizar total de dinero
      let totalMoney = parseFloat(localStorage.getItem("totalMoney")) || 0;
      totalMoney -= (saleToDelete.pricePerUnit * saleToDelete.amount); // Restar el total del pedido eliminado
      localStorage.setItem("totalMoney", totalMoney); // Guardar el nuevo total

      // Filtrar la venta eliminada
      sales = sales.filter(sale => sale.id !== id);
      localStorage.setItem("sales", JSON.stringify(sales)); // Guardar cambios en localStorage
      renderOrders(); // Renderizar la tabla de pedidos nuevamente

      // Actualizar la visualización después de eliminar
      updateDisplay(); // Asegúrate de que la interfaz se actualice
  }
}


// Marcar un pedido como entregado
function deliverOrder(id) {
  let sales = JSON.parse(localStorage.getItem("sales")) || [];
  // Asegurarse de que 'id' sea un número
  id = parseInt(id, 10);
  sales.forEach(sale => {
      if (sale.id === id) {
          sale.delivered = true; // Cambiar el estado de entrega
      }
  });
  localStorage.setItem("sales", JSON.stringify(sales)); // Guardar cambios
  renderOrders(); // Actualizar la tabla de pedidos
}


// Borrar todos los datos
function clearData() {
  localStorage.clear(); // Limpiar el almacenamiento local
  initializeData(); // Reiniciar los datos iniciales
  renderOrders(); // Renderizar la tabla después de borrar
}
