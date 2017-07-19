document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a[data-source]')
  const main = document.querySelector('.main')
  const searchPrompt = document.querySelector('.prompt')

  links.forEach(link => {
    link.addEventListener('click', event => {
      const url = event.target.dataset.source
      fetch(`recipies/${url}`)
        .then(response => response.json())
        .then(({ name, ingredients, method }) => {
          main.innerHTML = `
            <div class="recipe">
              <h1>${name}</h1>
              <ul>
                ${ingredients
                  .map(({ name, amount }) => `<li>${amount} ${name}</li>`)
                  .join('')
                }
              </ul>
              <ul>
                ${method
                  .map(instruction => `<li>${instruction}</li>`)
                  .join('')
                }
              </ul>
            </div>
          `
        })

      searchPrompt.value = ''
      links.forEach(link => {
        link.classList.remove('active')
        link.style.display = ''
      })
      event.target.classList.add('active')
      $('.sidebar.menu').sidebar('hide')
    })
  })

  searchPrompt.addEventListener('input', event => {
    const searchInput = event.target.value.toLowerCase()

    links.forEach(link => {
      if (!link.innerHTML.toLowerCase().includes(searchInput)) {
        link.style.display = 'none'
      } else {
        link.style.display = ''
      }
    })
  })

  document.querySelector('.top.menu').addEventListener('click', () => {
    $('.sidebar.menu').sidebar('toggle')
  })
})
