const app = document.querySelector('.app');

const search = document.createElement('div');
search.classList.add('search');
app.append(search);

const input = document.createElement('input');
input.classList.add('input');
input.type = 'text';
input.placeholder = 'Поиск репозитория';
search.append(input);

const dropdownList = document.createElement('div');
dropdownList.classList.add('dropdown-list');
search.append(dropdownList);

const repoList = document.createElement('div');
repoList.classList.add('repo-list');
app.append(repoList);

let timer;

function debounce(func, delay) {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

async function getRepos(query) {
  input.addEventListener('keydown', (e) => {
    if (e.key === ' ' && input.value.trim() === '') {
      return;
    }
  });

  const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`);

  if (!response.ok) {
    console.error('Ошибка');
  }

  const res = await response.json();

  if (res.items) {
    return res.items;
  } else {
    return;
  }
}

function showDropdownList(repos) {
  dropdownList.innerHTML = '';

  if (repos.length === 0) {
    dropdownList.style.display = 'none';
    return;
  }

  repos.forEach((repo) => {
    const dropdownItem = document.createElement('div');
    dropdownItem.classList.add('dropdown-item');
    dropdownItem.textContent = repo.full_name;
    dropdownItem.dataset.repo = JSON.stringify(repo);
    dropdownList.append(dropdownItem);
  });

  dropdownList.style.display = 'block';
}

function addRepo(repo) {
  const repoItem = document.createElement('div');
  repoItem.classList.add('repo-item');

  const repoInfo = document.createElement('div');
  repoInfo.classList.add('repo-info');
  repoItem.append(repoInfo);

  function addRow(key, value) {
    const repoRow = document.createElement('span');
    repoRow.classList.add('repo-row');
    repoRow.textContent = `${key}: ${value}`;
    repoInfo.append(repoRow);
  }

  addRow('Name', repo.name);
  addRow('Owner', repo.owner.login);
  addRow('Stars', repo.stargazers_count);

  const removeRepo = document.createElement('button');
  removeRepo.classList.add('btn', 'repo-remove');
  repoItem.append(removeRepo);
  repoList.append(repoItem);
}

async function handleSearch() {
  const query = input.value.trim();

  if (query === '') {
    dropdownList.style.display = 'none';
    return;
  }

  const repos = await getRepos(query);
  showDropdownList(repos);
}

dropdownList.addEventListener('click', (e) => {
  if (e.target.classList.contains('dropdown-item')) {
    const repo = JSON.parse(e.target.dataset.repo);
    addRepo(repo);
    dropdownList.style.display = 'none';
    input.value = '';
    input.focus();
  }
});

repoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('repo-remove')) {
    e.target.closest('.repo-item').remove();
  }
});

input.addEventListener('input', debounce(handleSearch, 500));
