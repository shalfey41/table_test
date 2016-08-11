(function() {
  'use strict';

  var ITEMS_ON_PAGE = 5; // Сколько столбцов показывать на странице

  loadFromBase(0);


  // Загрузка данных из базы и отрисовка таблицы
  function loadFromBase(pageFrom) {
    // Загружаем базу
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'js/data.json');

    xhr.timeout = 10000;

    xhr.onload = function(e) {
      var data = JSON.parse(e.target.response);

      loadTableInDom(data, pageFrom);
    };

    xhr.send();
  }


  // Строит и заполняет таблицу в памяти
  function fillTable(loadedData, pageFrom) {
    // Удаляем события, если есть
    var paginationList = document.querySelector('.pagination');
    if (paginationList !== null) {
      paginationList.removeEventListener('click', _setPaginationEvent);
    }

    // Очистка таблицы и пагинации, если есть
    if (document.getElementById('table') !== null) {
      document.getElementById('table').innerHTML = '';
    }

    var itemsFrom = pageFrom * ITEMS_ON_PAGE,
        itemsTo = itemsFrom + ITEMS_ON_PAGE;

    // Создаем фрагмент
    var fragment = document.createDocumentFragment(),
        table = document.createElement('table'),
        thead = document.createElement('thead'),
        tbody = document.createElement('tbody'),
        tr = document.createElement('tr'),
        td = document.createElement('td');

    // Добавляем стили к таблице и элементам
    table.classList.add('table');
    thead.classList.add('table__thead');
    tr.classList.add('table__row');

    // Заполняем шапку
    table.appendChild(thead);

    for (var i = 0; i < 4; i++) {
      var cloneTd = td.cloneNode();
      thead.appendChild(cloneTd);

      if (i == 0) {
        cloneTd.textContent = 'ФИО';
      } else if (i == 1) {
        cloneTd.textContent = 'Дата рождения';
      } else if (i == 2) {
        cloneTd.textContent = 'Средний балл';
      } else if (i == 3) {
        cloneTd.textContent = 'Курс';
      }
    }

    // Заполняем таблицу данными из базы
    table.appendChild(tbody);

    var showedDate = loadedData.slice(itemsFrom, itemsTo);

    showedDate.forEach(function(item) {
      var cloneTr = tr.cloneNode(),
          dataObject = Object.keys(item);

      for (var i = 0; i < dataObject.length; i++) {
        var cloneTd = td.cloneNode();

        cloneTr.appendChild(cloneTd);
        cloneTd.textContent = item[dataObject[i]];
      }

      tbody.appendChild(cloneTr);
    });

    fragment.appendChild(table);

    // Выводим пагинацию, если надо
    var getPagination = setPagination(ITEMS_ON_PAGE, loadedData);

    if (getPagination !== false) {
      fragment.appendChild(getPagination);

      var paginationItems = fragment.querySelectorAll('.pagination__item');

      paginationItems[pageFrom].classList.add('active');
    }

    return fragment;
  }


  // Строит пагинацию
  function setPagination(itemsOnPage, loadedData) {
    if (loadedData.length > itemsOnPage) {
      var paginationFragment = document.createDocumentFragment(),
          paginationList = document.createElement('ul'),
          paginationItem = document.createElement('li'),
          paginationCount = Math.ceil(loadedData.length / itemsOnPage);

      paginationList.classList.add('pagination');
      paginationItem.classList.add('pagination__item');

      for (var i = 0; i < paginationCount; i++) {
        var clonePaginationItem = paginationItem.cloneNode();

        clonePaginationItem.textContent = i + 1;

        paginationList.appendChild(clonePaginationItem);
      }

      paginationFragment.appendChild(paginationList);

      return paginationFragment;
    } else {
      return;
    }
  }


  // Берет таблицу из базы и заполняет DOM
  function loadTableInDom(loadedData, pageFrom) {
    var container = document.getElementById('table');

    // Строим и заполняем фрагмент
    var setFragment = fillTable(loadedData, pageFrom);

    // Загружаем фрагмент в DOM
    container.appendChild(setFragment);

    paginationEvents();
  }


  // События пагинации
  function paginationEvents() {
    var paginationList = document.querySelector('.pagination');

    paginationList.addEventListener('click', _setPaginationEvent);
  }


  // Обработка клика в пагинации
  function _setPaginationEvent(e) {
    var clickedElement = e.target,
        paginationItems = this.querySelectorAll('.pagination__item');

    paginationItems.forEach(function(item) {
      item.classList.remove('active');
    });

    if (clickedElement.classList.contains('pagination__item')) {
      loadFromBase(clickedElement.textContent - 1);
    }
  }
})();