import { GithubUser } from "./GithubUser.js"

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      console.log('Passou')


      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      console.log('Passou 2')

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('#bookmark')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('#search')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()
    if(this.entries.length === 0) {
      this.addInitialScreen()
    } else {
      this.removeAllTr()
    }

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector('.profile img').src = `https://github.com/${user.login}.png`
      row.querySelector('.profile img').alt = `Imagem de ${user.name}`
      row.querySelector('.profile a').href = `https://github.com/${user.login}`
      row.querySelector('.profile .username').textContent = user.name
      row.querySelector('.profile a').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="profile">
        <img src=""></img>
        <div class="user-data">
            <p class="username"></p>
            <a href="" target="_blank"></a>
        </div>
      </td>
      <td>
          <span class="repositories"></span>
      </td>
      <td>
          <span class="followers"></span>
      </td>
      <td>
          <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })  
  }

  addInitialScreen() {
    const tbody = document.querySelector('tbody')
    tbody.innerHTML = `
      <tr class="no-favorites">
        <td>
            <img src="assets/estrela.svg" alt="Estrela">
            <p>Nenhum favorito ainda</p>
        </td>
      </tr>
    `
  }
}