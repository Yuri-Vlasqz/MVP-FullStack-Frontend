/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = () => {
  let url = 'http://127.0.0.1:5000/disponibilidades';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.disponibilidades.forEach(item => insertList(
        item.programa, item.tipo, item.temporadas, item.plataforma, item.pais, item.temporadas_disponiveis, item.data_limite, item.link,
      ))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList()



/*
  --------------------------------------------------------------------------------------
  Função para obter lista de disponibilidades de um programa em um pais via requisição GET (WIP)
  --------------------------------------------------------------------------------------
*/
const procuraProgLocal = () => {
  let progTerm = document.getElementById("searchProg").value;
  let paisTerm = document.getElementById("searchPais").value;
  // limpar tabela de pesquisa anterior
  platformTableBody.innerHTML = '';
  platformTableHead.innerHTML = '';
  
  if (progTerm === '' || paisTerm === '') {
    alert("Digite todos os campos da busca!");
    searchResults.classList.add('hidden');
  }
  else {
    let url = 'http://127.0.0.1:5000/disponibilidade?programa='+ progTerm +'&pais='+ paisTerm;
    fetch(url, {
      method: 'get',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.disponibilidades) {
          displayResults(data.disponibilidades);
        }
        else {
          alert("programa não encontrado!");
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para mostrar lista de resultados da pesquisa de disponibilidade
  --------------------------------------------------------------------------------------
*/
const displayResults = (results) => {
  // Informações do Programa e Cabeçalho
  document.getElementById('progNome').textContent = results[0].programa;
  var tipo = results[0].tipo;
  const header = document.createElement('tr');
  if (tipo === "Filme") {
    document.getElementById('ProgTemp').textContent = `Duração: ${results[0].temporadas} minutos`;
    header.innerHTML = `
      <th>Plataforma</th>
      <th>Veja até</th>
      <th>Link</th>
    `;
  } else {
    document.getElementById('ProgTemp').textContent = `Temporadas: ${results[0].temporadas}`;
    header.innerHTML = `
      <th>Plataforma</th>
      <th>Temporadas disponíveis</th>
      <th>Veja até</th>
      <th>Link</th>
    `;
  }
  platformTableHead.appendChild(header);
  
  // Informações das plataformas
  results.forEach(result => {
    const row = document.createElement('tr');

    // Criar icone com link
    const linkIcon = document.createElement('img');
    linkIcon.setAttribute('src', 'imgs/link.png');
    linkIcon.setAttribute('alt', 'Ícone de link');
    linkIcon.classList.add('link-icon');
    const linkElement = document.createElement('a');
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('href', result.link);
    linkElement.appendChild(linkIcon);

    if (tipo === "Filme") {
      row.innerHTML = `
        <td>${result.plataforma}</td>
        <td>${result.data_limite}</td>
      `;
      const cell = row.insertCell(-1);
      cell.classList.add('link-cell');
      cell.appendChild(linkElement);
    } 
    else {
      row.innerHTML = `
        <td>${result.plataforma}</td>
        <td>${result.temporadas_disponiveis}</td>
        <td>${result.data_limite}</td>
      `;
      const cell = row.insertCell(-1);
      cell.classList.add('link-cell');
      cell.appendChild(linkElement);
    }

    platformTableBody.appendChild(row);
  });

  searchResults.classList.remove('hidden');
};



/*
  --------------------------------------------------------------------------------------
  Função para mostrar aba ativa
  --------------------------------------------------------------------------------------
*/
function showTab(tabIndex) {
    var tabs = document.querySelectorAll('.tab');
    var buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(function(tab, index) {
        tab.classList.toggle('active', index === tabIndex);
    });

    buttons.forEach(function(button, index) {
        button.classList.toggle('active', index === tabIndex);
    });
}
// Mostrar aba de pesquisa como padrão
document.addEventListener('DOMContentLoaded', function() {
  showTab(0);
});


/*
  --------------------------------------------------------------------------------------
  Funcionalidade para desabilitar input em filmes
  --------------------------------------------------------------------------------------
*/
document.addEventListener("DOMContentLoaded", function () {
  const selectElement = document.getElementById("newTipo");
  const textBox = document.getElementById("newTempDisp");

  selectElement.addEventListener("change", function () {
      if (this.value === "Filme") {
          textBox.value = "";
          textBox.disabled = true;
      } else {
          textBox.disabled = false;
      }
  });
});


/*
  --------------------------------------------------------------------------------------
  Função de verificação dos dados (atrelada ao botão 'adicionar')
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputPrograma = document.getElementById("newProg").value;
  let inputTipo = document.getElementById("newTipo").value;
  let inputTemps = document.getElementById("newTemp").value;
  let inputPlat = document.getElementById("newPlat").value;
  let inputPais = document.getElementById("newPais").value;
  let inputTempDisp = document.getElementById("newTempDisp").value;
  let inputDataLim = document.getElementById("newDataLim").value; //sempre no formato aaaa-mm-dd
  let inputLink = document.getElementById("newLink").value;

  // Verificação no front
  var repetido = false;
  var table = document.getElementById("myTable");
  for (var i = 1; i < table.rows.length; i++) {
    var cells = table.rows[i].getElementsByTagName('td');
    if (cells[0].innerHTML.toLowerCase() === inputPrograma.toLowerCase() && 
        cells[2].innerHTML.toLowerCase() === inputPlat.toLowerCase() && 
        cells[3].innerHTML.toLowerCase() === inputPais.toLowerCase()) {
      repetido = true;
      break;
    }
  }

  let commonInputs = [inputPrograma, inputTemps, inputPlat, inputPais, inputDataLim, inputLink];
  let extraInput = inputTipo === "Série" ? inputTempDisp : null; 

  if (inputTipo === '') {
    alert("Selecione o tipo do programa");
  }
  else if (commonInputs.includes('') || (extraInput !== null && extraInput === '')) {
    alert("Digite todos os campos ativos!");
  }
  else if (repetido){
    alert(`${inputPrograma} em ${inputPlat} ${inputPais} Repetido!`)
  }
  else if (isNaN(inputTemps) || inputTemps < 0) {
    alert("Temporadas/Duração precisa ser um número inteiro positivo");
  } 
  else {
    postItem(inputPrograma, inputTipo,inputTemps, inputPlat, inputPais, inputTempDisp, inputDataLim, inputLink)
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = (inputPrograma, inputTipo, inputTemps, inputPlat, inputPais, inputTempDisp, inputDataLim, inputLink) => {
  const formData = new FormData();
  formData.append('programa', inputPrograma);
  formData.append('tipo', inputTipo);
  formData.append('temporadas', inputTemps);
  formData.append('plataforma', inputPlat);
  formData.append('pais', inputPais);
  formData.append('temporadas_disponiveis', inputTempDisp);
  formData.append('data_limite', inputDataLim);  // recebe do usuário no formato aaaa-mm-dd
  formData.append('link', inputLink);
  
  let url = 'http://127.0.0.1:5000/disponibilidade';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      response.json();
      if (response.ok) {
        // Formatação de data para o front (dd/mm/aaaa)
        let newDataLim = inputDataLim.slice(-2) +'/'+ inputDataLim.slice(-5,-3) +'/'+ inputDataLim.slice(0,4); 
        insertList(inputPrograma, inputTipo, inputTemps, inputPlat, inputPais, inputTempDisp, newDataLim, inputLink);
        alert("Disponibilidade adicionada!");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para inserir disponibilidade na listagem
  --------------------------------------------------------------------------------------
*/
const insertList = (programa, tipo, temporadas, plataforma, pais, temporadas_disponiveis, data_limite, link) => {
  var item = [programa, tipo, temporadas, plataforma, pais, temporadas_disponiveis, data_limite, link]
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  const linkIcon = document.createElement('img');
  linkIcon.setAttribute('src', 'imgs/link.png');
  linkIcon.setAttribute('alt', 'Ícone de link');
  linkIcon.classList.add('link-icon');

  const linkElement = document.createElement('a');
  linkElement.setAttribute('target', '_blank');
  linkElement.appendChild(linkIcon);

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    if (i == (item.length -1)) {
      cel.classList.add('link-cell');
      linkElement.setAttribute('href',item[i]);
      cel.appendChild(linkElement);
    }
    else {
      cel.textContent = item[i];
    }
  }
  insertButton(row.insertCell(-1))
  document.getElementById("newProg").value = "";
  document.getElementById("newTipo").value = "";
  document.getElementById("newTemp").value = "";
  document.getElementById("newPlat").value = "";
  document.getElementById("newPais").value = "";
  document.getElementById("newTempDisp").value = "";
  document.getElementById("newDataLim").value = "";
  document.getElementById("newLink").value = "";

  removeElement()
}

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista do servidor via requisição DELETE
  (atrelado ao botão close)
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  for (var i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const nomeProg = div.getElementsByTagName('td')[0].innerHTML;
      const nomePlat = div.getElementsByTagName('td')[3].innerHTML;
      const nomePais = div.getElementsByTagName('td')[4].innerHTML;

      if (confirm("Você tem certeza?")) {

        let url = 'http://127.0.0.1:5000/disponibilidade?programa='+ nomeProg +'&plataforma='+ nomePlat +'&pais='+ nomePais;
        fetch(url, {
          method: 'delete'
        })
          .then((response) => {
            response.json();
            if (response.ok) {
              div.remove();
              alert(`${nomeProg} de ${nomePlat} ${nomePais} Removido!`);
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      }
    }
  }
}