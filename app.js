import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVqsEiXpc4-EnPsUBthzt4cDIbmN3evtU",
  authDomain: "applivros-1f310.firebaseapp.com",
  databaseURL: "https://applivros-1f310-default-rtdb.firebaseio.com",
  projectId: "applivros-1f310",
  storageBucket: "applivros-1f310.firebasestorage.app",
  messagingSenderId: "392816171603",
  appId: "1:392816171603:web:6e60b4ef3a4d770b2f44a6",
  measurementId: "G-6DQ1VPENZ0"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dadosRef = ref(db, "alunos");

const form = document.getElementById("formNomes");
const nomeInput = document.getElementById("nome");
const areaNomes = document.getElementById("areaNomes");
const result = document.getElementById("result");
const sortearBtn = document.getElementById("sortear");

let users = [];

function lerDados() {
  onValue(dadosRef, snapshot => {
    const data = snapshot.val() || {};
    areaNomes.innerHTML = "";
    users = [];

    Object.entries(data).forEach(([id, valor]) => {
      users.push({ id, nome: valor.nome });

      const li = document.createElement("li");
      li.textContent = `Nome: ${valor.nome}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "x";
      delBtn.style.marginLeft = "8px";
      delBtn.addEventListener("click", () => {
        const noRef = ref(db, `alunos/${id}`);
        remove(noRef)
          .then(() => result.innerText = "Usuário excluído com sucesso!")
          .catch(err => result.innerText = "Erro ao excluir: " + err.message);
      });

      li.appendChild(delBtn);
      areaNomes.appendChild(li);
    });
  }, error => {
    result.innerText = "Erro ao ler dados: " + error.message;
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const nome = nomeInput.value.trim();
  if (!nome) {
    result.innerText = "Digite um nome válido.";
    return;
  }
  const novoRef = push(dadosRef);
  set(novoRef, { nome })
    .then(() => {
      result.innerText = "Dado adicionado com sucesso!";
      nomeInput.value = "";
    })
    .catch(error => {
      result.innerText = "Erro ao adicionar: " + error.message;
    });
});

sortearBtn.addEventListener("click", () => {
  if (users.length === 0) {
    result.innerText = "Nenhum nome para sortear.";
    return;
  }
  const sorteadosAntigos = JSON.parse(localStorage.getItem("sorteados") || "[]");

  if (sorteadosAntigos.length >= users.length) {
    result.innerText = "Todos os nomes já foram sorteados!";
    return;
  }
  const nomesDisponiveis = users.filter(u => !sorteadosAntigos.includes(u.id));

  const sorteados = [];

  while (sorteados.length < 4 && nomesDisponiveis.length > 0) {
    const idx = Math.floor(Math.random() * nomesDisponiveis.length);
    const selecionado = nomesDisponiveis.splice(idx, 1)[0];

    sorteados.push(selecionado);
    sorteadosAntigos.push(selecionado.id);
  }
  localStorage.setItem("sorteados", JSON.stringify(sorteadosAntigos));

  if (sorteados.length === 0) {
    result.innerText = "Nenhum nome sorteado.";
  } else {
    result.innerText = "Nomes sorteados:\n" + sorteados.map(s => s.nome).join("\n");
  }
});

lerDados();
